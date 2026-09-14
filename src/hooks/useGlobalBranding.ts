import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { FALLBACK_LOGO, SITE_NAME_FALLBACK } from "@/hooks/useSiteSettings";
import type { GlobalBranding } from "@/lib/content/global";

const DEFAULT_BRANDING: GlobalBranding = {
  siteName: SITE_NAME_FALLBACK,
  logoUrl: FALLBACK_LOGO,
  logoDarkUrl: null,
  faviconUrl: null,
};

/**
 * Site-wide branding (logo, dark logo, site name) loaded once in the root
 * route loader. Available on every route, public or admin, without refetching.
 *
 * Falls back to the bundled mark while the root loader data is not yet
 * available (first paint of a pending/errored match, HMR reload).
 */
export function useGlobalBranding(): GlobalBranding {
  const data = useRouterState({
    select: (s) => s.matches[0]?.loaderData as GlobalBranding | undefined,
  });
  return data ?? DEFAULT_BRANDING;
}

/**
 * Swaps the document favicon at runtime when one has been uploaded. The static
 * tags in the root head remain the default for crawlers.
 */
export function useFaviconFromBranding() {
  const href = useGlobalBranding().faviconUrl;
  useEffect(() => {
    if (!href) return;
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
    const previous = links.map((l) => l.href);
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = href;
      document.head.appendChild(link);
      return () => link.remove();
    }
    links.forEach((l) => {
      l.href = href;
      l.type = "image/png";
    });
    return () => {
      links.forEach((l, i) => {
        l.href = previous[i] ?? l.href;
      });
    };
  }, [href]);
}
