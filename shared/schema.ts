import { z } from "zod";
import mongoose, { Schema, Document } from "mongoose";

// === ENUMS ===
export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
} as const;

export const TASK_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved", // User marks as resolved
  CLOSED: "closed",     // Moderator verifies and closes
} as const;

// === SCHEMAS ===

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.string().default(ROLES.USER),
  fullName: z.string().min(1),
});

export const insertProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  managerId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const insertTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().default(TASK_STATUS.OPEN),
  assignedToId: z.string().optional(),
  resolutionNotes: z.string().optional(),
  isVerified: z.boolean().default(false),
});

// === TYPES ===

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export interface User extends Document {
  _id: mongoose.Types.ObjectId;
  id?: string;
  username: string;
  password: string;
  role: string;
  fullName: string;
  createdAt: Date;
}

export interface Project extends Document {
  _id: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Task extends Document {
  _id: mongoose.Types.ObjectId;
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  assignedToId?: string;
  resolutionNotes?: string;
  isVerified: boolean;
  createdAt: Date;
}

// === MONGOOSE SCHEMAS ===

const userSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: ROLES.USER },
  fullName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new Schema<Project>({
  name: { type: String, required: true },
  description: { type: String },
  managerId: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new Schema<Task>({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: TASK_STATUS.OPEN },
  assignedToId: { type: String },
  resolutionNotes: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Add id getter to schemas for consistency
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

projectSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

taskSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

// === MODELS ===

export const UserModel = mongoose.model<User>("User", userSchema);
export const ProjectModel = mongoose.model<Project>("Project", projectSchema);
export const TaskModel = mongoose.model<Task>("Task", taskSchema);

// Request Types
export type LoginRequest = Pick<InsertUser, "username" | "password">;
export type UpdateTaskStatusRequest = {
  status: string;
  resolutionNotes?: string;
};
