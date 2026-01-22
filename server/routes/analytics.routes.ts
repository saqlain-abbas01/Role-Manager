import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/analytics", requireAuth, getAnalytics);

export default router;
