import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

// POST /items
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        projectID,
        name,
        description,
        tag,
        status,
        priority,
        size,
        author,
        asignee,
        acceptanceCriteria
      } = req.body;
  
      if (!projectID || !name || !description) {
        res.status(400).json({ error: "Faltan campos obligatorios (projectID, name, description)" });
        return;
      }
  
      const itemData = {
        projectID,
        name,
        description,
        tag: tag || "",
        status: status || "backlog",
        priority: priority || "medium",
        size: size || 0,
        author: author || "",
        asignee: Array.isArray(asignee) ? asignee : [],
        acceptanceCriteria: Array.isArray(acceptanceCriteria) ? acceptanceCriteria : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
  
      const itemRef = await db.collection("projects").doc(projectID).collection("items").add(itemData);
      const itemID = itemRef.id;
  
      // Crear subcolección "items"
      const subItemsRef = db.collection("projects")
        .doc(projectID)
        .collection("items")
        .doc(itemID)
        .collection("items");
  
      await subItemsRef.doc("emptyDoc").set({
        placeholder: "empty",
      });
  
      // Crear subcolección "comments"
      const commentsRef = db.collection("projects")
        .doc(projectID)
        .collection("items")
        .doc(itemID)
        .collection("comments");
  
      await commentsRef.doc("emptyDoc").set({
        placeholder: "empty",
      });
  
      console.log("Item y subcolecciones 'items' y 'comments' creados correctamente");
  
      res.status(201).json({
        id: itemID,
        ...itemData,
        message: "Item creado con subcolecciones"
      });
    } catch (error) {
      console.error("Error al crear el item:", error);
      res.status(500).json({ error: "Error al crear el item" });
    }
  };
  

// GET /items
export const getAllItems = async (_req: Request, res: Response): Promise<void> => {
    try {
      const projectsSnapshot = await db.collection("projects").get();
      const allItems: any[] = [];
  
      for (const projectDoc of projectsSnapshot.docs) {
        const projectID = projectDoc.id;
  
        const itemsSnapshot = await db
          .collection("projects")
          .doc(projectID)
          .collection("items")
          .get();
  
        for (const itemDoc of itemsSnapshot.docs) {
          const itemID = itemDoc.id;
          const itemData = itemDoc.data();
  
          // Subcolección: items
          const subItemsSnapshot = await db
            .collection("projects")
            .doc(projectID)
            .collection("items")
            .doc(itemID)
            .collection("items")
            .get();
  
          const subItems = subItemsSnapshot.empty
            ? []
            : subItemsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
  
          // Subcolección: comments
          const commentsSnapshot = await db
            .collection("projects")
            .doc(projectID)
            .collection("items")
            .doc(itemID)
            .collection("comments")
            .get();
  
          const comments = commentsSnapshot.empty
            ? []
            : commentsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
  
          allItems.push({
            id: itemID,
            projectID,
            ...itemData,
            items: subItems,
            comments: comments,
          });
        }
      }
  
      res.json(allItems);
    } catch (error) {
      console.error("Error al obtener los items:", error);
      res.status(500).json({ error: "Error al obtener los items" });
    }
  };
  
