import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { Timestamp } from "firebase-admin/firestore";
import { SprintCompletionMetrics, SprintItemStatus } from "../types/sprint.js";

// POST /projects/:projectId/sprints
export const createSprint = async (req: Request, res: Response) => {
  try {
    // 1. Obtener projectId de los parámetros
    const { projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ error: "Falta el projectId en la ruta" });
      return;
    }

    // 2. Validar datos de entrada
    const { name, goal, startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate y endDate son requeridos" });
      return;
    }
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      res.status(400).json({ error: "Fechas inválidas" });
      return;
    }
    if (newStart >= newEnd) {
      res.status(400).json({ error: "startDate debe ser menor a endDate" });
      return;
    }

    // 3. Verificar si ya hay un sprint activo
    const sprintsRef = db.collection("projectss").doc(projectId).collection("sprints");
    const activeSprintSnap = await sprintsRef.where("status", "==", "active").limit(1).get();
    let newSprintStatus = "active";
    if (!activeSprintSnap.empty) {
      newSprintStatus = "planned"; // o "inactive" si prefieres
    }

    // 4. Verificar que no haya solapamiento de fechas
    const overlapSnap = await sprintsRef
      .where("startDate", "<=", newEnd)
      .where("endDate", ">=", newStart)
      .limit(1)
      .get();
    if (!overlapSnap.empty) {
      res.status(400).json({ error: "Ya existe un sprint en esas fechas" });
      return;
    }

    // 5. Crear el documento del sprint
    const now = Timestamp.now();
    const sprintData = {
      projectId,
      name: name || null,
      goal: goal || null,
      startDate: Timestamp.fromDate(newStart),
      endDate: Timestamp.fromDate(newEnd),
      status: newSprintStatus,
      createdAt: now,
      updatedAt: now,
    };

    const sprintRef = await sprintsRef.add(sprintData);

    // 6. Devolver el sprint creado
    const sprintSnap = await sprintRef.get();
    res.status(201).json({ id: sprintRef.id, ...sprintSnap.data() });
  } catch (error) {
    console.error("Error al crear el sprint:", error);
    res.status(500).json({ error: "Error interno al crear el sprint" });
  }
};

// POST /projects/:projectId/sprints/:sprintId/complete
export const completeSprint = async (req: Request, res: Response) => {
  try {
    const { projectId, sprintId } = req.params;

    // 1. Verificar que el sprint existe
    const sprintRef = db.collection("projectss").doc(projectId).collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();
    
    if (!sprintSnap.exists) {
      res.status(404).json({ message: "Sprint no encontrado" });
      return;
    }

    const sprintData = sprintSnap.data();
    if (sprintData?.status === "completed") {
      res.status(400).json({ message: "El sprint ya está completado" });
      return;
    }

    // 2. Obtener todos los items del sprint para calcular métricas
    const itemsSnap = await sprintRef.collection("items").get();
    
    // 3. Calcular métricas de completitud
    const metrics: SprintCompletionMetrics = {
      totalItems: itemsSnap.size,
      completedItems: 0,
      itemsByStatus: {
        todo: 0,
        "in-progress": 0,
        review: 0,
        done: 0
      }
    };

    itemsSnap.forEach(doc => {
      const item = doc.data();
      metrics.itemsByStatus[item.status as SprintItemStatus]++;
      if (item.status === "done") {
        metrics.completedItems++;
      }
    });

    // 4. Actualizar el sprint como completado
    const now = Timestamp.now();
    await sprintRef.update({
      status: "completed",
      completedAt: now,
      completionMetrics: metrics,
      updatedAt: now
    });

    // 5. Devolver el sprint actualizado con sus métricas
    res.status(200).json({
      message: "Sprint completado exitosamente",
      completedAt: now,
      completionMetrics: metrics
    });

  } catch (error) {
    console.error("Error al completar el sprint:", error);
    res.status(500).json({ error: "Error interno al completar el sprint" });
  }
}; 