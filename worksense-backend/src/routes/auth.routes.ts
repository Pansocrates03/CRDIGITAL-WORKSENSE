import { Router } from "express";
import {
  getAllUsers,
  getUsers,
  createUser,
  updateSelf,
  updateUserByAdmin,
  deleteUser,
  login,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import { checkPlatformAdmin } from "../middlewares/adminAuth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication operations
 *   - name: Platform Admin
 *     description: Platform-level user management operations
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the user
 *               email:
 *                 type: string
 *                 description: New email for the user
 *               password:
 *                 type: string
 *                 description: New password for the user (will be hashed)
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 */
router.put("/users/:id", verifyToken, checkPlatformAdmin, updateUserByAdmin);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", verifyToken, checkPlatformAdmin, deleteUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (protected route)
 *     tags: [Authentication]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       404:
 *         description: User not found
 */
router.get("/users/:id", verifyToken, getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the user account
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       409:
 *         description: Email already in use
 */
router.post("/users", verifyToken, checkPlatformAdmin, createUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user and get a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the user account
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Test protected route access
 *     tags: [Authentication]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: Protected route access successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Protected route access successful"
 *       401:
 *         description: Unauthorized - User is not authenticated
 */
router.get("/protected", verifyToken, (req, res) => {
  res.send("Protected route access successful");
});

/**
 * @swagger
 * /me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Authentication]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: New email for the user
 *               firstName:
 *                 type: string
 *                 description: New first name for the user
 *               lastName:
 *                 type: string
 *                 description: New last name for the user
 *               gender:
 *                 type: integer
 *                 description: Gender of the user
 *               country:
 *                 type: string
 *                 description: Country of the user
 *               nickName:
 *                 type: string
 *                 description: Nickname of the user
 *               timezone:
 *                 type: integer
 *                 description: Timezone of the user
 *               pfp:
 *                 type: string
 *                 description: Profile picture URL of the user
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 */
router.put("/me", verifyToken, updateSelf);

export default router;
