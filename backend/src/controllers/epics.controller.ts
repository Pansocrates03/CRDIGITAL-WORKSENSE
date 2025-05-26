import { Request, Response } from "express";
import { db } from "../models/firebase.model.js"
import { FieldValue } from "firebase-admin/firestore";
import { Epic } from "../types/epic.type.js";

export const getEpics = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("epics");

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

export const getEpic = async (req: Request,res: Response) => {
    try {
        // Get the parameters
        const { projectId, epicId } = req.params;

        // Get the document data
        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("epics")
            .doc(epicId)
        const docSnap = await documentRef.get();

        // Error handling
        if (!docSnap.exists) {
            res.status(404).json({ message: "Epic not found" });
            return;
        }

        // Send results
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
        return;
    }
}

export const updateEpic = async ( req: Request, res: Response ) => {
    try {
        // Get the parameters
        const { projectId, epicId } = req.params;
        const updateData = req.body;

        // Get the document data
        const itemRef = db
            .collection("projects")
            .doc(projectId)
            .collection("epics")
            .doc(epicId);
        const docSnap = await itemRef.get();

        // Error handling
        if (!docSnap.exists) {
            res.status(404).json({ message: "Epic not found" });
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
}

export const createEpic = async ( req: Request, res: Response ) => {
    try {
        // Get the parameters
        const { projectId } = req.params;
        const newEpicData: Epic = req.body;

        // Get the collection reference
        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("epics")

        const newItemRef = await collectionRef.add(newEpicData);
        res.status(201).json({ id: newItemRef.id, ...newEpicData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
        return;
    }
}

export const deleteEpic = async ( req: Request, res: Response ) => {
    try {
        // Get the parameters
        const { projectId, epicId } = req.params;

        // Get the document reference
        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("epics")
            .doc(epicId)
        const docSnap = await documentRef.get()

        if (!docSnap.exists) {
            res.status(404).json({ message: "Item not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Item deleted", id: epicId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
        return;
    }
}