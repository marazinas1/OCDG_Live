import { Link } from "@/lib/router-compat";
import { ArrowRight, Building2, ExternalLink, Inbox, Plus, UserCog } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
import { relativeTime, useContentCounts, useRecentActivity } from "@/hooks/admin/useDashboard";
import { useAnalytics } from "@/hooks/admin/useAnalytics";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

function Stat({ value, label, to }: { value: number; label: string; to: string }) {
  return (
    <Link to={to} className="group block">
      <span className="block text-4xl font-light tabular-nums text-foreground transition-opacity group-hover:opacity-60">
        {value}
      </span>
      <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
    </Link>
  );
}

function AttentionRow({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0"
    >
      <span className="text-sm text-foreground">{children}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function AdminDashboardInner() {
  const auth = useAdminAuth();
  const isManager = auth.status === "admin" && auth.role !== "editor";
  const { data: counts } = useContentCounts();
  const { data: traffic } = useAnalytics(7, isManager);
  const { data: unread = 0 } = useUnreadInquiryCount(isManager);
  const { data: activity = [] } = useRecentActivity();

  const drafts = counts?.draftProperties ?? 0;
  const waiting = (isManager && unread > 0) || drafts > 0;

  return (
    <div className="space-y-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage listings under{" "}
          <Link to="/admin/properties" className="text-foreground underline underline-offset-4">
            Properties
          </Link>{" "}
          in the sidebar.
        </p>
      </header>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Needs attention</h2>
        <div className="mt-4">
          {waiting ? (
            <div className="rounded-lg border border-border bg-card px-6">
              {isManager && unread > 0 && (
                <AttentionRow to="/admin/inquiries">
                  {unread} unread {unread === 1 ? "inquiry" : "inquiries"}
                </AttentionRow>
              )}
              {drafts > 0 && (
                <AttentionRow to="/admin/properties">
                  {drafts} unpublished {drafts === 1 ? "property" : "properties"}
                </AttentionRow>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing waiting. Everything is published and read.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Numbers</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {isManager && <Stat value={Number(traffic?.totals?.views ?? 0)} label="Views this week" to="/admin/analytics" />}
          {isManager && <Stat value={Number(traffic?.totals?.visitors ?? 0)} label="Visitors this week" to="/admin/analytics" />}
          <Stat
            value={counts?.publishedProperties ?? 0}
            label="Published"
            to="/admin/properties"
          />
          <Stat value={counts?.draftProperties ?? 0} label="Drafts" to="/admin/properties" />
          <Stat value={counts?.activeProperties ?? 0} label="Current" to="/admin/properties" />
          <Stat value={counts?.soldProperties ?? 0} label="Sold" to="/admin/properties" />
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/properties/new">
              <Plus className="h-4 w-4" />
              Add a property
            </Link>
          </Button>
           {isManager && <Button asChild variant="outline">
            <Link to="/admin/inquiries">
              <Inbox className="h-4 w-4" />
              Inquiries
            </Link>
           </Button>}
           {isManager && <Button asChild variant="outline">
            <Link to="/admin/users">
              <UserCog className="h-4 w-4" />
              Users
            </Link>
           </Button>}
          <Button asChild variant="ghost">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View the live site
            </a>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Recent activity</h2>
        <div className="mt-4 rounded-lg border border-border bg-card px-6">
          {activity.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nothing edited yet.</p>
          ) : (
            activity.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="group flex items-center gap-4 border-b border-border py-4 last:border-b-0"
              >
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground group-hover:underline underline-offset-4">
                  {item.title}
                </span>
                <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                  {item.created ? "Created" : "Edited"} {relativeTime(item.at)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtected>
      <AdminDashboardInner />
    </AdminProtected>
  );
}
