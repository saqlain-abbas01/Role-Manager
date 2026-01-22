import { Router } from "express";
import {
  getTasksList,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { ROLES } from "@shared/schema";

const router = Router();

router.get("/tasks", requireAuth, getTasksList);
router.post(
  "/tasks",
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.MODERATOR]),
  createTask,
);
router.patch("/tasks/:id", requireAuth, updateTask);
router.delete("/tasks/:id", requireAuth, deleteTask);

export default router;
