import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";
import { Bug } from "../types/bug.type.js";

export const getBugs = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("bugs");

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

export const getBug = async (req: Request, res: Response) => {
    try {
        const { projectId, bugId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("bugs")
            .doc(bugId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Bug not found" });
            return;
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateBug = async (req: Request, res: Response) => {
    try {
        const { projectId, bugId } = req.params;
        const updateData = req.body;

        const itemRef = db
            .collection("projects")
            .doc(projectId)
            .collection("bugs")
            .doc(bugId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Bug not found" });
            return;
        }

        const dataToUpdate = {
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        };

        delete dataToUpdate.projectId;
        delete dataToUpdate.type;
        delete dataToUpdate.reporterId;
        delete dataToUpdate.createdAt;

        await itemRef.update(dataToUpdate);

        const updatedDoc = await itemRef.get();
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createBug = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const newBugData: Bug = req.body;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("bugs");

        const newItemRef = await collectionRef.add(newBugData);
        res.status(201).json({ id: newItemRef.id, ...newBugData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteBug = async (req: Request, res: Response) => {
    try {
        const { projectId, bugId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("bugs")
            .doc(bugId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Bug not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Bug deleted", id: bugId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};