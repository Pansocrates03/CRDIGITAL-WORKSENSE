import { Router } from "express";
import { getText, getProjects } from "../controllers/sql.controllers.js";

const router = Router();

router.get("/sqltest/", getText);
router.get("/allprojects/", getProjects)

export default router;