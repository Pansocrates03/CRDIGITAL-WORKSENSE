import { Router } from "express";
import { getText } from "../controllers/sql.controllers.js";

const router = Router();

router.get("/sqltest/", getText);

export default router;