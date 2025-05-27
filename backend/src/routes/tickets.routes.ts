import express from "express";
import { getTickets, getTicket, updateTicket, createTicket, deleteTicket } from "../controllers/tickets.controller.js"

const router = express.Router({ mergeParams: true });

router.get("project/:projectId/tickets", getTickets);
router.get("project/:projectId/ticket/:ticketId", getTicket);
router.put("project/:projectId/ticket/:ticketId", updateTicket);
router.post("project/:projectId/ticket", createTicket);
router.delete("project/:projectId/ticket/:ticketId", deleteTicket)

export default router;