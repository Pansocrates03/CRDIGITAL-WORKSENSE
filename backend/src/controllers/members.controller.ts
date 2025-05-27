import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";

export const getMembers = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("members");

        const snapshot = await collectionRef.get();

        // Get member data and user data for each member
        const membersWithUserData = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const memberData = doc.data();
                
                // Get user data from users collection
                const userRef = db.collection("users").doc(doc.id);
                const userSnap = await userRef.get();
                
                let userData = {};
                if (userSnap.exists) {
                    userData = userSnap.data() || {};
                    delete userData.password; // Remove sensitive data
                }

                return {
                    id: doc.id,
                    ...memberData,
                    user: userData
                };
            })
        );

        res.status(200).json(membersWithUserData);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMember = async (req: Request, res: Response) => {
    try {
        const { projectId, userId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("members")
            .doc(userId);
        
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Member not found" });
            return;
        }

        const memberData = docSnap.data();

        // Get user data from users collection
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();
        
        let userData = {};
        if (userSnap.exists) {
            userData = userSnap.data() || {};
            delete userData.password; // Remove sensitive data
        }

        res.status(200).json({ 
            id: docSnap.id, 
            ...memberData,
            user: userData
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateMember = async (req: Request, res: Response) => {
    try {
        const { projectId, userId } = req.params;
        const { projectRoleId } = req.body;

        if (!projectRoleId) {
            res.status(400).json({ message: "Project role ID is required" });
            return;
        }

        const memberRef = db
            .collection("projects")
            .doc(projectId)
            .collection("members")
            .doc(userId);
        
        const docSnap = await memberRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Member not found" });
            return;
        }

        const dataToUpdate = {
            projectRoleId,
            updatedAt: FieldValue.serverTimestamp(),
        };

        await memberRef.update(dataToUpdate);

        const updatedDoc = await memberRef.get();
        const memberData = updatedDoc.data();

        // Get user data from users collection
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();
        
        let userData = {};
        if (userSnap.exists) {
            userData = userSnap.data() || {};
            delete userData.password;
        }

        res.status(200).json({ 
            id: updatedDoc.id, 
            ...memberData,
            user: userData
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createMember = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { userId, projectRoleId } = req.body;

        if (!userId || !projectRoleId) {
            res.status(400).json({ message: "User ID and project role ID are required" });
            return;
        }

        // Check if user exists
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Check if member already exists
        const memberRef = db
            .collection("projects")
            .doc(projectId)
            .collection("members")
            .doc(userId);
        
        const existingMember = await memberRef.get();

        if (existingMember.exists) {
            res.status(409).json({ message: "User is already a member of this project" });
            return;
        }

        const newMemberData = {
            userId,
            projectRoleId,
            joinedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        await memberRef.set(newMemberData);

        // Get user data for response
        const userData = userSnap.data() || {};
        delete userData.password;

        res.status(201).json({ 
            id: userId, 
            ...newMemberData,
            user: userData
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMember = async (req: Request, res: Response) => {
    try {
        const { projectId, userId } = req.params;

        const memberRef = db
            .collection("projects")
            .doc(projectId)
            .collection("members")
            .doc(userId);
        
        const docSnap = await memberRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Member not found" });
            return;
        }

        await memberRef.delete();

        res.status(200).json({ message: "Member removed from project", id: userId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};