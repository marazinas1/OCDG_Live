import { Link } from "@/lib/router-compat";
import { ArrowRight, Building2, ExternalLink, Inbox, Plus, UserCog } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
import { relativeTime, useContentCounts, useRecentActivity } from "@/hooks/admin/useDashboard";
import { useAnalytics } from "@/hooks/admin/useAnalytics";

function Stat({ value, label, to }: { value: number; label: string; to: string }) {
  return (
    <Link to={to} className="group block">
      <span className="block text-4xl font-light tabular-nums text-slate-900 transition-opacity group-hover:opacity-60">
        {value}
      </span>
      <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
    </Link>
  );
}

function AttentionRow({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0"
    >
      <span className="text-sm text-slate-900">{children}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function AdminDashboardInner() {
  const { data: counts } = useContentCounts();
  const { data: traffic } = useAnalytics(7);
  const { data: unread = 0 } = useUnreadInquiryCount();
  const { data: activity = [] } = useRecentActivity();

  const drafts = counts?.draftProperties ?? 0;
  const waiting = unread > 0 || drafts > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage listings under{" "}
          <Link to="/admin/properties" className="text-slate-900 underline underline-offset-4">
            Properties
          </Link>{" "}
          in the sidebar.
        </p>
      </header>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Needs attention</h2>
        <div className="mt-4">
          {waiting ? (
            <div className="rounded-lg border border-slate-200 bg-card px-6">
              {unread > 0 && (
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
            <p className="text-sm text-slate-500">
              Nothing waiting. Everything is published and read.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Numbers</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <Stat
            value={Number(traffic?.totals?.views ?? 0)}
            label="Views this week"
            to="/admin/analytics"
          />
          <Stat
            value={Number(traffic?.totals?.visitors ?? 0)}
            label="Visitors this week"
            to="/admin/analytics"
          />
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
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/properties/new">
              <Plus className="h-4 w-4" />
              Add a property
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/inquiries">
              <Inbox className="h-4 w-4" />
              Inquiries
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/users">
              <UserCog className="h-4 w-4" />
              Users
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View the live site
            </a>
          </Button>
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
