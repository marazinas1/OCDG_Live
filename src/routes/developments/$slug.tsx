import { createFileRoute, notFound } from "@tanstack/react-router";
import PropertyPage from "@/pages/PropertyPage";
import NotFound from "@/pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/seo";


type SeoProperty = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  headline: string | null;
  description: string | null;
  location_city: string | null;
  location_state: string | null;
  bedrooms: number | null;
  full_baths: number | null;
  half_baths: number | null;
  sqft: number | null;
};

type SeoImage = { category: string; storage_path: string; sort_order: number };

const publicUrl = (path: string) =>
  supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;

export const Route = createFileRoute("/developments/$slug")({
  component: PropertyPage,
  // SSR metadata loader: fetches just enough of the property to emit full
  // title/description/OG/canonical/JSON-LD in the server-rendered head.
  // The page component keeps its own full client-side query (unchanged).
  loader: async ({ params }) => {
    try {
      const { data } = await supabase
        .from("properties")
        .select(
          "id,slug,title,tagline,headline,description,location_city,location_state,bedrooms,full_baths,half_baths,sqft",
        )
        .eq("slug", params.slug)
        .eq("published", true)
        .eq("has_page", true)
        .maybeSingle();
      if (!data) return { property: null, image: null };
      const property = data as SeoProperty;
      const { data: images } = await supabase
        .from("property_images")
        .select("category,storage_path,sort_order")
        .eq("property_id", property.id)
        .in("category", ["card", "hero"])
        .order("sort_order", { ascending: true });
      const rows = (images ?? []) as SeoImage[];
      const card = rows.find((r) => r.category === "card") ?? null;
      const hero = rows.find((r) => r.category === "hero") ?? null;
      const image = card
        ? publicUrl(card.storage_path)
        : hero
          ? publicUrl(hero.storage_path)
          : null;
      return { property, image };
    } catch {
      // Metadata must never break the page — the component handles 404s.
      return { property: null, image: null };
    }
  },
  head: ({ loaderData }) => {
    const property = loaderData?.property ?? null;
    if (!property) return {};
    const image = loaderData?.image ?? null;
    const url = `${SITE}/developments/${property.slug}`;
    const title = `${property.title} — Ocean City Development Group`;
    const description = (
      property.tagline ??
      property.headline ??
      property.description ??
      `${property.title} — Ocean City Development Group`
    ).slice(0, 158);
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.title,
      description,
      url,
      ...(image ? { image } : {}),
      provider: {
        "@type": "Organization",
        "@id": "https://oceancitydevelopment.com/#organization",
        name: "Ocean City Development Group",
      },
      ...(property.location_city
        ? {
            address: {
              "@type": "PostalAddress",
              addressLocality: property.location_city,
              ...(property.location_state ? { addressRegion: property.location_state } : {}),
              addressCountry: "US",
            },
          }
        : {}),
      ...(property.bedrooms != null || property.full_baths != null || property.sqft != null
        ? {
            mainEntity: {
              "@type": "SingleFamilyResidence",
              name: property.title,
              ...(property.bedrooms != null ? { numberOfBedrooms: property.bedrooms } : {}),
              ...(property.full_baths != null
                ? {
                    numberOfBathroomsTotal:
                      property.full_baths + (property.half_baths ?? 0) * 0.5,
                  }
                : {}),
              ...(property.sqft != null
                ? {
                    floorSize: { "@type": "QuantitativeValue", value: property.sqft, unitCode: "FTK" },
                  }
                : {}),
            },
          }
        : {}),
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
});
