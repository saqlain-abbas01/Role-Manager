import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { Sidebar } from "@/components/layout-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsers();

  if (user?.role !== "admin") return <div>Access Denied</div>;
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">View all registered users and their roles.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {u.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.fullName}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">@{u.username}</TableCell>
                    <TableCell>
                      <Badge variant={
                        u.role === 'admin' ? 'destructive' : 
                        u.role === 'moderator' ? 'default' : 
                        'secondary'
                      } className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date().toLocaleDateString()} {/* Placeholder for join date if not in schema */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
