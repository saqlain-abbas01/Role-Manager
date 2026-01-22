import { storage } from "../storage";
import { ROLES, UserModel } from "@shared/schema";
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
    // Delete existing seed users to ensure clean state
    await UserModel.deleteMany({
      username: { $in: ["admin", "mod", "user"] },
    });

    console.log("Creating seed users...");

    // Create Admin
    const hashedAdminPassword = await hashPassword("password");
    const admin = await storage.createUser({
      username: "admin",
      password: hashedAdminPassword,
      fullName: "System Admin",
      role: ROLES.ADMIN,
    });
    console.log("Admin user created:", admin.username);

    // Create Moderator
    const hashedModPassword = await hashPassword("password");
    const mod = await storage.createUser({
      username: "mod",
      password: hashedModPassword,
      fullName: "Project Manager",
      role: ROLES.MODERATOR,
    });
    console.log("Moderator user created:", mod.username);

    // Create User
    const hashedUserPassword = await hashPassword("password");
    const user = await storage.createUser({
      username: "user",
      password: hashedUserPassword,
      fullName: "Developer One",
      role: ROLES.USER,
    });
    console.log("User created:", user.username);

    // Create Project
    const project = await storage.createProject({
      name: "Website Redesign",
      description: "Overhaul the main marketing site",
      managerId: mod._id.toString(),
      isActive: true,
    });
    console.log("Project created:", project.name);

    console.log("Seed data created successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
