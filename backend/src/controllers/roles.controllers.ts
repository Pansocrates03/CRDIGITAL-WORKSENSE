import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";

export const getRoles = async (req: Request, res: Response) => {
    try {
        const collectionRef = db.collection("roles");
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

export const getRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;

        const documentRef = db.collection("roles").doc(roleId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        const updateData = req.body;

        const itemRef = db.collection("roles").doc(roleId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        const dataToUpdate = {
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        };

        delete dataToUpdate.createdAt;

        await itemRef.update(dataToUpdate);

        const updatedDoc = await itemRef.get();
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createRole = async (req: Request, res: Response) => {
    try {
        const newRoleData = req.body;

        const collectionRef = db.collection("roles");
        const newItemRef = await collectionRef.add(newRoleData);
        
        res.status(201).json({ id: newItemRef.id, ...newRoleData });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;

        const documentRef = db.collection("roles").doc(roleId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Role deleted", id: roleId });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};