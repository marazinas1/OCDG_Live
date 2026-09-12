import { getRouteApi } from "@tanstack/react-router";

import type { GlobalBranding } from "@/lib/content/global";

const rootRoute = getRouteApi("__root__");

/**
 * Site-wide branding (logo, dark logo, site name) loaded once in the root
 * route loader. Available on every route, public or admin, without refetching.
 */
export function useGlobalBranding(): GlobalBranding {
  return rootRoute.useLoaderData();
}
