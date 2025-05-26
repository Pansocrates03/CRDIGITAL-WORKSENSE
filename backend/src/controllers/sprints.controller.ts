import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";
import { Sprint } from "../types/sprint.type.js";

export const getSprints = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("sprints");

        const snapshot = await collectionRef.get();

        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(items);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getSprint = async (req: Request, res: Response) => {
    try {
        const { projectId, sprintId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("sprints")
            .doc(sprintId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Sprint not found" });
            return;
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSprint = async (req: Request, res: Response) => {
    try {
        const { projectId, sprintId } = req.params;
        const updateData = req.body;

        const itemRef = db
            .collection("projects")
            .doc(projectId)
            .collection("sprints")
            .doc(sprintId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Sprint not found" });
            return;
        }

        const dataToUpdate = {
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        };

        delete dataToUpdate.projectId;
        delete dataToUpdate.createdAt;
        delete dataToUpdate.startDate;
        delete dataToUpdate.endDate;

        await itemRef.update(dataToUpdate);

        const updatedDoc = await itemRef.get();
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createSprint = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const newSprintData: Sprint = req.body;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("sprints");

        const newItemRef = await collectionRef.add(newSprintData);
        res.status(201).json({ id: newItemRef.id, ...newSprintData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSprint = async (req: Request, res: Response) => {
    try {
        const { projectId, sprintId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("sprints")
            .doc(sprintId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Sprint not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Sprint deleted", id: sprintId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};