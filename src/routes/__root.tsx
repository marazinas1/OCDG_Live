import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import { useFaviconFromBranding } from "@/hooks/useGlobalBranding";
import { usePageTracking } from "@/hooks/usePageTracking";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import NotFound from "@/pages/NotFound";
import { fetchContent } from "@/lib/content-resolver";
import { resolveGlobalBranding } from "@/lib/content/global";
import { resolveBusinessInfo, resolveMaintenance } from "@/lib/content/business";
import MaintenanceGate from "@/components/MaintenanceGate";
import type { RootContent } from "@/hooks/useGlobalBranding";

const SITE_TITLE = "Ocean City Development Group | Luxury Coastal Homes";
const SITE_DESCRIPTION =
  "Premier custom luxury home builder in Ocean City, NJ. Designed by Halliday Architects. View active listings and portfolio.";

// Preview / non-production hosts must not be indexable. The production
// domain keeps index,follow; anything else (lovable.app previews, custom
// staging, localhost) is swapped to noindex,nofollow before crawlers
// parse the head further. (Ported from index.html.)
const ROBOTS_GUARD = `(function () { try { var host = window.location.hostname; var isProd = host === "www.oceancitydevelopment.com" || host === "oceancitydevelopment.com"; if (!isProd) { var m = document.querySelector('meta[name="robots"]'); if (m) m.setAttribute("content", "noindex, nofollow"); } } catch (e) {} })();`;

// Organization / WebSite JSON-LD, ported verbatim from index.html.
const ORG_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://oceancitydevelopment.com/#website",
      url: "https://oceancitydevelopment.com/",
      name: "Ocean City Development Group",
      description: "Premier custom luxury home builder in Ocean City, NJ.",
      publisher: { "@id": "https://oceancitydevelopment.com/#organization" },
    },
    {
      "@type": ["Organization", "HomeAndConstructionBusiness"],
      "@id": "https://oceancitydevelopment.com/#organization",
      name: "Ocean City Development Group",
      url: "https://oceancitydevelopment.com/",
      telephone: "+1-609-602-3917",
      email: "PatrickAHalliday@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "700 Haven Avenue",
        addressLocality: "Ocean City",
        addressRegion: "NJ",
        postalCode: "08226",
        addressCountry: "US",
      },
      areaServed: { "@type": "City", name: "Ocean City, NJ" },
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Site-wide branding (logo, dark logo, site name) fetched once per request so
  // every route — public and admin — can render the mark without refetching.
  loader: async (): Promise<RootContent> => {
    const bundle = await fetchContent(["global"]);
    return {
      ...resolveGlobalBranding(bundle),
      business: resolveBusinessInfo(bundle),
      maintenance: resolveMaintenance(bundle),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: "Ocean City Development Group" },
      {
        name: "robots",
        // While maintenance mode is on the public response is a holding page —
        // it must never be the version search engines cache.
        content: loaderData?.maintenance.enabled ? "noindex, nofollow" : "index, follow",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://oceancitydevelopment.com" },
      { property: "og:image", content: "https://oceancitydevelopment.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://oceancitydevelopment.com/og-image.jpg" },
      { property: "og:title", content: SITE_TITLE },
      { name: "twitter:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
    scripts: [
      { children: ROBOTS_GUARD },
      { type: "application/ld+json", children: ORG_JSON_LD },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Applies the favicon uploaded in admin settings. Must sit inside the query provider. */
function SettingsEffects() {
  useFaviconFromBranding();
  return null;
}

/** First-party pageview tracking. Must sit inside the router. */
function AnalyticsTracker() {
  usePageTracking();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsEffects />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollToTop />
        <AnalyticsTracker />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="heading-section text-charcoal mb-2">This page didn't load</h1>
        <p className="text-body mb-6">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a className="btn-outline" href="/">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
