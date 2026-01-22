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

      const stats = {
        totalProjects: allProjects.length,
        totalTasks: allTasks.length,
        activeUsers: allUsers.filter((u) => u.role !== ROLES.ADMIN).length,
        completedTasks: allTasks.filter(
          (t) => t.status === "resolved" || t.status === "closed",
        ).length,
        pendingTasks: allTasks.filter(
          (t) => t.status === "open" || t.status === "in_progress",
        ).length,
      };

      return res.json(stats);
    } else if (user.role === ROLES.MODERATOR) {
      const myProjects = await storage.getProjectsByManager(
        user._id.toString(),
      );
      const myTasks = await storage.getTasksByCreator(user._id.toString());

      const stats = {
        myProjects: myProjects.length,
        myTasks: myTasks.length,
        activeProjects: myProjects.filter((p) => p.isActive).length,
        completedTasks: myTasks.filter(
          (t) => t.status === "resolved" || t.status === "closed",
        ).length,
        pendingTasks: myTasks.filter(
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

    if (user.role === ROLES.ADMIN) {
      const tasks = await storage.getAllTasks();
      return res.json(tasks);
    } else if (user.role === ROLES.MODERATOR) {
      const tasks = await storage.getTasksByCreator(user._id.toString());
      return res.json(tasks);
    } else {
      const tasks = await storage.getTasksByUser(user._id.toString());
      return res.json(tasks);
    }
  } catch (error) {
    console.error("Dashboard tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks for dashboard" });
  }
});

export default router;
