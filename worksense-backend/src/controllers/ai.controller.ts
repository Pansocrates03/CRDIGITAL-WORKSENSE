import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { generateItemWithAI} from '../service/aiService.js';
// import {parseIAResponse} from '../utils/parseIAResponse.js';
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

    // Validación de proyecto y campos mínimos (Firestore)
    let projectData: any;
    try {
        const projectRef = db.collection("projects").doc(projectId);
        const projectSnap = await projectRef.get();

        // Caso 1: Proyecto no encontrado
        if (!projectSnap.exists) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        // Caso 2: Proyecto encontrado pero sin campos mínimos
        projectData = projectSnap.data();
        if (!projectData?.name || !projectData?.description) {
            return res
            .status(400)
            .json({ error: 'El proyecto requiere los campos "name" y "description"'});
        }
    } catch (err) { 
        console.error("Error al leer Firestore:", err);
        return res.status(500).json({ error: "Error interno del servidor al leer Firestore" });
    }
    // ───────────────────────────────────────────────────────────────────────
    // Generación de épica con IA
    // Extraemos el contexto que guardó el usuario en el proyecto (si existe)
    const {
        name: projectName,
        description: projectDescription,
        stack = [],
        objective = '',
        tone = '',
        glossary = []
    } = projectData;

    // if (!Array.isArray(stack)) {
    //     console.warn('El campo stack no es un array; usando [] por defecto.');
    // }

    // if (!Array.isArray(glossary)) {
    //     console.warn('El campo glossary no es un array; usando [] por defecto.');
    // }

    // Generamos la épica con IA
    // Armamos el prompt dinámico
    const prompt = `
    You are Frida, an AI assistant specialized in Scrum project planning.

    Generate between 3 and 5 epics for the following project:

    • Project Name: "${projectName}"
    • Project Description: "${projectDescription}"
    // …

    For each epic, include:
    - name (short title)
    - description (1–2 sentences)
    - priority (low, medium, high)
    - assignees (array of user IDs, can be empty)

    if the Project Description is in Language Spanish, make the epics in Spanish otherwise make them in English.
    // ESCAPAMOS LAS LLAVES CON DOBLE LLAVE:
    Return **only** a JSON object with this structure:
    {{ "epics": [] }}

    Do **not** add any extra text before or after the JSON.
    `.trim();

    console.log('Prompt enviado a la IA:', prompt);
    // ───────────────────────────────────────────────────────────────────────

    // Llamada al servicio de IA FRIDA
    let rawText: string;
    try {
        rawText = await generateItemWithAI({ prompt });
        console.log('Respuesta de IA recibida:', rawText);
    } catch (err: any) {
        console.error('Error al generar épica con IA:', err.message);
        return res.status(502).json({error: 'Error al comunicarse con la IA'});
    }

    // Parseo mínimo para comprobar estructura de respuesta (sub-issue #4)
    // const structured = parseIAResponse(rawText);
    // if (!structured) {
    //     return res.status(400).json({ error: 'No se pudo parsear la respuesta de la IA.'});
    // }

    // Punto de control: Endpoint alcanzado correctamente con proyecto válido
    return res.status(200).json({ 
        message: "Proyecto Válido. Endpoint generate-epic alcanzado.",
        projectId: projectId,
        userId: userId,
        rawText: rawText,
        // , epics: [structured]
    });
};