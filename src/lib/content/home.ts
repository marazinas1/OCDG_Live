/**
 * Homepage content, resolved from page_text / page_media / page_media_defaults
 * with the exact code fallbacks the page renders today (HERO_FALLBACKS and the
 * bundled hero image from src/hooks/useSiteSettings.ts).
 */
import { resolveMedia, resolveText, type ContentBundle } from "@/lib/content-resolver";
import { FALLBACK_HERO, HERO_FALLBACKS } from "@/hooks/useSiteSettings";

export type HomePageContent = {
  hero: {
    imageUrl: string;
    eyebrow: string;
    headline: string;
    subline: string;
    ctaLabel: string;
    quote: string;
    quoteAttribution: string;
  };
};

export function resolveHomeContent(bundle: ContentBundle): HomePageContent {
  return {
    hero: {
      imageUrl: resolveMedia(bundle, "home", "hero_image", FALLBACK_HERO),
      eyebrow: resolveText(bundle, "home", "hero_eyebrow", HERO_FALLBACKS.eyebrow),
      headline: resolveText(bundle, "home", "hero_headline", HERO_FALLBACKS.headline),
      subline: resolveText(bundle, "home", "hero_subline", HERO_FALLBACKS.subline),
      ctaLabel: resolveText(bundle, "home", "hero_cta_label", HERO_FALLBACKS.ctaLabel),
      quote: resolveText(bundle, "home", "quote", HERO_FALLBACKS.quote),
      quoteAttribution: resolveText(
        bundle,
        "home",
        "quote_attribution",
        HERO_FALLBACKS.quoteAttribution,
      ),
    },
  };
}
