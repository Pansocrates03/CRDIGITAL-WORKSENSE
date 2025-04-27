import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { generateItemWithAI} from '../service/aiService.js';
import {parseIAResponse, Epic} from '../utils/parseIAResponse.js';

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

    console.log('✅ Prompt enviado a la IA');
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
    let epics: Epic[];
    try {
        epics = parseIAResponse(rawText);   
    } catch (err: any) {
        console.error('Error parseando IA:', err.message);
        return res.status(400).json({error: err.message});
    }

    // Devolvemos la respuesta
    return res.status(200).json({ 
        message: "Proyecto Válido. Endpoint generate-epic alcanzado.",
        projectId: projectId,
        userId: userId,
        epics: epics
    });
};