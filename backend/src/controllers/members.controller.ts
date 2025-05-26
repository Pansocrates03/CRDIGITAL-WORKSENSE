import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";

export const getMembers = async (req: Request, res: Response) => {
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

export const getMember = () => {};

export const updateMember = () => {};

export const createMember = () => {};

export const deleteMember = () => {};