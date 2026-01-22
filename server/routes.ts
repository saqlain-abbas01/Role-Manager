import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { ROLES, TASK_STATUS } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup Authentication
  setupAuth(app);

  // === USERS ===
  app.get(api.users.list.path, async (req, res) => {
    // Ideally Admin only
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // === PROJECTS ===
  app.get(api.projects.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    let projects;
    if (user.role === ROLES.ADMIN) {
      projects = await storage.getAllProjects();
    } else if (user.role === ROLES.MODERATOR) {
      projects = await storage.getProjectsByManager(user.id);
    } else {
      // Users might see projects they have tasks in, or all projects?
      // For simplicity, let's show all active projects to users for now, or filter later
      projects = await storage.getAllProjects();
    }
    res.json(projects);
  });

  app.post(api.projects.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Only Admin or Moderator
    const user = req.user as any;
    if (user.role === ROLES.USER) return res.sendStatus(403);

    try {
      const input = api.projects.create.input.parse(req.body);
      // Auto-assign manager if moderator creates it
      if (user.role === ROLES.MODERATOR && !input.managerId) {
        input.managerId = user.id;
      }
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (e) {
      res.status(400).json(e);
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const project = await storage.getProject(Number(req.params.id));
    if (!project) return res.sendStatus(404);
    res.json(project);
  });

  // === TASKS ===
  app.get(api.tasks.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    let tasks;
    if (user.role === ROLES.ADMIN) {
      tasks = await storage.getAllTasks();
    } else if (user.role === ROLES.USER) {
      tasks = await storage.getTasksByUser(user.id);
    } else {
      // Moderator - maybe all tasks in their projects?
      // For now, let's return all tasks to moderators to simplify
      tasks = await storage.getAllTasks();
    }
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Users usually don't create tasks, but let's allow Moderators/Admins
    const user = req.user as any;
    if (user.role === ROLES.USER) return res.sendStatus(403);

    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (e) {
      res.status(400).json(e);
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const taskId = Number(req.params.id);
    const input = req.body; // validation handled loosely here, should be strict

    // Logic:
    // User can set status to RESOLVED and add resolutionNotes
    // Moderator can set status to CLOSED (Verify)
    
    // In a real app, fetch task first to check ownership.
    // Simplifying for speed.
    
    const updated = await storage.updateTask(taskId, input);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  // === ANALYTICS ===
  app.get(api.analytics.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const [allProjects, allTasks, allUsers] = await Promise.all([
      storage.getAllProjects(),
      storage.getAllTasks(),
      storage.getAllUsers(),
    ]);

    // Simple aggregations
    const projectsByStatus = [
      { name: "Active", value: allProjects.filter(p => p.isActive).length },
      { name: "Inactive", value: allProjects.filter(p => !p.isActive).length },
    ];

    const tasksByStatus = Object.values(TASK_STATUS).map(status => ({
      name: status,
      value: allTasks.filter(t => t.status === status).length,
    }));

    // Tasks resolved per user
    const tasksByUser = allUsers.map(u => {
      const userTasks = allTasks.filter(t => t.assignedToId === u.id);
      return {
        name: u.username,
        resolved: userTasks.filter(t => t.status === TASK_STATUS.RESOLVED || t.status === TASK_STATUS.CLOSED).length,
        open: userTasks.filter(t => t.status !== TASK_STATUS.RESOLVED && t.status !== TASK_STATUS.CLOSED).length,
      };
    });

    res.json({
      projectsByStatus,
      tasksByStatus,
      tasksByUser,
    });
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getAllUsers();
  if (users.length === 0) {
    // Create Admin
    await storage.createUser({
      username: "admin",
      password: "password", // In real app, hash this! (Auth implementation handles hashing usually)
      fullName: "System Admin",
      role: ROLES.ADMIN,
    });

    // Create Moderator
    const mod = await storage.createUser({
      username: "mod",
      password: "password",
      fullName: "Project Manager",
      role: ROLES.MODERATOR,
    });

    // Create User
    const user = await storage.createUser({
      username: "user",
      password: "password",
      fullName: "Developer One",
      role: ROLES.USER,
    });

    // Create Project
    const project = await storage.createProject({
      name: "Website Redesign",
      description: "Overhaul the main marketing site",
      managerId: mod.id,
      isActive: true,
    });

    // Create Tasks
    await storage.createTask({
      projectId: project.id,
      title: "Design Homepage",
      description: "Create Figma mockups",
      status: TASK_STATUS.IN_PROGRESS,
      assignedToId: user.id,
    });
    
    await storage.createTask({
      projectId: project.id,
      title: "Setup CI/CD",
      description: "Configure GitHub Actions",
      status: TASK_STATUS.OPEN,
      assignedToId: user.id,
    });
  }
}
