import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { FALLBACK_LOGO, SITE_NAME_FALLBACK } from "@/hooks/useSiteSettings";
import type { GlobalBranding } from "@/lib/content/global";
import {
  DEFAULT_BUSINESS_INFO,
  DEFAULT_MAINTENANCE,
  type BusinessInfo,
  type MaintenanceState,
} from "@/lib/content/business";

/** Everything the root route loader resolves once per request. */
export type RootContent = GlobalBranding & {
  business: BusinessInfo;
  maintenance: MaintenanceState;
};

const DEFAULT_BRANDING: GlobalBranding = {
  siteName: SITE_NAME_FALLBACK,
  logoUrl: FALLBACK_LOGO,
  logoDarkUrl: null,
  faviconUrl: null,
};

function useRootContent(): RootContent | undefined {
  return useRouterState({
    select: (s) => s.matches[0]?.loaderData as RootContent | undefined,
  });
}

/**
 * Site-wide branding (logo, dark logo, site name) loaded once in the root
 * route loader. Available on every route, public or admin, without refetching.
 *
 * Falls back to the bundled mark while the root loader data is not yet
 * available (first paint of a pending/errored match, HMR reload).
 */
export function useGlobalBranding(): GlobalBranding {
  return useRootContent() ?? DEFAULT_BRANDING;
}

/** Contact details and socials, editable in Settings → Business. */
export function useBusinessInfo(): BusinessInfo {
  return useRootContent()?.business ?? DEFAULT_BUSINESS_INFO;
}

/** Maintenance-mode switch, editable in Settings → Maintenance. */
export function useMaintenance(): MaintenanceState {
  return useRootContent()?.maintenance ?? DEFAULT_MAINTENANCE;
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
