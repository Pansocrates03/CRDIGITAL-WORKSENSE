import express from "express";
import { getUsers, getUser, updateUser, createUser, deleteUser } from "../controllers/users.controller.js"

const router = express.Router({ mergeParams: true });

router.get("/users", getUsers);
router.get("/user/:userId", getUser);
router.put("/user/:userId", updateUser);
router.post("/user", createUser);
router.delete("/user/:userId", deleteUser)

export default router;