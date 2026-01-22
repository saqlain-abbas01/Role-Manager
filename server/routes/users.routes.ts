import { Router } from "express";
import {
  getUsersByRoleList,
  getUsersList,
} from "../controllers/users.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { ROLES } from "@shared/schema";

const router = Router();

router.get("/users", requireAuth, requireRole([ROLES.ADMIN]), getUsersList);

router.get(
  "/users/role/user",
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.MODERATOR]),
  getUsersByRoleList,
);

export default router;
