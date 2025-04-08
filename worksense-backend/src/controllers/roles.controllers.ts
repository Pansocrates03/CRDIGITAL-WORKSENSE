import { Request, Response } from 'express';
import { db } from "../models/firebase.js";

export const getProjectRoles = async (req: Request, res: Response) => {
    console.log('Fetching project roles...');

    const projectId = req.params.ProjectId;
    if (!projectId) return res.status(400).send("Project ID is required");

    // Obtener el documento del proyecto
    const project = await db.collection('projects').doc(projectId)

    // Obtener la colección de "roles"


}

export const createProjectRole = async (req: Request, res: Response) => {
    console.log("Creating project role...");
}

export const updateProjectRole = async (req: Request, res: Response) => {
    console.log("Updating project role...");
}

export const deleteProjectRole = async (req: Request, res: Response) => {
    console.log("Deleting project role...");
}

export const getProjectRoleById = async (req: Request, res: Response) => {
    console.log("Fetching project role by ID...");
}