import { Request, Response } from "express";
import { storage } from "../storage";

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersByRoleList = async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsersByRole("user");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
