import { Router } from "express";
import { getUsuarios, addUsuario } from "../controllers/firebase.controllers.js";

const router = Router();

router.get("/usuarios", getUsuarios);
router.post("/usuarios", addUsuario);

export default router;
