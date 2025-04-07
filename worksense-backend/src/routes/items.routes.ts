import { Router } from "express";
import { createItem, getAllItems } from "../controllers/items.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post("/items", verifyToken, createItem);
router.get("/items", verifyToken, getAllItems);

export default router;