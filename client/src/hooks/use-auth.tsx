import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertUserSchema, type User, type LoginRequest } from "@shared/schema";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Query key constant
const AUTH_USER_KEY = "auth:user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: [AUTH_USER_KEY],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    },
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Login error response:", data);
        throw new Error(data.message || "Login failed");
      }
      return data;
    },
    onSuccess: (user: User) => {
      // Clear old cached data from previous user
      queryClient.removeQueries({ queryKey: ["projects:list"] });
      queryClient.removeQueries({ queryKey: ["project:"] });
      queryClient.removeQueries({ queryKey: ["tasks:list"] });
      queryClient.removeQueries({ queryKey: ["analytics:list"] });
      queryClient.removeQueries({ queryKey: ["dashboard:stats"] });
      queryClient.removeQueries({ queryKey: ["dashboard:projects"] });
      queryClient.removeQueries({ queryKey: ["dashboard:tasks"] });

      // Set new user data
      queryClient.setQueryData([AUTH_USER_KEY], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.username}`,
      });
      if (user.role === "user") {
        setLocation("/tasks");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      return data;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData([AUTH_USER_KEY], user);
      toast({
        title: "Account created!",
        description: `Welcome ${user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/logout", { method: "POST" });
    },
    onSuccess: () => {
      // Clear auth user
      queryClient.setQueryData([AUTH_USER_KEY], null);

      // Clear all user-dependent cached data
      queryClient.removeQueries({ queryKey: ["projects:list"] });
      queryClient.removeQueries({ queryKey: ["project:"] });
      queryClient.removeQueries({ queryKey: ["tasks:list"] });
      queryClient.removeQueries({ queryKey: ["analytics:list"] });
      queryClient.removeQueries({ queryKey: ["dashboard:stats"] });
      queryClient.removeQueries({ queryKey: ["dashboard:projects"] });
      queryClient.removeQueries({ queryKey: ["dashboard:tasks"] });

      setLocation("/auth");
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
