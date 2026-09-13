import { useQuery } from "@tanstack/react-query";
import {
  fetchPastDevelopments,
  fetchPropertyCards,
  type PublicPropertyCard,
} from "@/lib/content/properties";
import type { PropertyStatus } from "@/lib/admin/status";

export type { PublicPropertyCard };

/**
 * Fetches published properties (optionally filtered by status). Excludes
 * record-only entries (has_page=false) by default — those are surfaced via
 * `usePastDevelopments`. Pass `includeRecordOnly` to opt in.
 *
 * The actual query lives in @/lib/content/properties so route loaders (SSR)
 * and this hook share one implementation.
 */
export function usePublicProperties(opts?: {
  status?: PropertyStatus | PropertyStatus[];
  includeRecordOnly?: boolean;
}) {
  const statusFilter = opts?.status
    ? Array.isArray(opts.status)
      ? opts.status
      : [opts.status]
    : null;
  const includeRecordOnly = opts?.includeRecordOnly ?? false;
  const key = [
    "public-properties",
    statusFilter ? statusFilter.join(",") : "all",
    includeRecordOnly ? "with-record-only" : "no-record-only",
  ];

  return useQuery({
    queryKey: key,
    queryFn: () => fetchPropertyCards(opts),
  });
}

/**
 * Record-only past developments (has_page=false). Rendered as non-clickable
 * social-proof cards on the Sold page.
 */
export function usePastDevelopments() {
  return useQuery({
    queryKey: ["past-developments"],
    queryFn: fetchPastDevelopments,
  });
}

/**
 * Loops within a status group to compute prev/next siblings for a given slug.
 * Wraps at ends. Returns null neighbors when the slug is alone in its group.
 */
export function usePropertyNeighbors(
  currentSlug: string | undefined,
  currentStatus: PropertyStatus | undefined,
) {
  const query = usePublicProperties(currentStatus ? { status: currentStatus } : undefined);
  const list = query.data ?? [];
  const idx = currentSlug ? list.findIndex((p) => p.slug === currentSlug) : -1;
  if (idx < 0 || list.length < 2) {
    return { prev: null, next: null, isLoading: query.isLoading };
  }
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  return { prev, next, isLoading: query.isLoading };
}
