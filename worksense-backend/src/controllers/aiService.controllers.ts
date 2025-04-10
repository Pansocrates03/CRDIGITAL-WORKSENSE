import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { generateItemWithAI } from "../service/aiService.js";
import { Timestamp } from "firebase-admin/firestore";
import { sqlConnect, sql } from "../models/sqlModel.js";

// 🔧 Normalize priority
function normalizePriority(priority: string): string {
  const allowed = ["lowest", "low", "medium", "high", "highest"];
  const lower = priority.toLowerCase();
  return allowed.includes(lower) ? lower : "medium";
}

// 🔍 Parse AI response
function parseIAResponse(text: string): any {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  if (lines.length === 0) return null;

  const epic = {
    name: "",
    description: "",
    tag: "epic",
    status: "to do",
    priority: "medium",
    items: [],
  };

  let currentItem: any = epic;
  let currentStory: any = null;

  for (const line of lines) {
    const clean = line.replace(/\*\*/g, "").trim();

    // EPIC
    if (/epic:/i.test(clean)) {
      epic.name = clean.replace(/.*epic:/i, "").trim();
      currentItem = epic;

    // USER STORY
    } else if (/user story/i.test(clean)) {
      if (currentStory) epic.items.push(currentStory);
      currentStory = {
        name: clean.replace(/[-*]\s*/, ""),
        description: "",
        tag: "user-story",
        status: "to do",
        priority: "medium",
        items: [],
      };
      currentItem = currentStory;

    // TASK
    } else if (/task/i.test(clean)) {
      const task = {
        name: clean.replace(/[-*]\s*/, ""),
        description: "",
        tag: "task",
        status: "to do",
        priority: "medium",
      };
      if (currentStory) currentStory.items.push(task);
      currentItem = task;

    // DESCRIPTION
    } else if (/description:/i.test(clean)) {
      const desc = clean.replace(/.*description:/i, "").trim();
      if (currentItem) currentItem.description = desc;

    // PRIORITY
    } else if (/priority:/i.test(clean)) {
      const priority = normalizePriority(clean.replace(/.*priority:/i, "").trim());
      if (currentItem) currentItem.priority = priority;
    }
  }

  // Push final story if any
  if (currentStory) epic.items.push(currentStory);

  return epic.name && epic.items.length > 0 ? epic : null;
}

// Recursively apply fields
function applyCustomFields(item: any) {
  item.status = item.status?.toLowerCase() || "to do";
  item.priority = normalizePriority(item.priority || "medium");
  if (!item.description) item.description = "AI-generated content";

  if (item.items && Array.isArray(item.items)) {
    item.items.forEach(applyCustomFields);
  }
}

export const generateEpic = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const userId = (req as any).user?.userId;
  let authorName = "Unknown";

  try {
    // 🔍 Buscar nombre del usuario en SQL
    if (userId) {
      const pool = await sqlConnect();
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .execute("spGetUserById");

      const user = result.recordset[0];
      if (user) {
        authorName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      }
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectSnap.data();
    if (!project?.name || !project?.description) {
      return res.status(400).json({ error: "Project must have a name and description" });
    }

    const itemsRef = projectRef.collection("items");

    const existingEpicsSnap = await itemsRef.where("tag", "==", "epic").get();
    const existingEpicNames = existingEpicsSnap.docs.map(doc => doc.data().name).filter(Boolean);
    const epicExclusionList = existingEpicNames.length
      ? `Avoid repeating or generating epics with these titles: ${existingEpicNames.join(", ")}.`
      : "";

      const prompt = `
Generate ONE epic with at least two user stories, and each user story with at least one task.

For each item (epic, user story, task), include:
- A clear **name** (start with "Epic:", "User Story:", or "Task:")
- A **short description** (1–2 sentences), starting with "Description:"
- A **priority level**, starting with "Priority:" (choose from: lowest, low, medium, high, highest)

The project is called "{projectName}", and it is described as: "{projectDescription}".

${epicExclusionList}

Return the response using bullet-point Markdown format. Example:

- **Epic:** Name
  - **Description:** Some short description
  - **Priority:** medium
  - **User Story:** Name
    - **Description:** ...
    - **Priority:** ...
    - **Task:** Name
      - **Description:** ...
      - **Priority:** ...
`;


    const payload = {
      prompt,
      data: {
        projectName: project.name,
        projectDescription: project.description,
      },
    };

    const generated = await generateItemWithAI(payload);
    const rawText = generated.data;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "AI did not return a valid structure" });
    }

    const structuredData = parseIAResponse(rawText);
    if (!structuredData?.name || !structuredData?.items?.length) {
      return res.status(400).json({ error: "AI output could not be parsed correctly" });
    }

    const duplicate = await itemsRef
      .where("tag", "==", "epic")
      .where("name", "==", structuredData.name)
      .get();

    if (!duplicate.empty) {
      return res.status(409).json({
        error: `An epic named "${structuredData.name}" already exists in this project.`,
      });
    }

    applyCustomFields(structuredData);

    const saveItemRecursively = async (
      item: any,
      parentRef: FirebaseFirestore.CollectionReference,
      projectID: string
    ) => {
      const docRef = parentRef.doc();

      const itemData = {
        projectID,
        name: item.name || "Untitled Item",
        description: item.description || "AI-generated content",
        tag: item.tag || "default",
        status: item.status || "default",
        priority: item.priority || "default",
        size: 0,
        author: authorName,
        authorId: userId || null,
        asignee: Array.isArray(item.assignee) ? item.assignee : [],
        acceptanceCriteria: Array.isArray(item.acceptanceCriteria)
          ? item.acceptanceCriteria
          : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await docRef.set(itemData);

      const subItemsRef = docRef.collection("items");
      if (item.items && Array.isArray(item.items) && item.items.length > 0) {
        for (const child of item.items) {
          await saveItemRecursively(child, subItemsRef, projectID);
        }
      } else {
        await subItemsRef.doc("emptyDoc").set({ placeholder: "empty" });
      }

      const commentsRef = docRef.collection("comments");
      if (item.comments && Array.isArray(item.comments) && item.comments.length > 0) {
        for (const comment of item.comments) {
          const commentRef = commentsRef.doc();
          await commentRef.set({
            commentID: commentRef.id,
            text: comment.text || "",
            author: comment.author || userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        await commentsRef.doc("emptyDoc").set({ placeholder: "empty" });
      }
    };

    await saveItemRecursively(structuredData, itemsRef, projectId);

    res.status(201).json({ message: "Epic generated and saved successfully." });

  } catch (error: any) {
    console.error("Error generating items:", error);
    res.status(500).json({ error: error.message || "Internal server error while generating epic." });
  }
};
