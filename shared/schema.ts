import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// === TABLES ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(ROLES.USER), // admin, moderator, user
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  managerId: integer("manager_id").references(() => users.id), // The Moderator
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default(TASK_STATUS.OPEN),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  
  // Resolution & Verification
  resolutionNotes: text("resolution_notes"), // User adds notes when resolving
  isVerified: boolean("is_verified").default(false), // Moderator sets this
  
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  managedProjects: many(projects, { relationName: "manager" }),
  assignedTasks: many(tasks, { relationName: "assignee" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
    relationName: "manager",
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignee",
  }),
}));

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Request Types
export type LoginRequest = Pick<InsertUser, "username" | "password">;
export type UpdateTaskStatusRequest = {
  status: string;
  resolutionNotes?: string;
};
