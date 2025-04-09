import { Router } from "express";
import {
  createItem,
  getAllItems,
  createSubItem,
  getSubItemsByReader,
} from "../controllers/items.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post("/items", verifyToken, createItem);
router.get("/items", getAllItems);
//router.post("/items/:itemId/items", verifyToken, addSubItem);
//router.get("/items/:itemId/items", verifyToken, getSubItems);
router.post("/items/subitem", verifyToken, createSubItem); 
router.get("/items/subitems", verifyToken, getSubItemsByReader); 

export default router;
