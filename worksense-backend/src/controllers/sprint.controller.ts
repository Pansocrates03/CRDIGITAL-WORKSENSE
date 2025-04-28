import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

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