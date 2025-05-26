import { Request, Response } from "express";
import { db } from "../models/firebase.model.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../types/user.type.js";

export const login = async (req: Request, res: Response) => {
    try {
        // Get credentials data
        const { email, password } = req.body;

        // Error handling
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        // Get users collection
        const collectionRef = db
            .collection("users")
            .where("email", "==", email);
        const snapshot = await collectionRef.get();

        // Check if user exists
        if (snapshot.empty) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        // Get user data
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data() as Omit<User, 'id'>;
        
        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, userData.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const user: User = {
            id: userDoc.id,
            email: userData.email,
            password: userData.password
        };

        // Remove sensitive data
        delete user.password;

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user 
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
