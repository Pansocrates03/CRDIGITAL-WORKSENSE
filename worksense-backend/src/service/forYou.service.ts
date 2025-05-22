// Servicio para la sección ForYou

import { db } from "../models/firebase.js";

export const forYouService = {
  getAssignedItems: async (userId: string, projectId: string) => {
    // Query top-level backlog items assigned to the user
    const backlogRef = db.collection("projects").doc(projectId).collection("backlog");
    const snapshot = await backlogRef.where("assigneeId", "==", userId).get();
    let items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    // Only top-level items (no parentId or isSubItem) and not done
    items = items.filter((item: any) => !item.parentId && !item.isSubItem && item.status !== "done");
    // Prioritize 'in-progress' items
    items.sort((a: any, b: any) => {
      if (a.status === "in-progress" && b.status !== "in-progress") return -1;
      if (a.status !== "in-progress" && b.status === "in-progress") return 1;
      return 0;
    });
    return items;
  },
  getCompletedTasks: async (userId: string, projectId: string, limit: number = 3) => {
    // Query top-level backlog items assigned to the user and status 'Done'
    const backlogRef = db.collection("projects").doc(projectId).collection("backlog");
    const snapshot = await backlogRef
      .where("assigneeId", "==", userId)
      .where("status", "==", "done")
      .orderBy("updatedAt", "desc")
      .limit(limit)
      .get();
    let items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    // Only top-level items (no parentId or isSubItem)
    items = items.filter((item: any) => !item.parentId && !item.isSubItem);
    return items;
  },
  getGamification: async (userId: string) => {
    // Lógica futura
    return {};
  },
}; 