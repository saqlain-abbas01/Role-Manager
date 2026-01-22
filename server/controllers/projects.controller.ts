import { Request, Response } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { ROLES } from "@shared/schema";

export const getProjectsList = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    let projects;
    if (user.role === ROLES.ADMIN) {
      projects = await storage.getAllProjects();
    } else if (user.role === ROLES.MODERATOR) {
      projects = await storage.getProjectsByManager(user._id.toString());
    } else {
      projects = await storage.getAllProjects();
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const input = api.projects.create.input.parse(req.body);

    // Auto-assign manager if moderator creates it
    if (user.role === ROLES.MODERATOR && !input.managerId) {
      input.managerId = user._id.toString();
    }

    const project = await storage.createProject(input);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      res.status(400).json({ message: "Validation error" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Fetching project with id:", id);
    const project = await storage.getProject(id as string);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const input = api.projects.update.input.parse(req.body);

    const project = await storage.getProject(id as string);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check authorization: only moderator who created it can update (not admin)
    const isManager =
      user.role === ROLES.MODERATOR &&
      project.managerId === user._id.toString();

    if (!isManager) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this project" });
    }

    const updatedProject = await storage.updateProject(id as string, input);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      res.status(400).json({ message: "Validation error" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const project = await storage.getProject(id as string);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check authorization: only moderator who created it can delete (not admin)
    const isManager =
      user.role === ROLES.MODERATOR &&
      project.managerId === user._id.toString();

    if (!isManager) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this project" });
    }

    const deleted = await storage.deleteProject(id as string);

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
