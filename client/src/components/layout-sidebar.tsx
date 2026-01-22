import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  BarChart3,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems = [];

  // Role-based navigation
  if (user?.role === "user") {
    // Users only see their tasks
    navItems.push({ href: "/tasks", icon: CheckSquare, label: "My Tasks" });
  } else if (user?.role === "moderator") {
    // Moderators see dashboard and projects
    navItems.push({ href: "/", icon: LayoutDashboard, label: "Dashboard" });
    navItems.push({ href: "/projects", icon: FolderKanban, label: "Projects" });
  } else if (user?.role === "admin") {
    // Admins see everything
    navItems.push({ href: "/", icon: LayoutDashboard, label: "Dashboard" });
    navItems.push({ href: "/projects", icon: FolderKanban, label: "Projects" });
    navItems.push({ href: "/analytics", icon: BarChart3, label: "Analytics" });
    navItems.push({ href: "/users", icon: Users, label: "User Management" });
  }

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">TaskFlow</h1>
            <p className="text-xs text-muted-foreground font-medium">
              Project Manager
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}
                />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarFallback className="bg-accent text-accent-foreground font-bold">
              {user?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
