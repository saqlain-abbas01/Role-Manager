import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { api } from "@shared/routes";

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [api.dashboard.stats.path, user?.id],
    queryFn: async () => {
      try {
        const res = await fetch(api.dashboard.stats.path);
        if (!res.ok) {
          const text = await res.text();
          console.error("Dashboard stats error response:", res.status, text);
          throw new Error(`Failed to fetch dashboard stats: ${res.statusText}`);
        }
        const data = await res.json();
        return api.dashboard.stats.responses[200].parse(data);
      } catch (error) {
        console.error("Dashboard stats fetch error:", error);
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useDashboardProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [api.dashboard.projects.path, user?.id],
    queryFn: async () => {
      try {
        const res = await fetch(api.dashboard.projects.path);
        if (!res.ok) {
          const text = await res.text();
          console.error("Dashboard projects error response:", res.status, text);
          throw new Error(`Failed to fetch projects: ${res.statusText}`);
        }
        const data = await res.json();
        return api.dashboard.projects.responses[200].parse(data);
      } catch (error) {
        console.error("Dashboard projects fetch error:", error);
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useDashboardTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [api.dashboard.tasks.path, user?.id],
    queryFn: async () => {
      try {
        const res = await fetch(api.dashboard.tasks.path);
        if (!res.ok) {
          const text = await res.text();
          console.error("Dashboard tasks error response:", res.status, text);
          throw new Error(`Failed to fetch tasks: ${res.statusText}`);
        }
        const data = await res.json();
        return api.dashboard.tasks.responses[200].parse(data);
      } catch (error) {
        console.error("Dashboard tasks fetch error:", error);
        throw error;
      }
    },
    enabled: !!user,
  });
}
