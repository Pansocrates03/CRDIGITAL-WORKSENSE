import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.model.js";
import {
  generateEpicsWithFrida,
  generateStoriesWithFrida,
} from "../service/aiService.js";
import {
  parseIAResponse,
  parseStoriesResponse,
  ParsedStorySuggestion,
} from "../utils/parseIAResponse.js";
import { FieldValue } from "firebase-admin/firestore";
import { BacklogItemData } from "../../types/backlog.js";
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

    const projectSnap = await db.collection("projects").doc(projectId).get();
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
      (
        await db
          .collection("projects")
          .doc(projectId)
          .collection("backlog")
          .get()
      ).docs.map((d) => d.data().title)
    );
    const unique = suggestions.filter((s) => !existingTitles.has(s.name));

    return res.json({ epics: unique });
  } catch (err) {
    next(err);
  }
}

export async function generateStoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const { epicId } = req.body;
    if (!projectId || !epicId) {
      return res
        .status(400)
        .json({ message: "Project ID and epic ID required" });
    }
    // Validate Project
    const projectSnap = await db.collection("projects").doc(projectId).get();
    if (!projectSnap.exists) {
      return res.status(404).json({ message: "Project not found" });
    }
    const { name: projectName, description: projectDescription } =
      projectSnap.data() as any;

    // Validate Epic
    const epicCol = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(epicId);
    const epicDoc = await epicCol.get();
    if (!epicDoc.exists)
      return res.status(404).json({ message: "Epic not found" });
    const epicData = epicDoc.data() as any;

    const raw = await generateStoriesWithFrida({
      projectName,
      projectDescription,
      epicName: epicData.name,
      epicDescription: epicData.description || "",
    });
    const suggestions: ParsedStorySuggestion[] = parseStoriesResponse(raw);

    // Filter duplicates by title
    const existingTitles = new Set(
      (await epicCol.collection("subitems").get()).docs.map(
        (d) => d.data().name
      )
    );
    const unique = suggestions.filter((s) => !existingTitles.has(s.name));

    return res.json({ stories: unique });
  } catch (err) {
    next(err);
  }
}

// ----------------  Confirm ----------------
interface ConfirmedEpicDto {
  name: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  acceptanceCriteria?: string[] | null;
  assigneeId?: number | null;
  authorId?: number | null;
  coverImage?: string | null;
  status?: "new" | "toDo" | "inProgress" | "inReview" | "done" | null;
  size?: "XS" | "S" | "M" | "L" | "XL" | null;
  sprint?: string | null;
  type?: "epic" | "story" | "bug" | "techTask" | "knowledge" | null;
}

interface ConfirmedStoryDto {
  name: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  size?: "XS" | "S" | "M" | "L" | "XL" | null;
  parentId?: string | null;
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

    const backlogRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog");
    const existingTitles = new Set(
      (await backlogRef.where("type", "==", "epic").get()).docs.map(
        (d) => d.data().name
      )
    );

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    epics.forEach((e) => {
      if (!e.name || existingTitles.has(e.name)) return; // skip dupes / empty

      const epicData: BacklogItemData = {
        name: e.name.trim(),
        description: e.description,
        priority: e.priority,
        status: e.status || "new",
        type: "epic",
        acceptanceCriteria: e.acceptanceCriteria ?? null,
        assigneeId: e.assigneeId ?? null,
        authorId: e.authorId ?? null,
        coverImage: e.coverImage ?? null,
        size: e.size ?? null,
        sprint: e.sprint ?? null,
      };

      batch.set(backlogRef.doc(), {
        ...epicData,
        projectId,
        authorId: req.user?.userId ?? null,
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

export async function confirmStoriesHandler(
  req: Request<
    { projectId: string },
    any,
    { epicId: string; stories: ConfirmedStoryDto[] }
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const { epicId, stories } = req.body;
    if (!projectId || !epicId)
      return res
        .status(400)
        .json({ message: "Project ID and epic ID required" });
    if (!Array.isArray(stories) || !stories.length)
      return res.status(400).json({ message: "No stories provided" });

    // Validate Project and Epic
    const projectSnap = await db.collection("projects").doc(projectId).get();
    if (!projectSnap.exists)
      return res.status(404).json({ message: "Project not found" });

    const epicRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(epicId);
    const epicDoc = await epicRef.get();
    if (!epicDoc.exists)
      return res.status(404).json({ message: "Epic not found" });

    // Prepare batch
    const subItemsRef = epicRef.collection("subitems");
    const existingTitles = new Set(
      (await subItemsRef.get()).docs.map((d) => d.data().name)
    );
    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    stories.forEach((st) => {
      if (!st.name || existingTitles.has(st.name)) return; // skip dupes / empty

      const storyData: BacklogItemData = {
        name: st.name.trim(),
        description: st.description,
        priority: st.priority,
        status: "new",
        type: "story",
        assigneeId: null,
        size: st.size ?? null,
        parentId: epicId,
      };

      batch.set(subItemsRef.doc(), {
        ...storyData,
        projectId,
        authorId: req.user?.userId ?? null,
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
    res.status(201).json({ message: "Stories saved" });
  } catch (err) {
    next(err);
  }
}