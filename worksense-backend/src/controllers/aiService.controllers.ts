import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { generateItemWithAI } from "../service/aiService.js";
import { Timestamp } from "firebase-admin/firestore";

// 🧠 Parser del texto plano generado por la IA
function parseIAResponse(text: string): any {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return null;

  const epicTitle = lines[0].replace(/\*\*/g, "").replace(/^[-*]\s*/, "").trim();

  const result = {
    name: epicTitle,
    description: "Contenido generado por IA",
    tag: "epic",
    items: [],
  };

  let currentStory: any = null;

  for (const line of lines.slice(1)) {
    const clean = line.replace(/\*\*/g, "").trim();

    if (clean.match(/^[-*]\s*(User )?Story/i)) {
      if (currentStory) result.items.push(currentStory);
      currentStory = {
        name: clean.replace(/^[-*]\s*/, ""),
        description: "Historia generada por IA",
        tag: "user-story",
        items: [],
      };
    } else if (clean.match(/^[-*]\s*Task/i) || clean.match(/^\s{2,}[-*]/)) {
      if (currentStory) {
        const taskName = clean.replace(/^[-*]\s*/, "").replace(/^\s{2,}[-*]/, "").trim();
        currentStory.items.push({
          name: taskName,
          description: "Tarea generada por IA",
          tag: "task",
        });
      }
    }
  }

  if (currentStory) result.items.push(currentStory);
  return result;
}

export const generateEpic = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const userId = (req as any).user?.userId;

  try {
    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const project = projectSnap.data();
    if (!project?.name || !project?.description) {
      return res.status(400).json({ error: "El proyecto no tiene nombre o descripción válidos" });
    }

    const itemsRef = projectRef.collection("items");

    // ✅ Obtener títulos de épicas ya existentes
    const existingEpicsSnap = await itemsRef.where("tag", "==", "epic").get();
    const existingEpicNames = existingEpicsSnap.docs.map((doc) => doc.data().name).filter(Boolean);
    const epicExclusionList = existingEpicNames.length
      ? `Avoid repeating or generating epics with these titles: ${existingEpicNames.join(", ")}.`
      : "";

    // ✅ Construir el prompt personalizado
    const promptWithExclusions = `
Generate a hierarchical structure of one epic with at least two user stories and each user story with at least one task.
Use the context of a project called {projectName} described as: {projectDescription}.
${epicExclusionList}
`;

    // ✅ Payload final a enviar a la IA
    const payload = {
      prompt: promptWithExclusions,
      data: {
        projectName: project.name,
        projectDescription: project.description,
      },
    };

    const generated = await generateItemWithAI(payload);
    const rawText = generated.data;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "La IA no devolvió una estructura válida de texto" });
    }

    const structuredData = parseIAResponse(rawText);

    if (!structuredData?.name || !structuredData?.items?.length) {
      return res.status(400).json({ error: "No se pudo estructurar correctamente la respuesta de la IA" });
    }

    // ✅ Verificar que no se repita una épica ya existente
    const existingDuplicate = await itemsRef
      .where("tag", "==", "epic")
      .where("name", "==", structuredData.name)
      .get();

    if (!existingDuplicate.empty) {
      return res.status(409).json({
        error: `Ya existe una épica llamada "${structuredData.name}" en este proyecto`,
      });
    }

    // ✅ Guardar los ítems en Firestore
    const saveItemRecursively = async (
      item: any,
      parentRef: FirebaseFirestore.CollectionReference,
      projectID: string
    ) => {
      const docRef = parentRef.doc();
      const itemID = docRef.id;

      const itemData = {
        projectID,
        name: item.name || "Ítem sin nombre",
        description: item.description || "Contenido generado por IA",
        tag: item.tag || "task",
        status: "backlog",
        priority: "medium",
        size: 0,
        author: userId || "",
        asignee: Array.isArray(item.assignee) ? item.assignee : [],
        acceptanceCriteria: Array.isArray(item.acceptanceCriteria)
          ? item.acceptanceCriteria
          : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await docRef.set(itemData);

      const subItemsRef = docRef.collection("items");
      if (item.items && Array.isArray(item.items) && item.items.length > 0) {
        for (const child of item.items) {
          await saveItemRecursively(child, subItemsRef, projectID);
        }
      } else {
        await subItemsRef.doc("emptyDoc").set({ placeholder: "empty" });
      }

      const commentsRef = docRef.collection("comments");
      if (
        item.comments &&
        Array.isArray(item.comments) &&
        item.comments.length > 0
      ) {
        for (const comment of item.comments) {
          const commentRef = commentsRef.doc();
          await commentRef.set({
            commentID: commentRef.id,
            text: comment.text || "",
            author: comment.author || userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        await commentsRef.doc("emptyDoc").set({ placeholder: "empty" });
      }
    };

    await saveItemRecursively(structuredData, itemsRef, projectId);

    res.status(201).json({ message: "Épica generada y guardada exitosamente" });

  } catch (error: any) {
    console.error("Error al generar ítems:", error);
    res.status(500).json({ error: error.message || "Error interno al generar épica" });
  }
};
