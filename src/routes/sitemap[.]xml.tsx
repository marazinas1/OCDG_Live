/**
 * Live sitemap. Single source of truth: previously the same list existed as a
 * committed public/sitemap.xml, a prebuild script and an edge function, which
 * could drift apart. Now /sitemap.xml is generated per request from the static
 * public routes plus every published property that has its own page.
 */
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://oceancitydevelopment.com";

const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/developments", changefreq: "weekly", priority: "0.9" },
  { path: "/developments/active-listings", changefreq: "weekly", priority: "0.9" },
  { path: "/developments/under-contract", changefreq: "weekly", priority: "0.8" },
  { path: "/developments/coming-soon", changefreq: "monthly", priority: "0.6" },
  { path: "/developments/sold", changefreq: "monthly", priority: "0.7" },
  { path: "/gallery", changefreq: "monthly", priority: "0.7" },
  { path: "/testimonials", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const priorityForStatus = (s: string | null) =>
  s === "active" ? "0.85" : s === "under_contract" ? "0.8" : s === "coming_soon" ? "0.7" : "0.6";

async function buildSitemap(): Promise<string> {
  // Record-only past developments (has_page=false) are photo cards on the Sold
  // page, not crawlable URLs — they stay out of the sitemap.
  const { data } = await supabase
    .from("properties")
    .select("slug, status, updated_at")
    .eq("published", true)
    .eq("has_page", true);

  const urls = STATIC_PAGES.map(
    (p) =>
      `  <url><loc>${BASE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
  );

  for (const row of data ?? []) {
    const slug = xmlEscape(String(row.slug));
    const lastmod = row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : null;
    urls.push(
      `  <url><loc>${BASE_URL}/developments/${slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>${priorityForStatus(row.status)}</priority></url>`,
    );
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(await buildSitemap(), {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        }),
    },
  },
});
