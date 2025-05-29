import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";
import { User } from "../types/user.type.js";
import bcrypt from "bcryptjs";
import {platform} from "node:os";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const collectionRef = db.collection("users");
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

export const getUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const documentRef = db
            .collection("users")
            .doc(userId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const userData = docSnap.data();
        delete userData?.password; // Remove sensitive data

        res.status(200).json({ id: docSnap.id, ...userData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        const itemRef = db
            .collection("users")
            .doc(userId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const dataToUpdate = {
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        };

        delete dataToUpdate.createdAt;
        delete dataToUpdate.password; // Don't allow password update through this endpoint

        await itemRef.update(dataToUpdate);

        const updatedDoc = await itemRef.get();
        const userData = updatedDoc.data();
        delete userData?.password; // Remove sensitive data

        res.status(200).json({ id: updatedDoc.id, ...userData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {

        const { email, password, firstName,lastName,platformRole } = req.body;

        if(!email || !password || !firstName || !lastName || !platformRole){
            res.status(400).json({ message: "Check if you have all the required fields: email, password, firstName, lastName, platformRole" });
        }

        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUserData: Omit<User,"id"> = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            platformRole,
        }

        const collectionRef = db.collection("users");
        const newItemRef = await collectionRef.add(newUserData);
        
        const userData = { ...newUserData };
        delete userData.password; // Remove sensitive data

        res.status(201).json({ id: newItemRef.id, ...userData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const documentRef = db
            .collection("users")
            .doc(userId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "User deleted", id: userId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};