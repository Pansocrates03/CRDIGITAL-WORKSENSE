import { Request, Response } from "express";
import { db } from "../models/firebase.js";
// Token valido Enrique: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImEwMTY0MTQwMkB0ZWMubXgiLCJ1c2VySWQiOjEyLCJpYXQiOjE3NDU3NzQ5NDgsImV4cCI6MTc0NTc3ODU0OH0.pPxP-xwfafkYcOMx7ss7inOlgvSyCkxbgv0WiForMzY
export const generateEpicHandler = async (req: Request, res: Response) => {
    // Validación de autenticación
    const userId = (req as any).user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Acceso denegado: usuario no autenticado" });
    }

    // Extracción de projectId
    const projectId = req.params.id;
    if (!projectId) {
        return res.status(400).json({ error: "Faltan parámetros: se requiere projectId" });
    }

    // Validación de proyecto y campos mínimos
    try {
        const projectRef = db.collection("projects").doc(projectId);
        const projectSnap = await projectRef.get();

        // Caso 1: Proyecto no encontrado
        if (!projectSnap.exists) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        // Caso 2: Proyecto encontrado pero sin campos mínimos
        const project = projectSnap.data();
        if (!project?.name || !project?.description) {
            return res
            .status(400)
            .json({ error: 'El proyecto requiere los campos "name" y "description"'});
        }
    } catch (err) { 
        console.error("Error al leer Firestore:", err);
        return res.status(500).json({ error: "Error interno del servidor al leer Firestore" });
    }

    // Punto de control: Endpoint alcanzado correctamente con proyecto válido
    return res.status(200).json({ 
        message: "Proyecto Válido. Endpoint generate-epic alcanzado.",
        projectId,
        userId
    });
};