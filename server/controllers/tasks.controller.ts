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
    const { id } = req.params;
    const input = req.body;

    const updated = await storage.updateTask(id as string, input);
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
