// controllers/backlogController.ts
import { Request, Response, NextFunction } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../models/firebase.js";

interface BacklogItem {
  acceptanceCriteria?: string[] | null;
  assigneeId?: number | null;
  authorId?: number | null;
  coverImage?: string | null;
  description?: string | null;
  name?: string | null;
  priority?: "high" | "medium" | "low" | null;
  size?: "xs" | "s" | "m" | "l" | "xl" | null;
  sprint?: string | null;
  type?: "epic" | "story" | "bug" | "techTask" | "knowledge" | null;
}

const ALL_ITEM_TYPES = ["epic", "story", "bug", "techTask", "knowledge"];

/**
 * Create a new backlog item
 */
export const createBacklogItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const item: BacklogItem = req.body;
    const reporterId = req.user?.userId;

    console.log("item recived", item);

    if (!reporterId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    } else if (!item.type) {
      res.status(400).json({ message: "Type required" });
      return;
    } else if (!item.name) {
      res.status(400).json({ message: "Name required" });
      return;
    }

    const collectionRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog");

    const newItemRef = await collectionRef.add(item);
    res.status(201).json({ id: newItemRef.id, ...item });
  } catch (error: any) {
    if (error.message?.includes("Invalid backlog item type")) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * List backlog items for a project
 */
export const listBacklogItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const typesQuery = req.query.type as string;

    const requestedTypes = typesQuery
      ? typesQuery.split(",").filter((t) => ALL_ITEM_TYPES.includes(t))
      : ALL_ITEM_TYPES;

    if (requestedTypes.length === 0) {
      res.status(400).json({ message: "Invalid item types" });
      return;
    }

    // Fetch items from all requested types
    const promises = requestedTypes.map(async (type) => {
      try {
        const collectionRef = db
          .collection("projects")
          .doc(projectId)
          .collection("backlog");
        const snapshot = await collectionRef
          .where("projectId", "==", projectId)
          .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        return [];
      }
    });

    const results = await Promise.all(promises);
    res.status(200).json(results.flat());
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific backlog item
 */
export const getBacklogItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId } = req.params;
    const itemType = req.query.type as string;

    if (!itemType) {
      res.status(400).json({ message: "Type parameter required" });
      return;
    }

    const itemRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(itemId);
    const docSnap = await itemRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: any) {
    if (error.message?.includes("Invalid backlog item type")) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Update a backlog item
 */
export const updateBacklogItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId } = req.params;
    const itemType = req.query.type as string;
    const updateData = req.body;

    if (!itemType) {
      res.status(400).json({ message: "Type parameter required" });
      return;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No update data provided" });
      return;
    }

    const itemRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(itemId);
    const docSnap = await itemRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    // Prepare update data
    const dataToUpdate = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Prevent changing immutable fields
    delete dataToUpdate.projectId;
    delete dataToUpdate.type;
    delete dataToUpdate.reporterId;
    delete dataToUpdate.createdAt;

    await itemRef.update(dataToUpdate);

    const updatedDoc = await itemRef.get();
    res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error: any) {
    if (error.message?.includes("Invalid backlog item type")) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Delete a backlog item
 */
export const deleteBacklogItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId } = req.params;
    const itemType = req.query.type as string;

    if (!itemType) {
      res.status(400).json({ message: "Type parameter required" });
      return;
    }

    const itemRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(itemId);
    const docSnap = await itemRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    await itemRef.delete();
    res.status(200).json({ message: "Item deleted", id: itemId });
  } catch (error: any) {
    if (error.message?.includes("Invalid backlog item type")) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};
