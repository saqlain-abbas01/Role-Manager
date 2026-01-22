import { storage } from "../storage";
import { ROLES, UserModel, ProjectModel, TaskModel } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    console.log("Creating seed users...");

    // Create Admin
    const hashedAdminPassword = await hashPassword("password");
    const admin = await storage.upsertUser({
      username: "admin",
      password: hashedAdminPassword,
      fullName: "System Admin",
      role: ROLES.ADMIN,
    });
    console.log("Admin user created:", admin.username);

    console.log("Seed data created successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
