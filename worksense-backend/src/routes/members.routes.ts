import { Router } from "express";
import { getMembers, getMemberById, addMember} from "../controllers/members.controllers.js";
const router = Router();


router.get("/projects/:id/members", getMembers); // Obtener todos los miembros de un proyecto
router.get("/projects/:ProjectId/members/:MemberId", getMemberById); // Obtener un miembro por ID
router.post("/projects/:id/members", addMember); // Crear un nuevo miembro
//router.put("/projects/:id/members/:id", updateMember); // Actualizar un miembro existente
//router.delete("/projects/:id/members/:id", deleteMember); // Eliminar un miembro existente


export default router;
