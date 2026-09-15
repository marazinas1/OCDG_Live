import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** slug -> property title, so top pages read as names rather than URLs. */
export function usePropertyTitles() {
  return useQuery({
    queryKey: ["admin-property-titles"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("properties").select("slug, title");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((p) => [p.slug, p.title]));
    },
    staleTime: 5 * 60_000,
  });
}


export type AnalyticsRange = 7 | 30 | 90;

export interface AnalyticsTotals {
  views: number;
  visitors: number;
  sessions: number;
  avg_duration: number;
  bounce_rate: number;
  pages_per_visit: number;
}

export interface AnalyticsSummary {
  totals: AnalyticsTotals;
  previous: AnalyticsTotals;
  daily: { day: string; views: number; visitors: number }[];
  top_pages: { path: string; views: number }[];
  sources: { source: string; views: number }[];
  referrers: { host: string; views: number }[];
  countries: { country: string; views: number }[];
  devices: { device: string; views: number }[];
  leads: number;
}

const EMPTY_TOTALS: AnalyticsTotals = {
  views: 0,
  visitors: 0,
  sessions: 0,
  avg_duration: 0,
  bounce_rate: 0,
  pages_per_visit: 0,
};

const EMPTY: AnalyticsSummary = {
  totals: EMPTY_TOTALS,
  previous: EMPTY_TOTALS,
  daily: [],
  top_pages: [],
  sources: [],
  referrers: [],
  countries: [],
  devices: [],
  leads: 0,
};


function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Aggregated first-party analytics. Admin-only at the database level. */
export function useAnalytics(range: AnalyticsRange) {
  return useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data, error } = await supabase.rpc("analytics_summary", {
        _from: isoDay(range - 1),
        _to: isoDay(0),
      });
      if (error) throw error;
      return { ...EMPTY, ...((data as unknown as AnalyticsSummary) ?? {}) };
    },
    staleTime: 60_000,
  });
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}
