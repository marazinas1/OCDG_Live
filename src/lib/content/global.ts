/**
 * Global (site-wide) branding, resolved from page_text / page_media /
 * page_media_defaults with the exact code fallbacks the site renders today.
 *
 * Fetched once in the root route loader so every page — public and admin —
 * can read it without an extra request.
 */
import {
  resolveMedia,
  resolveMediaOrNull,
  resolveText,
  type ContentBundle,
} from "@/lib/content-resolver";
import { FALLBACK_LOGO, SITE_NAME_FALLBACK } from "@/hooks/useSiteSettings";

export type GlobalBranding = {
  siteName: string;
  logoUrl: string;
  /** Null when no dedicated dark mark exists; the light mark is knocked out instead. */
  logoDarkUrl: string | null;
  /** Null when nothing is uploaded; the static tags in the head stay in charge. */
  faviconUrl: string | null;
};

export function resolveGlobalBranding(bundle: ContentBundle): GlobalBranding {
  return {
    siteName: resolveText(bundle, "global", "site_name", SITE_NAME_FALLBACK),
    logoUrl: resolveMedia(bundle, "global", "logo", FALLBACK_LOGO),
    logoDarkUrl: resolveMediaOrNull(bundle, "global", "logo_dark"),
    faviconUrl: resolveMediaOrNull(bundle, "global", "favicon"),
  };
}
