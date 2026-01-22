import { z } from "zod";
import {
  insertUserSchema,
  insertProjectSchema,
  insertTaskSchema,
  User,
  Project,
  Task,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<User>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    list: {
      method: "GET" as const,
      path: "/api/users",
      responses: {
        200: z.array(z.custom<User>()),
      },
    },
    listRole: {
      method: "GET" as const,
      path: "/api/users/role/user",
      responses: {
        200: z.array(z.custom<User>()),
      },
    },
  },
  projects: {
    list: {
      method: "GET" as const,
      path: "/api/projects",
      responses: {
        200: z.array(z.custom<Project>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/projects",
      input: insertProjectSchema,
      responses: {
        201: z.custom<Project>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/projects/:id",
      responses: {
        200: z.custom<Project>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/projects/:id",
      input: insertProjectSchema.partial(),
      responses: {
        200: z.custom<Project>(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/projects/:id",
      responses: {
        200: z.object({ message: z.string() }),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  tasks: {
    list: {
      method: "GET" as const,
      path: "/api/tasks",
      responses: {
        200: z.array(z.custom<Task>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/tasks",
      input: insertTaskSchema,
      responses: {
        201: z.custom<Task>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/tasks/:id",
      input: insertTaskSchema.partial().extend({
        resolutionNotes: z.string().optional(),
        isVerified: z.boolean().optional(),
      }),
      responses: {
        200: z.custom<Task>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/tasks/:id",
      responses: {
        200: z.object({ message: z.string() }),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    get: {
      method: "GET" as const,
      path: "/api/analytics",
      responses: {
        200: z.object({
          projectsByStatus: z.array(
            z.object({ name: z.string(), value: z.number() }),
          ),
          tasksByStatus: z.array(
            z.object({ name: z.string(), value: z.number() }),
          ),
          tasksByUser: z.array(
            z.object({
              name: z.string(),
              resolved: z.number(),
              open: z.number(),
            }),
          ),
        }),
      },
    },
  },
  dashboard: {
    stats: {
      method: "GET" as const,
      path: "/api/dashboard/stats",
      responses: {
        200: z.record(z.number()),
      },
    },
    projects: {
      method: "GET" as const,
      path: "/api/dashboard/projects",
      responses: {
        200: z.array(z.custom<Project>()),
      },
    },
    tasks: {
      method: "GET" as const,
      path: "/api/dashboard/tasks",
      responses: {
        200: z.array(z.custom<Task>()),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
