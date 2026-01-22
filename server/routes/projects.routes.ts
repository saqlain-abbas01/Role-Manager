import { Router } from "express";
import {
  getProjectsList,
  createProject,
  getProject,
  updateProject,
  deleteProject,
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
router.patch(
  "/projects/:id",
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.MODERATOR]),
  updateProject,
);
router.delete(
  "/projects/:id",
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.MODERATOR]),
  deleteProject,
);

export default router;
