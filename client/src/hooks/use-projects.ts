import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertProject, type Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return api.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [api.projects.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.projects.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch project");
      return api.projects.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await fetch(api.projects.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return api.projects.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      toast({ title: "Success", description: "Project created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });
}
