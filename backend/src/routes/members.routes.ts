import express from "express";
import { getMembers, getMember, updateMember, createMember, deleteMember, updateMemberRole } from "../controllers/members.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/project/:projectId/members", getMembers);
router.get("/project/:projectId/member/:memberId", getMember);
router.put("/project/:projectId/member/:memberId", updateMember);
router.post("/project/:projectId/member", createMember);
router.delete("/project/:projectId/member/:memberId", deleteMember);
router.patch("/project/:projectId/member/:memberId", updateMemberRole);

export default router;