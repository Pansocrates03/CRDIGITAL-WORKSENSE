import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { generateItemWithAI } from "../service/aiService.js";
import {
  parseIAResponse,
  Epic,
  Story,
  Task,
} from "../utils/parseIAResponse.js";
import {
  WriteBatch,
  CollectionReference,
  Timestamp,
} from "firebase-admin/firestore";

// Guarda un item (épica, historia o tarea) y sus sub-items en batch.
async function saveItemRecursively(
  batch: WriteBatch,
  parentColl: CollectionReference,
  projectId: string,
  item: any, // Epic | Story | Task con .items[]
  userId: number
): Promise<string[]> {
  const docRef = parentColl.doc();
  const now = Timestamp.now();

  batch.set(docRef, {
    projectID: projectId,
    name: item.name,
    description: item.description,
    tag: item.tag, // 'epic' | 'user-story' | 'task'
    status: "to do",
    priority: item.priority,
    assignees: item.assignees,
    authorId: userId,
    createdAt: now,
    updatedAt: now,
  });

  let ids = [docRef.id];

  if (Array.isArray(item.items) && item.items.length > 0) {
    const sub = docRef.collection("backlog");
    for (const child of item.items) {
      // garantizamos child.tag correcto
      ids = ids.concat(
        await saveItemRecursively(
          batch,
          sub,
          projectId,
          {
            ...child,
            // si child no trae tag, asignamos según profundidad
            tag: child.items ? "user-story" : "task",
          },
          userId
        )
      );
    }
  }

  return ids;
}

/**
 * POST /projectss/:id/generate-epics
 */
export const generateEpicHandler = async (req: Request, res: Response) => {
  // Validación de autenticación
  const userId = (req as any).user?.userId as number | undefined;
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Acceso denegado: usuario no autenticado" });
  }

  // Extracción de projectId
  const projectId = req.params.id;
  if (!projectId) {
    return res
      .status(400)
      .json({ error: "Faltan parámetros: se requiere projectId" });
  }

  // Validación de proyecto y campos mínimos (Firestore)
  let projectData: any;
  try {
    const projectRef = db.collection("projectss").doc(projectId);
    const projectSnap = await projectRef.get();

    // Caso 1: Proyecto no encontrado
    if (!projectSnap.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    // Caso 2: Proyecto encontrado pero sin campos mínimos
    projectData = projectSnap.data();
    if (!projectData?.name || !projectData?.description) {
      return res.status(400).json({
        error: 'El proyecto requiere los campos "name" y "description"',
      });
    }
  } catch (err) {
    console.error("Error al leer Firestore:", err);
    return res
      .status(500)
      .json({ error: "Error interno del servidor al leer Firestore" });
  }
  // ───────────────────────────────────────────────────────────────────────
  // Generación de épica con IA
  // Extraemos el contexto que guardó el usuario en el proyecto (si existe)
  const {
    name: projectName,
    description: projectDescription,
    stack = [],
    objective = "",
    tone = "",
    glossary = [],
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

  console.log("✅ Prompt enviado a la IA");
  // ───────────────────────────────────────────────────────────────────────

  // Llamada al servicio de IA FRIDA
  let rawText: string;
  try {
    rawText = await generateItemWithAI({ prompt });
    console.log("Respuesta de IA recibida:", rawText);
  } catch (err: any) {
    console.error("Error al generar épica con IA:", err.message);
    return res.status(502).json({ error: "Error al comunicarse con la IA" });
  }

  // Parseo mínimo para comprobar estructura de respuesta (sub-issue #5)
  let epics: Epic[];
  try {
    epics = parseIAResponse(rawText);
  } catch (err: any) {
    console.error("Error parseando IA:", err.message);
    return res.status(400).json({ error: err.message });
  }

  // Obtener épicas existentes en Firestore y filtrar duplicados
  try {
    const itemRef = db
      .collection("projectss")
      .doc(req.params.id)
      .collection("backlog");
    const snapshot = await itemRef.where("tag", "==", "epic").get();
    const existingNames = snapshot.docs
      .map((doc) => doc.data().name)
      .filter((n): n is string => typeof n === "string");

    // Filtramos sólo las épicas que no existen en Firestore
    const unique = epics.filter((e) => !existingNames.includes(e.name));

    if (unique.length === 0) {
      return res.status(409).json({
        error: "Todas las épicas sugeridas ya existen en el proyecto.",
      });
    }

    // Devolvemos sólo las no duplicadas
    return res.status(200).json({ epics: unique });
  } catch (err: any) {
    console.error("Error comprobando duplicados en Firestore:", err.message);
  }

  // Devolvemos la respuesta
  return res.status(200).json({
    message: "Proyecto Válido. Endpoint generate-epic alcanzado.",
    projectId: projectId,
    userId: userId,
    epics: epics,
  });
};

/**
 * POST /projectss/:id/confirm-epics
 */
export async function confirmEpicsHandler(req: Request, res: Response) {
  // 1) Autenticación
  const userId = (req as any).user?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ error: "Acceso denegado: token inválido." });
  }

  // 2) Validar proyecto
  const projectId = req.params.id;
  const projectRef = db.collection("projectss").doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) {
    return res.status(404).json({ error: "Proyecto no encontrado." });
  }
  const project = projectSnap.data();
  if (!project?.name || !project?.description) {
    return res
      .status(400)
      .json({ error: "El proyecto requiere campos name y description." });
  }

  // 3) Validar body.epics
  const epics: Epic[] = req.body.epics;
  if (!Array.isArray(epics) || epics.length < 1 || epics.length > 5) {
    return res
      .status(400)
      .json({ error: "Se requieren entre 1 y 5 épicas en el body." });
  }

  // 4) Traer épicas existentes para filtrar duplicados
  const backlogRef = projectRef.collection("backlog");
  const existSnap = await backlogRef.where("tag", "==", "epic").get();
  const existingNames = new Set(
    existSnap.docs
      .map((d) => d.data().name)
      .filter((n): n is string => typeof n === "string")
  );

  // 5) Batch y guardado recursivo
  const batch = db.batch();
  let createdIds: string[] = [];

  for (const epic of epics) {
    if (existingNames.has(epic.name)) {
      continue; // saltamos duplicadas
    }
    // definimos el tag de épica
    const epicWithTag = { ...epic, tag: "epic" };
    const ids = await saveItemRecursively(
      batch,
      backlogRef,
      projectId,
      epicWithTag,
      userId
    );
    createdIds = createdIds.concat(ids);
  }

  if (createdIds.length === 0) {
    return res
      .status(409)
      .json({ error: "Ninguna épica nueva para guardar (todas duplicadas)." });
  }

  await batch.commit();
  return res
    .status(201)
    .json({ message: "Épicas guardadas", docIds: createdIds });
}
