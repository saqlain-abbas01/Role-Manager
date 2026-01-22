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

// Wrapper for protected routes
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
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

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/projects">
        <ProtectedRoute component={ProjectsPage} />
      </Route>
      <Route path="/projects/:id">
        <ProtectedRoute component={ProjectDetailsPage} />
      </Route>
      <Route path="/tasks">
        <ProtectedRoute component={TasksPage} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
