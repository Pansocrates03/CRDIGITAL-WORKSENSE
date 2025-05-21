import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js";
import type { BacklogItemData } from "../../types/backlog.js";

// Función recursiva para obtener todos los hijos de un elemento
const getItemChildren = async (item: BacklogItemData, projectId: string): Promise<BacklogItemData[]> => {
    // Si el item no tiene ID, no podemos acceder a sus subItems
    if (!item.id) {
        console.log("Item without ID:", item);
        return [item];
    }

    console.log("Processing item with ID:", item.id);
    
    try {
        // Obtenemos los subItems de la subcolección
        const subItemsSnap = await db
            .collection("projects")
            .doc(projectId)
            .collection("backlog")
            .doc(item.id)
            .collection("subItems")
            .get();

        console.log(`Found ${subItemsSnap.size} subItems for item ${item.id}`);

        // Si no hay subItems, devolvemos solo el item actual
        if (subItemsSnap.empty) {
            return [item];
        }
        
        // Procesamos recursivamente cada subItem
        const subItemsData = subItemsSnap.docs.map(doc => ({
            ...doc.data() as BacklogItemData,
            id: doc.id // Aseguramos que el ID del documento esté presente
        }));

        console.log("SubItems data:", subItemsData.map(si => ({ id: si.id, name: si.name })));
        
        // Procesamos cada subItem recursivamente
        const subItemsResults = await Promise.all(
            subItemsData.map(async (subItem) => {
                const children = await getItemChildren(subItem, projectId);
                return children;
            })
        );

        // Aplanamos los resultados y añadimos el item actual
        const result = [item, ...subItemsResults.flat()];
        console.log(`Total items for ${item.id}: ${result.length}`);
        return result;
    } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
        return [item];
    }
};

export const getStories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    try {
        const { projectId, sprintId } = req.params;

        console.log("Project ID:", projectId);
        console.log("Sprint ID:", sprintId);
    
        const ItemsRef = db
            .collection("projects")
            .doc(projectId)
            .collection("backlog");
        const backlogItemsSnap = await ItemsRef.get();

        if (backlogItemsSnap.empty) {
            res.status(404).json({ message: "No stories found" });
            return;
        }

        console.log(`Found ${backlogItemsSnap.size} root items`);

        // Obtenemos todas las historias en un array plano
        const flattenedStoriesPromises = backlogItemsSnap.docs.map(async (doc) => {
            const data = {
                ...doc.data() as BacklogItemData,
                id: doc.id // Aseguramos que el ID del documento esté presente
            };
            console.log("Processing root item:", data.name, "ID:", data.id);
            return getItemChildren(data, projectId);
        });

        const flattenedStoriesArrays = await Promise.all(flattenedStoriesPromises);
        const flattenedStories = flattenedStoriesArrays.flat();

        console.log("Total flattened stories:", flattenedStories.length);
        console.log("All flattened stories:", flattenedStories.map(s => ({ id: s.id, name: s.name })));

        // Filtramos solo las historias según los criterios
        const filteredStories = flattenedStories.filter((story) => {
            if(sprintId == "0") {
                console.log("Devolviendo todas las US");
                return (
                    story.type === "story" &&
                    story.projectId === projectId
                );
            }
            return (
                story.type === "story" &&
                story.projectId === projectId &&
                story.sprint === sprintId
            );
        });

        console.log("Filtered stories count:", filteredStories.length);
        console.log("Filtered stories:", filteredStories.map(s => ({ id: s.id, name: s.name })));
    
        res.status(200).json(filteredStories);
    } catch (error) {
        console.error("Error in getStories:", error);
        next(error);
    }
}