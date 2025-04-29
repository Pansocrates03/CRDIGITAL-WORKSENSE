import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import { generateEpicsWithFrida } from "../service/aiService.js";
import { parseIAResponse } from "../utils/parseIAResponse.js";
import { getItemCollection } from "../utils/helpers/firestoreHelpers.js";
import { FieldValue } from "firebase-admin/firestore";
import { Priority } from "../../types/backlog.js";

// ----------------  Generate ----------------
export async function generateEpicHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ message: "Project ID required" });

    const projectSnap = await db.collection("projectss").doc(projectId).get();
    if (!projectSnap.exists)
      return res.status(404).json({ message: "Project not found" });
    const { name, description } = projectSnap.data() as any;

    const raw = await generateEpicsWithFrida({
      projectName: name,
      projectDescription: description,
    });
    const suggestions = parseIAResponse(raw);

    // Filtra duplicados por título.
    const existingTitles = new Set(
      (await getItemCollection(projectId, "epic").get()).docs.map(
        (d) => d.data().title
      )
    );
    const unique = suggestions.filter((s) => !existingTitles.has(s.name));

    return res.json({ epics: unique });
  } catch (err) {
    next(err);
  }
}

// ----------------  Confirm ----------------
interface ConfirmedEpicDto {
  name: string;
  description: string | null;
  priority: Priority;
}

export async function confirmEpicsHandler(
  req: Request<{ projectId: string }, any, { epics: ConfirmedEpicDto[] }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const { epics } = req.body;
    if (!projectId)
      return res.status(400).json({ message: "Project ID required" });
    if (!Array.isArray(epics) || !epics.length)
      return res.status(400).json({ message: "No epics provided" });

    const col = getItemCollection(projectId, "epic");
    const existingTitles = new Set(
      (await col.get()).docs.map((d) => d.data().title)
    );

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    epics.forEach((e) => {
      if (!e.name || existingTitles.has(e.name)) return; // skip dupes / empty
      batch.set(col.doc(), {
        projectId,
        type: "epic",
        title: e.name.trim(),
        description: e.description,
        priority: e.priority,
        status: "new",
        reporterId: req.user?.userId ?? null,
        assigneeId: null,
        linkedItems: null,
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
    res.status(201).json({ message: "Epics saved" });
  } catch (err) {
    next(err);
  }
}
