import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getItemRef } from "../utils/helpers/firestoreHelpers.js";
import { CreateSprintItemDTO, SprintItem, SprintItemStatus, UpdateSprintItemDTO } from "../../types/sprint.js";

/**
 * Agregar un item del backlog al sprint
 * POST /projects/:projectId/sprints/:sprintId/items
 */
export const addItemToSprint: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { projectId, sprintId } = req.params;
    const { type, originalId, originalType, sprintAssigneeId }: CreateSprintItemDTO = req.body;

    // 1. Verificar que el sprint existe
    const sprintRef = db.collection("projectss").doc(projectId).collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();
    
    if (!sprintSnap.exists) {
      res.status(404).json({ message: "Sprint no encontrado" });
      return;
    }

    // 2. Verificar que el item existe en el backlog
    const backlogItemRef = getItemRef(projectId, originalType, originalId);
    const backlogItemSnap = await backlogItemRef.get();

    if (!backlogItemSnap.exists) {
      res.status(404).json({ message: "Item de backlog no encontrado" });
      return;
    }

    // 3. Verificar si el item ya está en el sprint
    const sprintItemRef = sprintRef.collection("items").doc(originalId);
    const existingItemSnap = await sprintItemRef.get();

    if (existingItemSnap.exists) {
      res.status(400).json({ message: "El item ya existe en este sprint" });
      return;
    }

    // 4. Obtener el mayor orden en la columna "todo"
    const todoItemsSnap = await sprintRef
      .collection("items")
      .where("status", "==", "todo")
      .orderBy("order", "desc")
      .orderBy("__name__", "desc")
      .limit(1)
      .get();

    const nextOrder = todoItemsSnap.empty ? 1000 : todoItemsSnap.docs[0].data().order + 1000;

    // 5. Crear el item en el sprint
    const now = FieldValue.serverTimestamp();
    const sprintItem: Omit<SprintItem, 'addedAt' | 'updatedAt'> & {
      addedAt: FieldValue;
      updatedAt: FieldValue;
    } = {
      type,
      originalId,
      originalType,
      status: "todo",
      sprintAssigneeId: sprintAssigneeId || null,
      order: nextOrder,
      addedAt: now,
      updatedAt: now
    };

    await sprintItemRef.set(sprintItem);

    // Obtener el documento recién creado para tener los timestamps
    const createdDoc = await sprintItemRef.get();
    
    res.status(201).json({
      id: originalId,
      ...createdDoc.data()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los items del sprint organizados por estado
 * GET /projects/:projectId/sprints/:sprintId/board
 */
export const getSprintBoard: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { projectId, sprintId } = req.params;

    // 1. Verificar que el sprint existe
    const sprintRef = db.collection("projectss").doc(projectId).collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();
    
    if (!sprintSnap.exists) {
      res.status(404).json({ message: "Sprint no encontrado" });
      return;
    }

    // 2. Obtener todos los items del sprint
    const itemsSnap = await sprintRef
      .collection("items")
      .orderBy("order")
      .get();

    // 3. Organizar items por estado
    interface SprintBoard {
      todo: SprintItem[];
      "in-progress": SprintItem[];
      review: SprintItem[];
      done: SprintItem[];
    }

    const board: SprintBoard = {
      todo: [],
      "in-progress": [],
      review: [],
      done: []
    };

    itemsSnap.forEach(doc => {
      const item = { id: doc.id, ...doc.data() } as SprintItem & { id: string };
      board[item.status].push(item);
    });

    res.status(200).json(board);

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar el estado de un item en el sprint
 * PATCH /projects/:projectId/sprints/:sprintId/items/:itemId
 */
export const updateSprintItem: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { projectId, sprintId, itemId } = req.params;
    const updateData: UpdateSprintItemDTO = req.body;

    // 1. Verificar que el item existe en el sprint
    const itemRef = db
      .collection("projectss")
      .doc(projectId)
      .collection("sprints")
      .doc(sprintId)
      .collection("items")
      .doc(itemId);

    const itemSnap = await itemRef.get();
    
    if (!itemSnap.exists) {
      res.status(404).json({ message: "Item no encontrado en el sprint" });
      return;
    }

    // 2. Preparar datos de actualización
    const updateFields = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };

    // 3. Actualizar el item
    await itemRef.update(updateFields);

    // 4. Obtener el item actualizado
    const updatedSnap = await itemRef.get();
    res.status(200).json({
      id: itemId,
      ...updatedSnap.data()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un item del sprint
 * DELETE /projects/:projectId/sprints/:sprintId/items/:itemId
 */
export const removeSprintItem: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { projectId, sprintId, itemId } = req.params;

    // 1. Verificar que el item existe en el sprint
    const itemRef = db
      .collection("projectss")
      .doc(projectId)
      .collection("sprints")
      .doc(sprintId)
      .collection("items")
      .doc(itemId);

    const itemSnap = await itemRef.get();
    
    if (!itemSnap.exists) {
      res.status(404).json({ message: "Item no encontrado en el sprint" });
      return;
    }

    // 2. Eliminar el item
    await itemRef.delete();

    res.status(200).json({
      message: "Item eliminado del sprint exitosamente",
      id: itemId
    });

  } catch (error) {
    next(error);
  }
}; 