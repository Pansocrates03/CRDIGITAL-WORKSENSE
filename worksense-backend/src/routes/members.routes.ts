import { Router } from "express";
import { getMembers, getMemberById, addMember} from "../controllers/members.controllers.js";
const router = Router();

import { verifyToken } from "../middlewares/auth.js";


router.get("/projects/:id/members", verifyToken, getMembers); // Obtener todos los miembros de un proyecto
router.get("/projects/:ProjectId/members/:MemberId", verifyToken, getMemberById); // Obtener un miembro por ID
router.post("/projects/:id/members", verifyToken, addMember); // Crear un nuevo miembro
//router.put("/projects/:id/members/:id", updateMember); // Actualizar un miembro existente
//router.delete("/projects/:id/members/:id", deleteMember); // Eliminar un miembro existente


export default router;
