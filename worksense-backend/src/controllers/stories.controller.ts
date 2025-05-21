import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import type { BacklogItemData } from "../models/backlogItem.js";

// Función recursiva para obtener todos los hijos de un elemento
const getItemChildren = (item: BacklogItemData): BacklogItemData[] => {
    if (!item.subItems || item.subItems.length === 0) {
      return [item];
    }
    return [
      item,
      ...item.subItems.flatMap(getItemChildren)
    ];
  };

export const getStories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    try {
        // Get the user ID from the request
        const { projectId,sprintId } = req.params;

        console.log("Project ID:", projectId);
        console.log("Sprint ID:", sprintId);
    
        // Get the stories from the project's backlog
        const ItemsRef = db
            .collection("projects")
            .doc(projectId)
            .collection("backlog")
        const backlogItemsSnap:BacklogItemData = await ItemsRef.get();

        // Check if there are any stories
        if (backlogItemsSnap.empty) {
            res.status(404).json({ message: "No stories found" });
            return;
        }

        // Filter the backlog items to get only the stories
        const storiesSnap = backlogItemsSnap.docs.filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();

            // Check if the item is a story and belongs to the project
            if(sprintId === "0") {
                return (
                    data.type === "story" &&
                    data.projectId === projectId
                );
            }
            // If sprintId is not "0", filter by sprintId as well
            return (
                data.type === "story" &&
                data.projectId === projectId &&
                data.sprintId === sprintId
            );
        });

        // Obtenemos las historias en un solo array
        const flattenedStories = storiesSnap.flatMap((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            return getItemChildren(data);
        });

        console.log("Filtered Stories:", flattenedStories);
    
        res.status(200).json(flattenedStories);
    } catch (error) {
        next(error);
    }
}