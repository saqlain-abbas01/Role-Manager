import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Query key constants
const ANALYTICS_KEY = "analytics:list";

export function useAnalytics() {
  return useQuery({
    queryKey: [ANALYTICS_KEY],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.analytics.get.responses[200].parse(await res.json());
    },
    staleTime: 0,
  });
}
