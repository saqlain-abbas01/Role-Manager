import { Request, Response } from "express";
import { storage } from "../storage";
import { TASK_STATUS, ROLES } from "@shared/schema";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [allProjects, allTasks, allUsers] = await Promise.all([
      storage.getAllProjects(),
      storage.getAllTasks(),
      storage.getAllUsers(),
    ]);

    const nonAdminUsers = allUsers.filter((u) => u.role !== ROLES.ADMIN);

    // Filter out tasks whose projects no longer exist
    const projectIds = new Set(allProjects.map((p) => p._id?.toString()));
    const validTasks = allTasks.filter((t) => projectIds.has(t.projectId));

    const projectsByStatus = [
      { name: "Active", value: allProjects.filter((p) => p.isActive).length },
      {
        name: "Inactive",
        value: allProjects.filter((p) => !p.isActive).length,
      },
    ];

    const tasksByStatus = Object.values(TASK_STATUS).map((status) => ({
      name: status,
      value: validTasks.filter((t) => t.status === status).length,
    }));

    const tasksByUser = nonAdminUsers.map((u) => {
      const userTasks = validTasks.filter(
        (t) => t.assignedToId === u._id?.toString(),
      );
      return {
        name: u.username,
        resolved: userTasks.filter(
          (t) =>
            t.status === TASK_STATUS.RESOLVED ||
            t.status === TASK_STATUS.CLOSED,
        ).length,
        open: userTasks.filter(
          (t) =>
            t.status !== TASK_STATUS.RESOLVED &&
            t.status !== TASK_STATUS.CLOSED,
        ).length,
      };
    });

    res.json({
      projectsByStatus,
      tasksByStatus,
      tasksByUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
