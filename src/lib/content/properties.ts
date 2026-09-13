/**
 * Shared property-card fetchers used by both route loaders (SSR) and the
 * client-side React Query hooks. Lifted verbatim from usePublicProperties so
 * server-rendered and client-refreshed lists can never drift.
 */
import { supabase } from "@/integrations/supabase/client";
import type { PropertyStatus } from "@/lib/admin/status";

export type PublicPropertyCard = {
  id: string;
  slug: string;
  title: string;
  price: string | null;
  status: PropertyStatus;
  tagline: string | null;
  description: string | null;
  location: string;
  listed_date: string | null;
  created_at: string;
  card_image_url: string | null;
  has_page: boolean;
};

const publicUrl = (path: string) =>
  supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;

const formatLocation = (row: {
  location_neighborhood: string | null;
  location_city: string | null;
  location_state: string | null;
}) => {
  const parts = [row.location_neighborhood, row.location_city, row.location_state].filter(
    (x): x is string => !!x && x.trim().length > 0,
  );
  return parts.join(", ");
};

export type PropertyCardQuery = {
  status?: PropertyStatus | PropertyStatus[];
  includeRecordOnly?: boolean;
};

export async function fetchPropertyCards(
  opts?: PropertyCardQuery,
): Promise<PublicPropertyCard[]> {
  const statusFilter = opts?.status
    ? Array.isArray(opts.status)
      ? opts.status
      : [opts.status]
    : null;
  const includeRecordOnly = opts?.includeRecordOnly ?? false;

  let q = supabase
    .from("properties")
    .select(
      "id, slug, title, price, status, tagline, description, location_neighborhood, location_city, location_state, listed_date, created_at, published, has_page",
    )
    .eq("published", true);
  if (statusFilter) q = q.in("status", statusFilter);
  if (!includeRecordOnly) q = q.eq("has_page", true);
  const { data: rows, error } = await q;
  if (error) throw error;

  const props = (rows ?? []) as Array<{
    id: string;
    slug: string;
    title: string;
    price: string | null;
    status: string;
    tagline: string | null;
    description: string | null;
    location_neighborhood: string | null;
    location_city: string | null;
    location_state: string | null;
    listed_date: string | null;
    created_at: string;
    has_page: boolean;
  }>;

  // Fetch card + hero images for these properties in one round-trip.
  const ids = props.map((p) => p.id);
  const imagesByProperty: Record<string, { card?: string; hero?: string }> = {};
  if (ids.length) {
    const { data: imgs, error: imgErr } = await supabase
      .from("property_images")
      .select("property_id, category, storage_path, sort_order")
      .in("property_id", ids)
      .in("category", ["card", "hero"])
      .order("sort_order", { ascending: true });
    if (imgErr) throw imgErr;
    for (const row of imgs ?? []) {
      const bucket = (imagesByProperty[row.property_id] ??= {});
      if (row.category === "card" && !bucket.card) bucket.card = row.storage_path;
      if (row.category === "hero" && !bucket.hero) bucket.hero = row.storage_path;
    }
  }

  const cards: PublicPropertyCard[] = props.map((p) => {
    const paths = imagesByProperty[p.id];
    const path = paths?.card ?? paths?.hero ?? null;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price,
      status: p.status as PropertyStatus,
      tagline: p.tagline,
      description: p.description,
      location: formatLocation(p),
      listed_date: p.listed_date,
      created_at: p.created_at,
      card_image_url: path ? publicUrl(path) : null,
      has_page: p.has_page,
    };
  });

  cards.sort((a, b) => {
    const ta = a.listed_date ? Date.parse(a.listed_date) : -Infinity;
    const tb = b.listed_date ? Date.parse(b.listed_date) : -Infinity;
    if (ta !== tb) return tb - ta;
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  });

  return cards;
}

/**
 * Record-only past developments (has_page=false, sold). Same ordering as
 * before: newest listed year first, then higher sold price first.
 */
export async function fetchPastDevelopments(): Promise<PublicPropertyCard[]> {
  const { data: rows, error } = await supabase
    .from("properties")
    .select(
      "id, slug, title, price, status, tagline, description, location_neighborhood, location_city, location_state, listed_date, created_at, published, has_page",
    )
    .eq("published", true)
    .eq("has_page", false)
    .eq("status", "sold");
  if (error) throw error;
  const props = (rows ?? []) as Array<{
    id: string;
    slug: string;
    title: string;
    price: string | null;
    status: string;
    tagline: string | null;
    description: string | null;
    location_neighborhood: string | null;
    location_city: string | null;
    location_state: string | null;
    listed_date: string | null;
    created_at: string;
    has_page: boolean;
  }>;
  const ids = props.map((p) => p.id);
  const imagesByProperty: Record<string, string> = {};
  if (ids.length) {
    const { data: imgs } = await supabase
      .from("property_images")
      .select("property_id, storage_path, sort_order")
      .eq("category", "card")
      .in("property_id", ids)
      .order("sort_order", { ascending: true });
    for (const img of imgs ?? []) {
      if (!imagesByProperty[img.property_id])
        imagesByProperty[img.property_id] = img.storage_path;
    }
  }
  const cards: PublicPropertyCard[] = props.map((p) => {
    const path = imagesByProperty[p.id] ?? null;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price,
      status: p.status as PropertyStatus,
      tagline: p.tagline,
      description: p.description,
      location: formatLocation(p),
      listed_date: p.listed_date,
      created_at: p.created_at,
      card_image_url: path ? publicUrl(path) : null,
      has_page: p.has_page,
    };
  });
  const parsePrice = (v: string | null) => (v ? Number(v.replace(/[^0-9.]/g, "")) || 0 : 0);
  cards.sort((a, b) => {
    const ya = a.listed_date ? new Date(a.listed_date).getFullYear() : 0;
    const yb = b.listed_date ? new Date(b.listed_date).getFullYear() : 0;
    if (ya !== yb) return yb - ya;
    return parsePrice(b.price) - parsePrice(a.price);
  });
  return cards;
}
