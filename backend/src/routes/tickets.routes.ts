import express from "express";
import { getTicket, updateTicket, createTicket, deleteTicket } from "../controllers/tickets.controller"

const router = express.Router({ mergeParams: true });

router.get("project/:projectId/ticket", getTicket);
router.put("project/:projectId/ticket", updateTicket);
router.post("project/:projectId/ticket", createTicket);
router.delete("project/:projectId/ticket", deleteTicket)

export default router;