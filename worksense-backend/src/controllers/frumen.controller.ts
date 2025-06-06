import { Request, Response } from "express";
import { db } from "../models/firebase.js";

export const getFrumen = async (req: Request, res: Response) => {
  try {
    const { projectId, sprintId } = req.params;

    // Verify that the project exists
    const project = await db.collection("projects").doc(projectId).get();
    if (!project.exists) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get items from backlog
    const backlogItemsSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .where("projectId", "==", projectId)
      .where("sprint", "==", sprintId)
      .get();

    // Fetch all epics
    const epicsSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .where("projectId", "==", projectId)
      .where("type", "==", "epic")
      .get();

    // Create an array for each epic subitem
    const epicSubitemsPromises = epicsSnap.docs.map(async (epicDoc) => {
      try {
        // Fetch subitems for each epic that belong to the specified project and sprint
        const subitemsSnap = await epicDoc.ref
          .collection("subitems")
          .where("projectId", "==", projectId)
          .where("sprint", "==", sprintId)
          .get();
        
        // Transform subitems into plain objects and add reference to parent epic
        return subitemsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          epicId: epicDoc.id
        }));
      } catch (error) {
        console.error(`Error fetching subitems for epic ${epicDoc.id}:`, error);
        return [];
      }
    });

    const epicSubitemsResults = await Promise.all(epicSubitemsPromises);
    const epicSubitems = epicSubitemsResults.flat();

    // Transform backlog items into plain objects
    const backlogItems = backlogItemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const allItems = [...backlogItems, ...epicSubitems];

    return res.status(200).json(allItems);
  } catch (error) {
    console.error(`Error getting tasks for sprint ${req.params.sprintId}:`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};