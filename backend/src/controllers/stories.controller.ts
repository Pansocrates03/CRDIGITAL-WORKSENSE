import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";
import { Story } from "../types/story.type.js";

export const getStories = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("stories");

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

export const getStory = async (req: Request, res: Response) => {
    try {
        const { projectId, storyId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("stories")
            .doc(storyId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Story not found" });
            return;
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateStory = async (req: Request, res: Response) => {
    try {
        const { projectId, storyId } = req.params;
        const updateData = req.body;

        const itemRef = db
            .collection("projects")
            .doc(projectId)
            .collection("stories")
            .doc(storyId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Story not found" });
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

export const createStory = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const newStoryData: Story = req.body;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("stories");

        const newItemRef = await collectionRef.add(newStoryData);
        res.status(201).json({ id: newItemRef.id, ...newStoryData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteStory = async (req: Request, res: Response) => {
    try {
        const { projectId, storyId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("stories")
            .doc(storyId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Story not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Story deleted", id: storyId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};