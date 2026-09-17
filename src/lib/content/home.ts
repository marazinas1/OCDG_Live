/**
 * Homepage content, resolved from page_text / page_media / page_media_defaults
 * with the exact code fallbacks the page renders today (HERO_FALLBACKS and the
 * bundled hero image from src/hooks/useSiteSettings.ts).
 */
import { resolveMedia, resolveText, type ContentBundle } from "@/lib/content-resolver";
import { FALLBACK_HERO, HERO_FALLBACKS } from "@/hooks/useSiteSettings";

/** The three "why us" cards. Icons stay in code; only the copy is editable. */
export const ADVANTAGE_FALLBACKS = [
  {
    title: "Architectural Excellence",
    description:
      "A decades-long partnership with Halliday Architects ensures every home is a masterwork of design, engineering, and enduring beauty.",
  },
  {
    title: "Premier Locations",
    description:
      "We focus exclusively on the most desirable Ocean City neighborhoods — from coveted beach blocks to the prestigious Gardens.",
  },
  {
    title: "Turnkey Luxury",
    description:
      "From initial concept to the final finishing touch, we deliver a seamless, white-glove building experience with no detail overlooked.",
  },
] as const;

/** Short testimonial teasers on the homepage. The anchors stay in code. */
export const SNIPPET_FALLBACKS = [
  {
    author: "Patti & Ralph Melfi",
    snippet:
      "Patti and I are very happy that we chose Scott Halliday to build our Ocean City dream home...",
  },
  {
    author: "Ken & Trudie O'Neill",
    snippet:
      "What a wonderful experience it was working with Patrick Halliday! He was so extremely helpful...",
  },
  {
    author: "Mara & Jack LaVoice",
    snippet:
      "My wife and I would just like to express our appreciation for your excellent customer service...",
  },
] as const;

export type HomeAdvantage = { title: string; description: string };
export type HomeSnippet = { author: string; snippet: string };

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
  advantages: HomeAdvantage[];
  snippets: HomeSnippet[];
};

export const advantageSlot = (index: number, field: "title" | "description") =>
  `advantage.0${index + 1}.${field}`;
export const snippetSlot = (index: number, field: "author" | "quote") =>
  `snippet.0${index + 1}.${field}`;

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
    advantages: ADVANTAGE_FALLBACKS.map((fallback, i) => ({
      title: resolveText(bundle, "home", advantageSlot(i, "title"), fallback.title),
      description: resolveText(
        bundle,
        "home",
        advantageSlot(i, "description"),
        fallback.description,
      ),
    })),
    snippets: SNIPPET_FALLBACKS.map((fallback, i) => ({
      author: resolveText(bundle, "home", snippetSlot(i, "author"), fallback.author),
      snippet: resolveText(bundle, "home", snippetSlot(i, "quote"), fallback.snippet),
    })),
  };
}
