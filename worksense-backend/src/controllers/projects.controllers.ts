import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { getFirestore, Timestamp } from 'firebase/firestore';

// Obtener todos los proyectos
export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await db.collection("projects").get();
    const list: any[] = [];
    projects.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
};

// Obtener un proyecto por ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectDoc = await db.collection("projects").doc(req.params.id).get();

    if (!projectDoc.exists) {
      res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json({ id: req.params.id, ...projectDoc.data() });
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
      name: "Project Name",
      description: "Project Description",
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