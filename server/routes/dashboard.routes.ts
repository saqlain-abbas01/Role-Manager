import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { storage } from "../storage";
import { ROLES } from "@shared/schema";

const router = Router();

// Dashboard data for different roles
router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    console.log(
      "Fetching dashboard stats for user:",
      user.username,
      "Role:",
      user.role,
    );

    if (user.role === ROLES.ADMIN) {
      const allProjects = await storage.getAllProjects();
      const allTasks = await storage.getAllTasks();
      const allUsers = await storage.getAllUsers();

      // Filter out tasks whose projects no longer exist
      const projectIds = new Set(allProjects.map((p) => p._id?.toString()));
      const validTasks = allTasks.filter((t) => projectIds.has(t.projectId));

      const stats = {
        totalProjects: allProjects.length,
        totalTasks: validTasks.length,
        activeUsers: allUsers.filter((u) => u.role !== ROLES.ADMIN).length,
        completedTasks: validTasks.filter(
          (t) => t.status === "resolved" || t.status === "closed",
        ).length,
        pendingTasks: validTasks.filter(
          (t) => t.status === "open" || t.status === "in_progress",
        ).length,
      };

      return res.json(stats);
    } else if (user.role === ROLES.MODERATOR) {
      const myProjects = await storage.getProjectsByManager(
        user._id.toString(),
      );
      const myTasks = await storage.getTasksByCreator(user._id.toString());

      // Filter out tasks whose projects no longer exist
      const projectIds = new Set(myProjects.map((p) => p._id?.toString()));
      const validTasks = myTasks.filter((t) => projectIds.has(t.projectId));

      const stats = {
        myProjects: myProjects.length,
        myTasks: validTasks.length,
        activeProjects: myProjects.filter((p) => p.isActive).length,
        completedTasks: validTasks.filter(
          (t) => t.status === "resolved" || t.status === "closed",
        ).length,
        pendingTasks: validTasks.filter(
          (t) => t.status === "open" || t.status === "in_progress",
        ).length,
      };

      return res.json(stats);
    } else {
      // User sees only their assigned tasks
      const myTasks = await storage.getTasksByUser(user._id.toString());

      const stats = {
        assignedTasks: myTasks.length,
        completedTasks: myTasks.filter(
          (t) => t.status === "resolved" || t.status === "closed",
        ).length,
        pendingTasks: myTasks.filter(
          (t) => t.status === "open" || t.status === "in_progress",
        ).length,
        inProgressTasks: myTasks.filter((t) => t.status === "in_progress")
          .length,
      };

      return res.json(stats);
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// Detailed projects list for dashboard
router.get("/dashboard/projects", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;

    if (user.role === ROLES.ADMIN) {
      const projects = await storage.getAllProjects();
      return res.json(projects);
    } else if (user.role === ROLES.MODERATOR) {
      const projects = await storage.getProjectsByManager(user._id.toString());
      return res.json(projects);
    } else {
      // Users don't have project list
      return res.json([]);
    }
  } catch (error) {
    console.error("Dashboard projects error:", error);
    res.status(500).json({ message: "Failed to fetch projects for dashboard" });
  }
});

// Detailed tasks list for dashboard
router.get("/dashboard/tasks", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const allProjects = await storage.getAllProjects();
    const projectIds = new Set(allProjects.map((p) => p._id?.toString()));

    if (user.role === ROLES.ADMIN) {
      const tasks = await storage.getAllTasks();
      // Filter out tasks whose projects no longer exist
      const validTasks = tasks.filter((t) => projectIds.has(t.projectId));
      return res.json(validTasks);
    } else if (user.role === ROLES.MODERATOR) {
      const tasks = await storage.getTasksByCreator(user._id.toString());
      // Filter out tasks whose projects no longer exist
      const validTasks = tasks.filter((t) => projectIds.has(t.projectId));
      return res.json(validTasks);
    } else {
      const tasks = await storage.getTasksByUser(user._id.toString());
      // Filter out tasks whose projects no longer exist
      const validTasks = tasks.filter((t) => projectIds.has(t.projectId));
      return res.json(validTasks);
    }
  } catch (error) {
    console.error("Dashboard tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks for dashboard" });
  }
});

export default router;
