import { Request, Response } from "express";
import { db } from "../models/firebase.js";

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

    const newProjectData = {
      name,
      description,
      bugs: {},
      epics: {},
      members: {}
    };

    const newProjectRef = await db.collection("projects").add(newProjectData);

    res.status(201).json({ id: newProjectRef.id, ...newProjectData });
  } catch (error) {
    console.error("Error al crear el proyecto:", error);
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
};
