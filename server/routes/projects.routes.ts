import { Router } from "express";
import {
  getProjectsList,
  createProject,
  getProject,
} from "../controllers/projects.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { ROLES } from "@shared/schema";

const router = Router();

router.get("/projects", requireAuth, getProjectsList);
router.post(
  "/projects",
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.MODERATOR]),
  createProject,
);
router.get("/projects/:id", requireAuth, getProject);

export default router;
