/**
 * About page content, resolved from page_text / page_media / page_media_defaults
 * with the exact code fallbacks the page renders today.
 */
import {
  collectPartners,
  resolveMedia,
  resolveText,
  type ContentBundle,
  type ResolvedPartner,
} from "@/lib/content-resolver";
import {
  ABOUT_FALLBACKS,
  FALLBACK_PARTNERS,
  FALLBACK_ABOUT_HERO,
  FALLBACK_ABOUT_STORY,
  FALLBACK_PORTRAIT,
  SITE_NAME_FALLBACK,
} from "@/hooks/useSiteSettings";

export type AboutPageContent = {
  siteName: string;
  heroImageUrl: string;
  storyImageUrl: string;
  portraitImageUrl: string;
  heroEyebrow: string;
  heroTitle: string;
  storyLabel: string;
  storyHeading: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyQuote: string;
  storyQuoteAttribution: string;
  leaderName: string;
  leaderRole: string;
  promiseLabel: string;
  promiseHeading: string;
  promiseParagraph: string;
  partnersLabel: string;
  partnersHeading: string;
  partners: ResolvedPartner[];
};

export function resolveAboutContent(bundle: ContentBundle): AboutPageContent {
  const stored = collectPartners(bundle, "about");
  const partners: ResolvedPartner[] = stored.length
    ? stored
    : FALLBACK_PARTNERS.map((p, i) => ({
        id: `fallback-${i}`,
        name: p.name,
        url: p.url,
        description: p.description,
        logoUrl: p.logoUrl,
      }));

  return {
    siteName: resolveText(bundle, "global", "site_name", SITE_NAME_FALLBACK),
    heroImageUrl: resolveMedia(bundle, "about", "hero_image", FALLBACK_ABOUT_HERO),
    storyImageUrl: resolveMedia(bundle, "about", "story_image", FALLBACK_ABOUT_STORY),
    portraitImageUrl: resolveMedia(bundle, "about", "portrait_image", FALLBACK_PORTRAIT),
    heroEyebrow: resolveText(bundle, "about", "hero_eyebrow", ABOUT_FALLBACKS.heroEyebrow),
    heroTitle: resolveText(bundle, "about", "hero_title", ABOUT_FALLBACKS.heroTitle),
    storyLabel: resolveText(bundle, "about", "story_label", ABOUT_FALLBACKS.storyLabel),
    storyHeading: resolveText(bundle, "about", "story_heading", ABOUT_FALLBACKS.storyHeading),
    storyParagraph1: resolveText(
      bundle,
      "about",
      "story_paragraph_1",
      ABOUT_FALLBACKS.storyParagraph1,
    ),
    storyParagraph2: resolveText(
      bundle,
      "about",
      "story_paragraph_2",
      ABOUT_FALLBACKS.storyParagraph2,
    ),
    storyQuote: resolveText(bundle, "about", "story_quote", ABOUT_FALLBACKS.storyQuote),
    storyQuoteAttribution: resolveText(
      bundle,
      "about",
      "story_quote_attribution",
      ABOUT_FALLBACKS.storyQuoteAttribution,
    ),
    leaderName: resolveText(bundle, "about", "leader_name", ABOUT_FALLBACKS.leaderName),
    leaderRole: resolveText(bundle, "about", "leader_role", ABOUT_FALLBACKS.leaderRole),
    promiseLabel: resolveText(bundle, "about", "promise_label", ABOUT_FALLBACKS.promiseLabel),
    promiseHeading: resolveText(bundle, "about", "promise_heading", ABOUT_FALLBACKS.promiseHeading),
    promiseParagraph: resolveText(
      bundle,
      "about",
      "promise_paragraph",
      ABOUT_FALLBACKS.promiseParagraph,
    ),
    partnersLabel: resolveText(bundle, "about", "partners_label", ABOUT_FALLBACKS.partnersLabel),
    partnersHeading: resolveText(
      bundle,
      "about",
      "partners_heading",
      ABOUT_FALLBACKS.partnersHeading,
    ),
    partners,
  };
}
