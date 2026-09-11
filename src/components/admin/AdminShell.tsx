import { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { Home } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import type { AdminRole } from "@/hooks/admin/useAdminAuth";

export default function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: AdminRole;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AdminSidebar email={email} role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-slate-200 bg-white px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <span className="font-semibold text-slate-900 tracking-tight truncate">
              OCDG Admin
            </span>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </header>
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
