import { Router } from "express";
import { addEpic } from "../controllers/epics.controllers.js"

const router = Router();

/* router.get("/usuarios", getUsuarios);*/
router.post("/projects/:id/epics", addEpic);

export default router;