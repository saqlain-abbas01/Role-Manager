import { db } from "./db";
import { users, projects, tasks, type User, type InsertUser, type Project, type InsertProject, type Task, type InsertTask } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProjectsByManager(managerId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Tasks
  getAllTasks(): Promise<Task[]>; // For admin/analytics
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Session store helpers (optional, but good for completeness)
  sessionStore: any; 
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore?: any) {
    this.sessionStore = sessionStore;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProjectsByManager(managerId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.managerId, managerId));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assignedToId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }
}

export const storage = new DatabaseStorage();
