import { Request, Response } from "express";
import { db } from "../models/firebase.js";

import { BacklogItemData } from "../../types/backlog.js";


export const handleGeminiPrompt = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt, projectId } = req.body;

  if (!prompt || !projectId) {
    res.status(400).json({ message: "Missing prompt or projectId" });
    return;
  }

  try {
    const projectRef = db.collection("projects").doc(projectId); // Obtener el docuemnto del proyecto
    const projectSnap = await projectRef.get(); // Leer el documento con el get

    if (!projectSnap.exists) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const projectData = projectSnap.data() || {}; // Regresa todo los campos del documento como un objeto

    const backlogRef = db.collection(`projects/${projectId}/backlog`);
    const backlogSnap = await backlogRef.get();

    const backlogItems: BacklogItemData[] = backlogSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as BacklogItemData),
    }));

    // Agrupar por tipo
    const stories: BacklogItemData[] = [];
    const bugs: BacklogItemData[] = [];
    const techTasks: BacklogItemData[] = [];
    const knowledgeItems: BacklogItemData[] = [];
    const epics: BacklogItemData[] = [];

    for (const item of backlogItems) {
      switch (item.type) {
        case "story":
          stories.push(item);
          break;
        case "bug":
          bugs.push(item);
          break;
        case "techTask":
          techTasks.push(item);
          break;
        case "knowledge":
          knowledgeItems.push(item);
          break;
        case "epic":
          epics.push(item);

          const subitemsSnap = await db
            .collection(`projects/${projectId}/backlog/${item.id}/subitem`)
            .get();

          const subitems: BacklogItemData[] = subitemsSnap.docs.map(
            (doc) => doc.data() as BacklogItemData
          );

          subitems.forEach((sub) => {
            if (sub.type === "story") {
              stories.push({
                ...sub,
                epicTitle: item.title || item.name || "Unnamed Epic",
              });
            }
          });

          break;
      }
    }

    const contextPrompt = `
        You are Frida, a smart assistant helping with project management.

        Use the following project context to answer the user's question.

        ---

        ### 🗂 Project Info
        - Name: ${projectData.name || "N/A"}
        - Description: ${projectData.description || "No description provided."}

        ### 🧱 Epics
        ${
          epics.length > 0
            ? epics
                .map((e) => `- ${e.name} (${e.status || "unknown"})`)
                .join("\n")
            : "No epics found."
        }

        ### 📚 Stories
        ${
          stories.length > 0
            ? stories
                .map(
                  (s) =>
                    `- ${s.name} (${s.size || "?"} pts) ${
                      s.epicTitle ? `(from epic: ${s.epicTitle})` : ""
                    }`
                )
                .join("\n")
            : "No stories found."
        }

        ### 🐞 Bugs
        ${
          bugs.length > 0
            ? bugs
                .map((b) => `- ${b.name} [${b.severity || "medium"}]`)
                .join("\n")
            : "No bugs found."
        }

        ### 🛠 Tech Tasks
        ${
          techTasks.length > 0
            ? techTasks.map((t) => `- ${t.title}`).join("\n")
            : "No tech tasks found."
        }

        ### 📘 Knowledge Items
        ${
          knowledgeItems.length > 0
            ? knowledgeItems.map((k) => `- ${k.title}`).join("\n")
            : "No knowledge items found."
        }

        ---

        ### ❓ User’s Question
        "${prompt}"

        Provide a helpful and prioritized answer based on the context.
        `.trim();

    // 🔑 Gemini API URL with your key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [{ text: contextPrompt }],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errJson = await response.json();
      console.error("Gemini API error:", errJson);
      res.status(500).json({ message: "Gemini API error", error: errJson });
      return;
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ reply: reply || "No response from Gemini" });
  } catch (err) {
    console.error("Internal error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
