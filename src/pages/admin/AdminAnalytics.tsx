import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Eye,
  Users,
  Inbox,
  TrendingUp,
  TrendingDown,
  Clock,
  LogOut,
  Layers,
  Globe,
  ExternalLink,
} from "lucide-react";

import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useAnalytics,
  usePropertyTitles,

  percentChange,
  type AnalyticsRange,
} from "@/hooks/admin/useAnalytics";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const DEVELOPMENT_HOST_PATTERNS = [
  "lovable.dev",
  ".lovable.dev",
  ".lovable.app",
  ".lovableproject.com",
  "localhost",
  "127.0.0.1",
];

function isDevelopmentHost(host: string): boolean {
  const h = host.toLowerCase();
  return DEVELOPMENT_HOST_PATTERNS.some((pattern) =>
    pattern.startsWith(".") ? h.endsWith(pattern) : h === pattern || h.endsWith(`.${pattern}`),
  );
}

const SOURCE_LABEL: Record<string, string> = {
  direct: "Direct",
  google: "Google",
  search: "Other search",
  ai: "AI assistants",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  listings: "Listing sites",
  partner: "Partner sites",
  other: "Other sites",
};

const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};


const DEVICE_LABEL: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  unknown: "Unknown",
};

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: string | number;
  change?: number | null;
  icon: typeof Eye;
  suffix?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">
        {value}
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </p>
      {change !== undefined && change !== null && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            positive ? "text-success-strong" : "text-destructive"
          }`}
        >
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {positive ? "+" : ""}
          {change}% vs previous period
        </p>
      )}
    </div>
  );
}

const COUNTRY_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryLabel(code: string): string {
  if (!code || code === "unknown") return "Unknown";
  try {
    return COUNTRY_NAMES?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const STATIC_PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/contact": "Contact",
  "/gallery": "Gallery",
  "/testimonials": "Testimonials",
  "/developments": "Developments",
  "/developments/current": "Current developments",
  "/developments/sold": "Sold",
  "/developments/active-listings": "Active listings",
  "/developments/under-contract": "Under contract",
  "/developments/coming-soon": "Coming soon",
};

/** Owners read property names, not URLs. */
function pageLabel(path: string, titles: Record<string, string>): string {
  const clean = path.replace(/\/+$/, "") || "/";
  if (STATIC_PAGE_NAMES[clean]) return STATIC_PAGE_NAMES[clean];
  const slug = clean.split("/").pop() ?? "";
  return titles[slug] ?? path;
}

function BreakdownList({
  title,
  rows,
  total,
  empty,
  icon: Icon,
}: {
  title: string;
  rows: { label: string; views: number }[];
  total: number;
  empty: string;
  icon?: typeof Eye;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-3 text-foreground">{row.label}</span>
                <span className="shrink-0 tabular-nums text-foreground">{row.views}</span>
              </div>
              <Progress
                value={total ? (row.views / total) * 100 : 0}
                className="mt-1.5 h-1"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnalyticsInner() {
  const [range, setRange] = useState<AnalyticsRange>(30);
  const { data, isLoading, error } = useAnalytics(range);
  const { data: titles = {} } = usePropertyTitles();


  const chartData = useMemo(() => {
    const byDay = new Map((data?.daily ?? []).map((d) => [d.day, d]));
    const out: { day: string; label: string; views: number; visitors: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = byDay.get(key);
      out.push({
        day: key,
        label: shortDay(key),
        views: Number(row?.views ?? 0),
        visitors: Number(row?.visitors ?? 0),
      });
    }
    return out;
  }, [data, range]);

  const totalViews = Number(data?.totals?.views ?? 0);
  const totalVisitors = Number(data?.totals?.visitors ?? 0);
  const leads = Number(data?.leads ?? 0);
  const conversion = totalVisitors ? ((leads / totalVisitors) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            First-party traffic data. No cookies, no third-party tracking.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              type="button"
              size="sm"
              variant={range === r.value ? "default" : "outline"}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load analytics. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading analytics…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Page views"
              value={totalViews}
              change={percentChange(totalViews, Number(data?.previous?.views ?? 0))}
              icon={Eye}
            />
            <StatCard
              label="Unique visitors"
              value={totalVisitors}
              change={percentChange(totalVisitors, Number(data?.previous?.visitors ?? 0))}
              icon={Users}
            />
            <StatCard label="Inquiries" value={leads} icon={Inbox} />
            <StatCard label="Conversion" value={conversion} suffix="%" icon={TrendingUp} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Avg. visit length"
              value={formatDuration(Number(data?.totals?.avg_duration ?? 0))}
              change={percentChange(
                Number(data?.totals?.avg_duration ?? 0),
                Number(data?.previous?.avg_duration ?? 0),
              )}
              icon={Clock}
            />
            <StatCard
              label="Bounce rate"
              value={Number(data?.totals?.bounce_rate ?? 0)}
              suffix="%"
              icon={LogOut}
            />
            <StatCard
              label="Pages per visit"
              value={Number(data?.totals?.pages_per_visit ?? 0).toFixed(2)}
              icon={Layers}
            />
          </div>


          <div className="mt-6 rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium text-foreground">Traffic</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#0f172a"
                    fill="url(#views)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Visitors"
                    stroke="#64748b"
                    fill="url(#visitors)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <BreakdownList
              title="Top pages"
              total={totalViews}
              empty="No page views recorded yet."
              rows={(data?.top_pages ?? []).map((p) => ({
                label: pageLabel(p.path, titles),
                views: Number(p.views),
              }))}
            />
            <BreakdownList
              title="Traffic sources"
              total={totalViews}
              empty="No sources recorded yet."
              rows={(data?.sources ?? []).map((s) => ({
                label: SOURCE_LABEL[s.source] ?? s.source,
                views: Number(s.views),
              }))}
            />
            <BreakdownList
              title="Devices"
              total={totalViews}
              empty="No devices recorded yet."
              rows={(data?.devices ?? []).map((d) => ({
                label: DEVICE_LABEL[d.device] ?? d.device,
                views: Number(d.views),
              }))}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BreakdownList
              title="Countries"
              icon={Globe}
              total={totalViews}
              empty="No country data recorded yet."
              rows={(data?.countries ?? []).map((c) => ({
                label: countryLabel(c.country),
                views: Number(c.views),
              }))}
            />
            <BreakdownList
              title="Referring sites"
              icon={ExternalLink}
              total={totalViews}
              empty="No referring sites recorded yet."
              rows={(data?.referrers ?? [])
                .filter((r) => !isDevelopmentHost(r.host))
                .map((r) => ({
                  label: r.host,
                  views: Number(r.views),
                }))}
            />
          </div>


          {totalViews === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              Data starts collecting as soon as this update is live on the public site. Visits to{" "}
              <Link to="/" className="underline underline-offset-4">
                the website
              </Link>{" "}
              will appear here within a minute.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminProtected>
      <AnalyticsInner />
    </AdminProtected>
  );
}
