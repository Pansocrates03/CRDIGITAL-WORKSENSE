import { Router } from "express";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    login,
    verifyToken

} from "../controllers/sql.controllers.js";

const router = Router();



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


router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.post("/login", login);

// Ruta protegida (solo accesible con token)
router.get('/protected', verifyToken, (req, res) => {
    res.send('Accediste a una ruta protegida');
});   


export default router;