// controllers/backlogController.ts
import { Request, Response, NextFunction } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../models/firebase.js";
import { sqlConnect, sql } from "../models/sqlModel.js";
import {
  awardPoints,
  calculateTaskPoints,
  deductPoints,
} from "../service/gamificationService.js";

interface BacklogItem {
  acceptanceCriteria?: string[] | null;
  assigneeId?: number | null;
  authorId?: number | null;
  coverImage?: string | null;
  description?: string | null;
  name?: string | null;
  priority?: "high" | "medium" | "low" | null;
  size?: "XS" | "S" | "M" | "L" | "XL" | null;
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

export const createSubItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId } = req.params;
    const item: BacklogItem = req.body;
    const authorId = req.user?.userId;

    if (!authorId) {
      res.status(401).json({ message: "Authentication required" });
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

    const newItemRef = await itemRef.collection("subitems").add(item);
    res.status(201).json({ id: newItemRef.id, ...item });
  } catch (error) {
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

    // Query the collection once
    const collectionRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog");

    // Get all items for the project
    const snapshot = await collectionRef
      .where("projectId", "==", projectId)
      .get();

    // Process items and fetch subItems
    const itemsWithSubItems = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const itemData = { id: doc.id, ...doc.data() } as BacklogItem & {
          id: string;
        };

        // Only include items of requested types
        if (!requestedTypes.includes(itemData.type || "")) {
          return null;
        }

        // Only fetch subItems for epics
        if (itemData.type === "epic") {
          const subItemsSnapshot = await doc.ref.collection("subitems").get();
          const subItems = subItemsSnapshot.docs.map((subDoc) => {
            const subItemData = {
              id: subDoc.id,
              ...subDoc.data(),
            } as BacklogItem & {
              id: string;
            };
            return subItemData;
          });
          return { ...itemData, subItems };
        }

        return itemData;
      })
    );

    // Filter out null items and return the results
    res.status(200).json(itemsWithSubItems.filter((item) => item !== null));
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
// Add these imports at the top
// Modify your existing updateBacklogItem function
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

    // Get the current item data to check status change
    const currentItemData = docSnap.data();
    const oldStatus = currentItemData?.status;
    const newStatus = updateData.status;

    // Normalize status values for case-insensitive comparison
    const oldStatusNorm = (oldStatus || '').toLowerCase().trim();
    const newStatusNorm = (newStatus || '').toLowerCase().trim();

    // Prepare update data
    let dataToUpdate = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    };
    // If status is being set to 'done', always update updatedAt
    if (newStatusNorm === 'done') {
      dataToUpdate.updatedAt = FieldValue.serverTimestamp();
    }

    // Prevent changing immutable fields
    delete dataToUpdate.projectId;
    delete dataToUpdate.type;
    delete dataToUpdate.reporterId;
    delete dataToUpdate.createdAt;

    await itemRef.update(dataToUpdate);

    // In your backlogController.ts, update the gamification section:
    console.log('Backlog update:', { oldStatus, newStatus, assigneeId: currentItemData?.assigneeId });

    // *** GAMIFICATION LOGIC WITH TOAST DATA ***
    if (oldStatusNorm !== "done" && newStatusNorm === "done") {
      console.log('AWARD block hit');
      try {
        // Get the assignee's ID from the current item data
        const assigneeId = currentItemData?.assigneeId;

        if (assigneeId) {
          // Get user info for leaderboard
          const pool = await sqlConnect();
          let userName = "Unknown User";

          if (pool) {
            const userResult = await pool
              .request()
              .input("UserId", sql.Int, assigneeId)
              .execute("spGetUserById");

            if (userResult.recordset.length > 0) {
              const user = userResult.recordset[0];
              userName = `${user.firstName} ${user.lastName}`;

              // Store assignee info in the item for future activity queries
              await itemRef.update({
                assigneeId: assigneeId,
                assigneeName: userName,
                completedAt: FieldValue.serverTimestamp(),
              });
            }
          }

          // Calculate and award points
          const pointsToAward = calculateTaskPoints({
            type: currentItemData?.type,
            size: currentItemData?.size,
          });

          const gamificationResult = await awardPoints({
            userId: assigneeId,
            projectId,
            action: "item_completion",
            taskType: currentItemData?.type,
            points: pointsToAward,
            userName,
          });

          console.log(
            `🎉 Awarded ${pointsToAward} points to assignee ${assigneeId} for completing ${itemType} ${itemId}`
          );

          // Return toast data in response
          const updatedDoc = await itemRef.get();
          return res.status(200).json({
            id: updatedDoc.id,
            ...updatedDoc.data(),
            // Toast notification data
            toast: {
              type: "success",
              points: pointsToAward,
              newBadges: gamificationResult.newBadges || [],
              totalPoints: gamificationResult.totalPoints,
              level: gamificationResult.level,
              assigneeId: assigneeId,
            },
          });
        }
      } catch (gamificationError) {
        console.error(
          "⚠️ Gamification error (item status still updated):",
          gamificationError
        );
      }
    } else if (oldStatusNorm === "done" && newStatusNorm !== "done") {
     
      try {
        // Get the assignee's ID from the current item data
        const assigneeId = currentItemData?.assigneeId;

        if (assigneeId) {
          // Get user info for leaderboard
          const pool = await sqlConnect();
          let userName = "Unknown User";

          if (pool) {
            const userResult = await pool
              .request()
              .input("UserId", sql.Int, assigneeId)
              .execute("spGetUserById");

            if (userResult.recordset.length > 0) {
              const user = userResult.recordset[0];
              userName = `${user.firstName} ${user.lastName}`;
            }
          }

          // Calculate and deduct points
          const pointsToDeduct = calculateTaskPoints({
            type: currentItemData?.type,
            size: currentItemData?.size,
          });

          const gamificationResult = await deductPoints({
            userId: assigneeId,
            projectId,
            action: "item_uncompletion",
            taskType: currentItemData?.type,
            points: -pointsToDeduct,
            userName,
          });

          console.log(
            `📉 Deducted ${pointsToDeduct} points from assignee ${assigneeId} for uncompleting ${itemType} ${itemId}`
          );

          // Return toast data in response
          const updatedDoc = await itemRef.get();
          return res.status(200).json({
            id: updatedDoc.id,
            ...updatedDoc.data(),
            // Toast notification data
            toast: {
              type: "warning",
              points: -pointsToDeduct,
              totalPoints: gamificationResult.totalPoints,
              level: gamificationResult.level,
              assigneeId: assigneeId,
            },
          });
        }
      } catch (gamificationError) {
        console.error(
          "⚠️ Gamification error (item status still updated):",
          gamificationError
        );
      }
    } else {
      console.log('NO block hit');
    }

    // Regular response if no gamification
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

    if (!ALL_ITEM_TYPES.includes(itemType)) {
      res.status(400).json({ message: "Invalid backlog item type" });
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

/**
 * Get subitems for a backlog item
 */
export const getSubItems = async (
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

    const subItems = await itemRef.collection("subitems").get();
    res
      .status(200)
      .json(subItems.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a subitem
 */
export const deleteSubItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId, subItemId } = req.params;

    if (!subItemId) {
      res.status(400).json({ message: "Subitem ID parameter required" });
      return;
    }

    const itemRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(itemId)
      .collection("subitems")
      .doc(subItemId);
    const docSnap = await itemRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ message: "Subitem not found" });
      return;
    }

    await itemRef.delete();
    res.status(200).json({ message: "Subitem deleted", id: subItemId });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a subitem
 */
export const updateSubItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId, subItemId } = req.params;
    const updateData = req.body;

    if (!subItemId) {
      res.status(400).json({ message: "Subitem ID parameter required" });
      return;
    }

    const itemRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(itemId)
      .collection("subitems")
      .doc(subItemId);
    const docSnap = await itemRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ message: "Subitem not found" });
      return;
    }

    // Get the current subitem data to check status change
    const currentItemData = docSnap.data();
    const oldStatus = currentItemData?.status;
    const newStatus = updateData.status;

    // Normalize status values for case-insensitive comparison
    const oldStatusNorm = (oldStatus || '').toLowerCase().trim();
    const newStatusNorm = (newStatus || '').toLowerCase().trim();

    // Prepare update data
    let dataToUpdate = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (newStatusNorm === 'done') {
      dataToUpdate.updatedAt = FieldValue.serverTimestamp();
    }

    // Prevent changing immutable fields
    delete dataToUpdate.projectId;
    delete dataToUpdate.type;
    delete dataToUpdate.reporterId;
    delete dataToUpdate.createdAt;

    await itemRef.update(dataToUpdate);

    // Gamification logic for subitems
    console.log('Subitem update:', { oldStatus, newStatus, assigneeId: currentItemData?.assigneeId });

    if (oldStatusNorm !== "done" && newStatusNorm === "done") {
      console.log('SUBITEM AWARD block hit');
      try {
        const assigneeId = currentItemData?.assigneeId;
        if (assigneeId) {
          // Get user info for leaderboard
          const pool = await sqlConnect();
          let userName = "Unknown User";
          if (pool) {
            const userResult = await pool
              .request()
              .input("UserId", sql.Int, assigneeId)
              .execute("spGetUserById");
            if (userResult.recordset.length > 0) {
              const user = userResult.recordset[0];
              userName = `${user.firstName} ${user.lastName}`;
              await itemRef.update({
                assigneeId: assigneeId,
                assigneeName: userName,
                completedAt: FieldValue.serverTimestamp(),
              });
            }
          }
          // Calculate and award points
          const pointsToAward = calculateTaskPoints({
            type: currentItemData?.type,
            size: currentItemData?.size,
          });
          const gamificationResult = await awardPoints({
            userId: assigneeId,
            projectId,
            action: "subitem_completion",
            taskType: currentItemData?.type,
            points: pointsToAward,
            userName,
          });
          console.log(
            `🎉 Awarded ${pointsToAward} points to assignee ${assigneeId} for completing subitem ${subItemId}`
          );
          const updatedDoc = await itemRef.get();
          return res.status(200).json({
            id: updatedDoc.id,
            ...updatedDoc.data(),
            toast: {
              type: "success",
              points: pointsToAward,
              newBadges: gamificationResult.newBadges || [],
              totalPoints: gamificationResult.totalPoints,
              level: gamificationResult.level,
              assigneeId: assigneeId,
            },
          });
        }
      } catch (gamificationError) {
        console.error(
          "⚠️ Subitem gamification error (status still updated):",
          gamificationError
        );
      }
    } else if (oldStatusNorm === "done" && newStatusNorm !== "done") {
      console.log('SUBITEM DEDUCT block hit');
      try {
        const assigneeId = currentItemData?.assigneeId;
        if (assigneeId) {
          // Get user info for leaderboard
          const pool = await sqlConnect();
          let userName = "Unknown User";
          if (pool) {
            const userResult = await pool
              .request()
              .input("UserId", sql.Int, assigneeId)
              .execute("spGetUserById");
            if (userResult.recordset.length > 0) {
              const user = userResult.recordset[0];
              userName = `${user.firstName} ${user.lastName}`;
            }
          }
          // Calculate and deduct points
          const pointsToDeduct = calculateTaskPoints({
            type: currentItemData?.type,
            size: currentItemData?.size,
          });
          const gamificationResult = await deductPoints({
            userId: assigneeId,
            projectId,
            action: "subitem_uncompletion",
            taskType: currentItemData?.type,
            points: -pointsToDeduct,
            userName,
          });
          console.log(
            `📉 Deducted ${pointsToDeduct} points from assignee ${assigneeId} for uncompleting subitem ${subItemId}`
          );
          const updatedDoc = await itemRef.get();
          return res.status(200).json({
            id: updatedDoc.id,
            ...updatedDoc.data(),
            toast: {
              type: "warning",
              points: -pointsToDeduct,
              totalPoints: gamificationResult.totalPoints,
              level: gamificationResult.level,
              assigneeId: assigneeId,
            },
          });
        }
      } catch (gamificationError) {
        console.error(
          "⚠️ Subitem gamification error (status still updated):",
          gamificationError
        );
      }
    } else {
      console.log('SUBITEM NO block hit');
    }

    // Regular response if no gamification
    const updatedDoc = await itemRef.get();
    res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    next(error);
  }
};

// Cambia el sprint de un item
export const changeItemSprint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId, sprintId } = req.params;

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

    // Update only the sprint field
    await itemRef.update({
      sprint: sprintId,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: "Sprint updated successfully",
      sprintId: sprintId,
    });
  } catch (error) {
    next(error);
  }
};

// Cambia el sprint de un subitem
export const changeSubItemSprint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, itemId, subItemId, sprintId } = req.params;

    const subItemRef = db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .doc(itemId)
      .collection("subitems")
      .doc(subItemId);
    const subItemSnap = await subItemRef.get();

    if (!subItemSnap.exists) {
      return res.status(404).json({ message: "Subitem not found" });
    }

    await subItemRef.update({
      sprint: sprintId,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: "Sprint updated successfully",
      sprintId: sprintId,
    });
  } catch (error) {
    next(error);
  }
};
