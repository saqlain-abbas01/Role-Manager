import { Request, Response } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { ROLES, TASK_STATUS } from "@shared/schema";

export const getTasksList = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    let tasks;
    if (user.role === ROLES.ADMIN) {
      tasks = await storage.getAllTasks();
    } else if (user.role === ROLES.MODERATOR) {
      tasks = await storage.getTasksByCreator(user._id.toString());
    } else {
      tasks = await storage.getTasksByUser(user._id.toString());
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const input = api.tasks.create.input.parse(req.body);
    const task = await storage.createTask(input);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      res.status(400).json({ message: "Validation error" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const input = req.body;

    const task = await storage.updateTask(id as string, input);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check authorization: only moderator who created the task's project or assigned user can update (not admin)
    const project = await storage.getProject(task.projectId);
    const isAuthorized =
      (user.role === ROLES.MODERATOR &&
        project?.managerId === user._id.toString()) ||
      task.assignedToId === user._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this task" });
    }

    const updated = await storage.updateTask(id as string, input);
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const task = await storage.updateTask(id as string, {});
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check authorization: only moderator who created the task's project or assigned user can delete (not admin)
    const project = await storage.getProject(task.projectId);
    const isAuthorized =
      (user.role === ROLES.MODERATOR &&
        project?.managerId === user._id.toString()) ||
      task.assignedToId === user._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this task" });
    }

    const deleted = await storage.deleteTask(id as string);

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
