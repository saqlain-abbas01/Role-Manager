import {
  UserModel,
  ProjectModel,
  TaskModel,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByRole(role: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[] | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProjectsByManager(managerId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Tasks
  getAllTasks(): Promise<Task[]>; // For admin/analytics
  getTasksByProject(projectId: string): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByCreator(creatorId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(
    id: string,
    updates: Partial<InsertTask>,
  ): Promise<Task | undefined>;

  // Session store helpers (optional, but good for completeness)
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore?: any) {
    this.sessionStore = sessionStore;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).collation({
      locale: "en",
      strength: 2,
    });

    return user ?? undefined;
  }

  async getUserByRole(role: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ role });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return UserModel.create(user);
  }

  async getAllUsers(): Promise<User[]> {
    return UserModel.find();
  }

  async getUsersByRole(role: string): Promise<User[] | undefined> {
    const user = await UserModel.find({ role });
    return user || undefined;
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return ProjectModel.find();
  }

  async getProjectsByManager(managerId: string): Promise<Project[]> {
    return ProjectModel.find({ managerId });
  }

  async getProject(id: string): Promise<Project | undefined> {
    const project = await ProjectModel.findById(id);
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    return ProjectModel.create(project);
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return TaskModel.find();
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return TaskModel.find({ projectId });
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return TaskModel.find({ assignedToId: userId });
  }

  async getTasksByCreator(creatorId: string): Promise<Task[]> {
    const projects = await ProjectModel.find({ managerId: creatorId });
    const projectIds = projects.map((p) => p._id.toString());
    return TaskModel.find({ projectId: { $in: projectIds } });
  }

  async createTask(task: InsertTask): Promise<Task> {
    return TaskModel.create(task);
  }

  async updateTask(
    id: string,
    updates: Partial<InsertTask>,
  ): Promise<Task | undefined> {
    const task = await TaskModel.findByIdAndUpdate(id, updates, { new: true });
    return task || undefined;
  }
}

export const storage = new DatabaseStorage();
