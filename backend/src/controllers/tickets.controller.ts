import { Request, Response } from "express";
import { db } from "../models/firebase.model.js";
import { FieldValue } from "firebase-admin/firestore";
import { Ticket } from "../types/ticket.type.js";

export const getTickets = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("tickets");

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

export const getTicket = async (req: Request, res: Response) => {
    try {
        const { projectId, ticketId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("tickets")
            .doc(ticketId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTicket = async (req: Request, res: Response) => {
    try {
        const { projectId, ticketId } = req.params;
        const updateData = req.body;

        const itemRef = db
            .collection("projects")
            .doc(projectId)
            .collection("tickets")
            .doc(ticketId);
        const docSnap = await itemRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Ticket not found" });
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

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const newTicketData: Ticket = req.body;

        const collectionRef = db
            .collection("projects")
            .doc(projectId)
            .collection("tickets");

        const newItemRef = await collectionRef.add(newTicketData);
        res.status(201).json({ id: newItemRef.id, ...newTicketData });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const { projectId, ticketId } = req.params;

        const documentRef = db
            .collection("projects")
            .doc(projectId)
            .collection("tickets")
            .doc(ticketId);
        const docSnap = await documentRef.get();

        if (!docSnap.exists) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }

        await documentRef.delete();

        res.status(200).json({ message: "Ticket deleted", id: ticketId });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};