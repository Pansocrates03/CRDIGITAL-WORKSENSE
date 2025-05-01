import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

interface BulkProjectData {
  project: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    context?: {
      techStack?: string[];
      objectives?: string;
    };
  };
  members: Array<{
    userId: string;
    roleId: string;
  }>;
  backlogItems: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    epicId?: string;
    storyPoints?: number;
    severity?: string;
    linkedStoryId?: string;
    content?: string;
    tags?: string[];
  }>;
  sprints: Array<{
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  }>;
}

export const createBulkProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bulkData: BulkProjectData = req.body;
    const userId = Number(req.user?.userId);

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const batch = db.batch();

    // 1. Create Project
    const projectRef = db.collection("projectss").doc();
    const projectData = {
      name: bulkData.project.name.trim(),
      description: bulkData.project.description || null,
      ownerId: userId,
      context: bulkData.project.context || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(projectRef, projectData);
    const projectId = projectRef.id;

    // 2. Add Members
    for (const member of bulkData.members) {
      const memberRef = projectRef
        .collection("members")
        .doc(String(member.userId));
      const memberData = {
        userId: Number(member.userId),
        projectRoleId: member.roleId,
        joinedAt: FieldValue.serverTimestamp(),
      };
      batch.set(memberRef, memberData);
    }

    // 3. Create Backlog Items
    const backlogItemIds: string[] = [];
    const backlogItemsByType: { [key: string]: any[] } = {};

    // Group items by type
    for (const item of bulkData.backlogItems) {
      if (!backlogItemsByType[item.type]) {
        backlogItemsByType[item.type] = [];
      }
      backlogItemsByType[item.type].push(item);
    }

    // Create items in their respective collections
    for (const [type, items] of Object.entries(backlogItemsByType)) {
      const collectionName =
        type === "epic"
          ? "epics"
          : type === "story"
          ? "stories"
          : type === "bug"
          ? "bugs"
          : type === "techTask"
          ? "techTasks"
          : "knowledge";

      const collectionRef = projectRef
        .collection("backlog")
        .doc("items")
        .collection(collectionName);

      for (const item of items) {
        const itemRef = collectionRef.doc();
        const baseItemData = {
          title: item.title,
          description: item.description || null,
          projectId,
          type,
          reporterId: userId,
          priority: item.priority || "medium",
          status: type === "bug" ? "new" : "todo",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        let itemData = baseItemData;

        if (type === "story") {
          itemData = {
            ...baseItemData,
            epicId: item.epicId || null,
            storyPoints: item.storyPoints || null,
          };
        } else if (type === "bug") {
          itemData = {
            ...baseItemData,
            severity: item.severity || "major",
            linkedStoryId: item.linkedStoryId || null,
          };
        } else if (type === "techTask") {
          itemData = {
            ...baseItemData,
            linkedStoryId: item.linkedStoryId || null,
          };
        } else if (type === "knowledge") {
          itemData = {
            ...baseItemData,
            content: item.content || "",
            tags: item.tags || null,
          };
        }

        batch.set(itemRef, itemData);
        backlogItemIds.push(itemRef.id);
      }
    }

    // 4. Create Sprints
    const sprintIds: string[] = [];
    for (const sprint of bulkData.sprints) {
      const sprintRef = db.collection("sprints").doc();
      const sprintData = {
        ...sprint,
        projectId,
        status: sprintIds.length === 0 ? "Active" : "Planned",
        startDate: Timestamp.fromDate(new Date(sprint.startDate)),
        endDate: Timestamp.fromDate(new Date(sprint.endDate)),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      batch.set(sprintRef, sprintData);
      sprintIds.push(sprintRef.id);
    }

    // 5. Create Tasks for First Sprint
    if (sprintIds.length > 0 && backlogItemIds.length > 0) {
      const firstSprintId = sprintIds[0];
      for (let i = 0; i < backlogItemIds.length; i++) {
        const itemId = backlogItemIds[i];
        const item = bulkData.backlogItems[i];

        const taskRef = db.collection("tasks").doc();
        const taskData = {
          projectId,
          sprintId: firstSprintId,
          backlogId: itemId,
          title: item.title,
          status: "todo",
          priority: item.priority,
          type: item.type,
          assignees: [],
          subtasksCompleted: 0,
          subtasksTotal: 0,
          order: (i + 1) * 1000,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        batch.set(taskRef, taskData);
      }
    }

    await batch.commit();

    res.status(201).json({
      message: "Bulk project creation successful",
      projectId,
      sprintIds,
      backlogItemIds,
    });
  } catch (error) {
    console.error("Error in bulk project creation:", error);
    res.status(500).json({ message: "Failed to create bulk project", error });
  }
};
