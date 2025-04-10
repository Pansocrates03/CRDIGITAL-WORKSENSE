import { Router } from "express";
import {
    getAllUsers,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    login
} from "../controllers/auth.controllers.js";

import { verifyToken } from "../middlewares/auth.js";

const router = Router();


router.get("/users", verifyToken, getAllUsers);
router.get("/users/:id", getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario con los datos proporcionados
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El usuario ya existe
 */
router.post("/users/", createUser);


router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Permite a los usuarios iniciar sesión con sus credenciales y devuelve un token de acceso
 *     responses:
 *       200:
 *         description: Message, token
 *       400:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

// Ruta protegida (solo accesible con token)
router.get('/protected', verifyToken, (req, res) => {
    res.send('Accediste a una ruta protegida');
});   


export default router;