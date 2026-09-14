/**
 * Route-level head() helper — replaces the old react-helmet-async <SEO>
 * component with server-rendered metadata. Every public route calls
 * pageHead() so crawlers and social previews read full meta from raw HTML.
 */
export const SITE = "https://oceancitydevelopment.com";

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}

type PageHeadArgs = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function pageHead({ title, description, path, type = "website", image, jsonLd }: PageHeadArgs) {
  const url = `${SITE}${path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      ...(image ? [{ property: "og:image", content: image }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(image ? [{ name: "twitter:image", content: image }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
    ...(schemas.length > 0
      ? {
          scripts: schemas.map((schema) => ({
            type: "application/ld+json",
            children: JSON.stringify(schema),
          })),
        }
      : {}),
  };
}
