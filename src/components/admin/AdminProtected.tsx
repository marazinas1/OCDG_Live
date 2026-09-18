import { ReactNode } from "react";
import { Navigate } from "@/lib/router-compat";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import AdminShell from "./AdminShell";
import type { AdminRole } from "@/hooks/admin/useAdminAuth";
import { Button } from "@/components/ui/button";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
  </div>
);

export default function AdminProtected({
  children,
  allowedRoles = ["developer", "owner", "editor"],
}: {
  children: ReactNode;
  allowedRoles?: AdminRole[];
}) {
  const auth = useAdminAuth();

  if (auth.status === "loading") return <Spinner />;
  if (auth.status === "unauthorized") return <Navigate to="/admin/login" replace />;

  if (!allowedRoles.includes(auth.role)) {
    return (
      <AdminShell email={auth.email} role={auth.role}>
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-semibold text-foreground">Read-only access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your Editor role does not include access to this area.
          </p>
          <Button asChild className="mt-5">
            <a href="/admin">Return to Dashboard</a>
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell email={auth.email} role={auth.role}>
      {children}
    </AdminShell>
  );
}