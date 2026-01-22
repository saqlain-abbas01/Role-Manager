import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailsPage from "@/pages/project-details-page";
import TasksPage from "@/pages/tasks-page";
import AnalyticsPage from "@/pages/analytics-page";
import UsersPage from "@/pages/users-page";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Wrapper for protected routes with role-based access
function ProtectedRoute({
  component: Component,
  requiredRoles,
}: {
  component: React.ComponentType;
  requiredRoles?: string[];
}) {
  function RouteComponent() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return <Redirect to="/auth" />;
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return <Redirect to="/" />;
    }

    return <Component />;
  }

  return <RouteComponent />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute
          component={DashboardPage}
          requiredRoles={["admin", "moderator"]}
        />
      </Route>
      <Route path="/projects">
        <ProtectedRoute
          component={ProjectsPage}
          requiredRoles={["admin", "moderator"]}
        />
      </Route>
      <Route path="/projects/:id">
        <ProtectedRoute
          component={ProjectDetailsPage}
          requiredRoles={["admin", "moderator"]}
        />
      </Route>
      <Route path="/tasks">
        <ProtectedRoute
          component={TasksPage}
          requiredRoles={["user", "admin", "moderator"]}
        />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} requiredRoles={["admin"]} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} requiredRoles={["admin"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
