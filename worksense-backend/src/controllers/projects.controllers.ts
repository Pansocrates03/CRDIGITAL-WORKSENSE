import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { getFirestore, Timestamp } from 'firebase/firestore';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await db.collection("projects").get();
    const list: any[] = [];

    for (const doc of projects.docs) {
      const projectId = doc.id;
      const data = doc.data();

      // Leer subcolecciones (pueden estar vacías)
      const bugsSnapshot = await db.collection("projects").doc(projectId).collection("bugs").get();
      const epicsSnapshot = await db.collection("projects").doc(projectId).collection("epics").get();
      const membersSnapshot = await db.collection("projects").doc(projectId).collection("members").get();

      list.push({
        id: projectId,
        name: data.name || '',
        description: data.description || '',
        bugs: bugsSnapshot.empty ? [] : bugsSnapshot.docs.map(b => ({ id: b.id, ...b.data() })),
        epics: epicsSnapshot.empty ? [] : await Promise.all(epicsSnapshot.docs.map(async (epicDoc) => {
          const epicData = epicDoc.data();
          const epicId = epicDoc.id;

          const storiesSnapshot = await db.collection("projects").doc(projectId)
            .collection("epics").doc(epicId).collection("stories").get();

          const stories = storiesSnapshot.empty ? [] : await Promise.all(storiesSnapshot.docs.map(async (storyDoc) => {
            const storyData = storyDoc.data();
            const storyId = storyDoc.id;

            const commentsSnapshot = await db.collection("projects").doc(projectId)
              .collection("epics").doc(epicId)
              .collection("stories").doc(storyId).collection("comments").get();

            const tasksSnapshot = await db.collection("projects").doc(projectId)
              .collection("epics").doc(epicId)
              .collection("stories").doc(storyId).collection("tasks").get();

            return {
              id: storyId,
              ...storyData,
              comments: commentsSnapshot.empty ? [] : commentsSnapshot.docs.map(c => ({ id: c.id, ...c.data() })),
              tasks: tasksSnapshot.empty ? [] : tasksSnapshot.docs.map(t => ({ id: t.id, ...t.data() })),
            };
          }));

          return {
            id: epicId,
            ...epicData,
            stories
          };
        })),
        members: membersSnapshot.empty ? [] : membersSnapshot.docs.map(m => ({ id: m.id, ...m.data() })),
      });
    }

    res.json(list);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
};

// Obtener un proyecto por ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const projectDoc = await db.collection("projects").doc(projectId).get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const data = projectDoc.data();

    const bugsSnapshot = await db.collection("projects").doc(projectId).collection("bugs").get();
    const epicsSnapshot = await db.collection("projects").doc(projectId).collection("epics").get();
    const membersSnapshot = await db.collection("projects").doc(projectId).collection("members").get();

    const epics = epicsSnapshot.empty ? [] : await Promise.all(epicsSnapshot.docs.map(async (epicDoc) => {
      const epicData = epicDoc.data();
      const epicId = epicDoc.id;

      const storiesSnapshot = await db.collection("projects").doc(projectId)
        .collection("epics").doc(epicId).collection("stories").get();

      const stories = storiesSnapshot.empty ? [] : await Promise.all(storiesSnapshot.docs.map(async (storyDoc) => {
        const storyData = storyDoc.data();
        const storyId = storyDoc.id;

        const commentsSnapshot = await db.collection("projects").doc(projectId)
          .collection("epics").doc(epicId)
          .collection("stories").doc(storyId).collection("comments").get();

        const tasksSnapshot = await db.collection("projects").doc(projectId)
          .collection("epics").doc(epicId)
          .collection("stories").doc(storyId).collection("tasks").get();

        return {
          id: storyId,
          ...storyData,
          comments: commentsSnapshot.empty ? [] : commentsSnapshot.docs.map(c => ({ id: c.id, ...c.data() })),
          tasks: tasksSnapshot.empty ? [] : tasksSnapshot.docs.map(t => ({ id: t.id, ...t.data() })),
        };
      }));

      return {
        id: epicId,
        ...epicData,
        stories
      };
    }));

    const project = {
      id: projectId,
      name: data?.name || '',
      description: data?.description || '',
      bugs: bugsSnapshot.empty ? [] : bugsSnapshot.docs.map(b => ({ id: b.id, ...b.data() })),
      epics,
      members: membersSnapshot.empty ? [] : membersSnapshot.docs.map(m => ({ id: m.id, ...m.data() })),
    };

    res.json(project);
  } catch (error) {
    console.error("Error al obtener el proyecto:", error);
    res.status(500).json({ error: "Error al obtener el proyecto" });
  }
};


// Crear un nuevo proyecto con estructura inicial
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ error: "Se requieren 'name' y 'description'" });
    }

    // Paso 1: Crear un documento principal en la colección "projects"
    const projectRef = await db.collection("projects").add({
      name: name,
      description: description,
    });

    // Obtener el ID del proyecto creado
    const projectID = projectRef.id;

    // Paso 2: Crear subcolección "bugs" dentro del documento del proyecto
    // Aquí creamos la subcolección "bugs" agregando un campo vacío (puede ser cualquier campo temporal)
    const bugsRef = db.collection("projects").doc(projectID).collection("bugs");
    await bugsRef.doc("emptyDoc").set({
      placeholder: "empty", // Campo vacío solo para crear la subcolección
    });

    // Paso 3: Crear subcolección "epics" dentro del documento del proyecto
    // Aquí creamos la subcolección "epics" agregando un campo vacío
    const epicsRef = db.collection("projects").doc(projectID).collection("epics");
    await epicsRef.doc("emptyDoc").set({
      placeholder: "empty", // Campo vacío solo para crear la subcolección
    });

    // Paso 4: Crear subcolección "stories" dentro de un epic
    const storiesRef = db.collection("projects").doc(projectID).collection("epics").doc("epicID").collection("stories");
    await storiesRef.doc("emptyDoc").set({
      placeholder: "empty", // Campo vacío solo para crear la subcolección
    });

    // Paso 5: Crear subcolección "comments" dentro de una historia
    const commentsRef = db.collection("projects").doc(projectID).collection("epics").doc("epicID").collection("stories").doc("storyID").collection("comments");
    await commentsRef.doc("emptyDoc").set({
      placeholder: "empty", // Campo vacío solo para crear la subcolección
    });

    // Paso 6: Crear subcolección "tasks" dentro de una historia
    const tasksRef = db.collection("projects").doc(projectID).collection("epics").doc("epicID").collection("stories").doc("storyID").collection("tasks");
    await tasksRef.doc("emptyDoc").set({
      placeholder: "empty", // Campo vacío solo para crear la subcolección
    });

    // Paso 7: Crear subcolección "members" dentro del proyecto
    const membersRef = db.collection("projects").doc(projectID).collection("members");
    await membersRef.doc("emptyDoc").set({
      placeholder: "empty", // Campo vacío solo para crear la subcolección
    });

    console.log("Colecciones y subcolecciones creadas correctamente, pero sin documentos reales.");


    // Paso 3: Responder al cliente con éxito
    res.status(201).json({
      id: projectID,
      name,
      description,
      message: "Proyecto creado con subcolecciones reales",
    });
  } catch (error) {
    console.error("Error al crear el proyecto:", error);
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
};