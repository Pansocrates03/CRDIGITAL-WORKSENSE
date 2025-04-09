import { Router } from "express";
import { createItem, getAllItems, addSubItem, getSubItems } from "../controllers/items.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post("/items", verifyToken, createItem);
router.get("/items", verifyToken, getAllItems);
router.post("/items/:itemId/items", verifyToken, addSubItem);
router.get("/items/:itemId/items", verifyToken, getSubItems);

export default router;