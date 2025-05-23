// Servicio para la sección ForYou

import { db } from "../models/firebase.js";

export const forYouService = {
  getAssignedItems: async (userId: string, projectId: string) => {
    // Query top-level backlog items assigned to the user (not done)
    const backlogRef = db.collection("projects").doc(projectId).collection("backlog");
    const snapshot = await backlogRef.where("assigneeId", "==", userId).get();
    let items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    items = items.filter((item: any) => item.status !== "done");
    // Query subitems assigned to the user (not done)
    let subitems = [];
    try {
      const subitemsSnapshot = await db.collectionGroup("subitems")
        .where("assigneeId", "==", userId)
        .where("status", "!=", "done")
        .where("projectId", "==", projectId)
        .get();
      subitems = subitemsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching subitems (check Firestore index requirements):", err);
    }
    // Combine top-level items and subitems
    const allAssignedItems = [...items, ...subitems];
    // Prioritize 'in-progress' items
    allAssignedItems.sort((a: any, b: any) => {
      if (a.status === "in-progress" && b.status !== "in-progress") return -1;
      if (a.status !== "in-progress" && b.status === "in-progress") return 1;
      return 0;
    });
    return allAssignedItems;
  },
  getCompletedTasks: async (userId: string, projectId: string) => {
    // Query top-level backlog items assigned to the user and status 'Done'
    const backlogRef = db.collection("projects").doc(projectId).collection("backlog");
    const snapshot = await backlogRef
      .where("assigneeId", "==", userId)
      .where("status", "==", "done")
      .get();
    let items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    let subitems = [];
    try {
      const subitemsSnapshot = await db.collectionGroup("subitems")
        .where("assigneeId", "==", userId)
        .where("status", "==", "done")
        .where("projectId", "==", projectId)
        .get();
      subitems = subitemsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching completed subitems (check Firestore index requirements):", err);
    }
    // Combine top-level items and subitems
    const allAssignedItems = [...items, ...subitems];
    return allAssignedItems;
  },
  getGamification: async (userId: string) => {
    // Lógica futura
    return {};
  },
}; 