import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { Project } from "../types/project.type.js";

export const getProjects = async (req: Request, res: Response) => {
    try {
        const collectionRef = db.collection("projects");
        const snapshot = await collectionRef.get();

        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                description: data.description,
                status: data.status,
                ownerId: data.ownerId,

            };
        });


        res.status(200).json(items);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const updateData = req.body;

        const itemRef = db
            .collection("projects")
            .doc(projectId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        const dataToUpdate = {
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        };

        delete dataToUpdate.createdAt;
        delete dataToUpdate.ownerId;

        await itemRef.update(dataToUpdate);

        const updatedDoc = await itemRef.get();
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { description, name, ownerId } = req.body;

        if(!name){
            res.status(400).json({ message: "The project needs a name"});
            return;
        }
        if(!description){
            res.status(400).json({ message: "The project needs a name"});
            return;
        }
        if(!ownerId){
            res.status(400).json({ message: "The project needs an owner"});
            return;
        }

        const newProjectData: Omit<Project, "id"> = {
            name,
            description,
            ownerId,
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const collectionRef = db.collection("projects");
        const newItemRef = await collectionRef.add(newProjectData);
        res.status(200).json({ id: newItemRef.id, ...newProjectData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Project deleted", id: projectId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};