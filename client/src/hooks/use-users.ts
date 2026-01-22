import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUsers() {
  return useQuery({
    queryKey: [api.users.listRole.path],
    queryFn: async () => {
      const res = await fetch(api.users.listRole.path);
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.listRole.responses[200].parse(await res.json());
    },
  });
}
