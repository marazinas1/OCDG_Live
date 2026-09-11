import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBrandAssetUrl } from "@/lib/admin/uploadBrandAsset";
import fallbackLogo from "@/assets/ocdg-logo.png";
import fallbackHero from "@/assets/28th-ext-view2.jpg";
import fallbackAboutHero from "@/assets/subpage-hero.jpg";
import fallbackAboutStory from "@/assets/28th-approach-v4.jpg";
import fallbackPortrait from "@/assets/patrick-halliday.png";
import fallbackPartnerHalliday from "@/assets/halliday-logo.png";
import fallbackPartnerLeonard from "@/assets/partner-halliday-leonard.jpg";

export const SITE_SETTINGS_KEY = ["site-settings"];

export const SITE_NAME_FALLBACK = "Ocean City Development Group";

/** Homepage hero copy the client has not overridden yet. */
export const HERO_FALLBACKS = {
  eyebrow: "Ocean City Development Group",
  headline: "Building the Future\nof Ocean City",
  subline: "Premier Residential Developments & Custom Homes",
  ctaLabel: "View Developments",
  quote:
    "\"We don't just build houses; we craft coastal legacies through timeless design and uncompromising quality.\"",
  quoteAttribution: "Patrick Halliday",
} as const;


export type PartnerEntry = {
  id: string;
  name: string;
  url: string;
  logo_path: string | null;
  description: string;
};

/** About page copy the client has not overridden yet. */
export const ABOUT_FALLBACKS = {
  heroEyebrow: "Who We Are",
  heroTitle: "About Ocean City Development Group",
  storyLabel: "Our Story",
  storyHeading: "Defining Coastal Luxury",
  storyParagraph1:
    "Ocean City Development Group takes great pride in providing our customers with an unmatched level of customer service. As a full-service development company, we strive to build long-lasting relationships with our clients and fulfill all their new construction needs.",
  storyParagraph2:
    "With over 45 years of real estate development experience, the partners of Ocean City Development Group take pride in our work and look forward to creating the new home you've always dreamed of.",
  storyQuote: "\"Building dreams, one home at a time.\"",
  storyQuoteAttribution: "The Halliday-Leonard Family",
  leaderName: "Patrick Halliday",
  leaderRole: "Managing Partner",
  promiseLabel: "Our Promise",
  promiseHeading: "Timeless Design. Superior Craftsmanship.",
  promiseParagraph:
    "Our attention to detail allows you to sit back, relax, and step into the reality you've always dreamed of. We have been involved in thousands of custom homes and developments throughout Ocean City, NJ.",
  partnersLabel: "Our Partners",
  partnersHeading: "Trusted Collaborators",
} as const;

export const FALLBACK_PARTNERS: { name: string; url: string; logoUrl: string; description: string }[] = [
  {
    name: "Halliday Architects",
    url: "https://www.hallidayarchitects.com/",
    logoUrl: fallbackPartnerHalliday,
    description:
      "Every Ocean City Development Group project is brought to life in collaboration with Halliday Architects, whose award-winning designs blend coastal elegance with modern functionality.",
  },
  {
    name: "Halliday-Leonard Custom Home Builders",
    url: "https://www.hallidayleonardllc.com/",
    logoUrl: fallbackPartnerLeonard,
    description:
      "Our trusted construction partner, Halliday-Leonard delivers master-level craftsmanship on every residence — combining decades of building expertise with an unwavering commitment to quality.",
  },
];

export type SiteSettingsRow = {
  id: string;
  site_name: string;
  logo_path: string | null;
  logo_dark_path: string | null;
  favicon_path: string | null;
  hero_image_path: string | null;
  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_subline: string | null;
  hero_cta_label: string | null;
  home_quote: string | null;
  home_quote_attribution: string | null;
  about_hero_image_path: string | null;
  about_story_image_path: string | null;

  about_portrait_image_path: string | null;
  about_hero_eyebrow: string | null;
  about_hero_title: string | null;
  about_story_label: string | null;
  about_story_heading: string | null;
  about_story_paragraph_1: string | null;
  about_story_paragraph_2: string | null;
  about_story_quote: string | null;
  about_story_quote_attribution: string | null;
  about_leader_name: string | null;
  about_leader_role: string | null;
  about_promise_label: string | null;
  about_promise_heading: string | null;
  about_promise_paragraph: string | null;
  about_partners_label: string | null;
  about_partners_heading: string | null;
  about_partners: PartnerEntry[] | null;
};

const COLUMNS =
  "id, site_name, logo_path, logo_dark_path, favicon_path, hero_image_path, hero_eyebrow, hero_headline, hero_subline, hero_cta_label, " +
  "home_quote, home_quote_attribution, " +
  "about_hero_image_path, about_story_image_path, about_portrait_image_path, about_hero_eyebrow, about_hero_title, " +
  "about_story_label, about_story_heading, about_story_paragraph_1, about_story_paragraph_2, about_story_quote, " +
  "about_story_quote_attribution, about_leader_name, about_leader_role, about_promise_label, about_promise_heading, " +
  "about_promise_paragraph, about_partners_label, about_partners_heading, about_partners";

const trimmed = (value: string | null | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value.trim() : fallback;

export type HeroContent = {
  imageUrl: string;
  eyebrow: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  quote: string;
  quoteAttribution: string;
};

export function resolveHero(row: Partial<SiteSettingsRow> | null): HeroContent {
  return {
    imageUrl: row?.hero_image_path ? getBrandAssetUrl(row.hero_image_path) : fallbackHero,
    eyebrow: trimmed(row?.hero_eyebrow, HERO_FALLBACKS.eyebrow),
    headline: trimmed(row?.hero_headline, HERO_FALLBACKS.headline),
    subline: trimmed(row?.hero_subline, HERO_FALLBACKS.subline),
    ctaLabel: trimmed(row?.hero_cta_label, HERO_FALLBACKS.ctaLabel),
    quote: trimmed(row?.home_quote, HERO_FALLBACKS.quote),
    quoteAttribution: trimmed(row?.home_quote_attribution, HERO_FALLBACKS.quoteAttribution),
  };
}


export type AboutPartner = {
  id: string;
  name: string;
  url: string;
  logoUrl: string | null;
  description: string;
};

export type AboutContent = {
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
  partners: AboutPartner[];
};

export function resolveAbout(row: Partial<SiteSettingsRow> | null): AboutContent {
  const stored = Array.isArray(row?.about_partners) ? row!.about_partners! : [];
  const partners: AboutPartner[] = stored.length
    ? stored.map((p, i) => ({
        id: p.id ?? `partner-${i}`,
        name: p.name ?? "",
        url: p.url ?? "",
        logoUrl: p.logo_path ? getBrandAssetUrl(p.logo_path) : null,
        description: p.description ?? "",
      }))
    : FALLBACK_PARTNERS.map((p, i) => ({ id: `fallback-${i}`, ...p }));

  return {
    heroImageUrl: row?.about_hero_image_path
      ? getBrandAssetUrl(row.about_hero_image_path)
      : fallbackAboutHero,
    storyImageUrl: row?.about_story_image_path
      ? getBrandAssetUrl(row.about_story_image_path)
      : fallbackAboutStory,
    portraitImageUrl: row?.about_portrait_image_path
      ? getBrandAssetUrl(row.about_portrait_image_path)
      : fallbackPortrait,
    heroEyebrow: trimmed(row?.about_hero_eyebrow, ABOUT_FALLBACKS.heroEyebrow),
    heroTitle: trimmed(row?.about_hero_title, ABOUT_FALLBACKS.heroTitle),
    storyLabel: trimmed(row?.about_story_label, ABOUT_FALLBACKS.storyLabel),
    storyHeading: trimmed(row?.about_story_heading, ABOUT_FALLBACKS.storyHeading),
    storyParagraph1: trimmed(row?.about_story_paragraph_1, ABOUT_FALLBACKS.storyParagraph1),
    storyParagraph2: trimmed(row?.about_story_paragraph_2, ABOUT_FALLBACKS.storyParagraph2),
    storyQuote: trimmed(row?.about_story_quote, ABOUT_FALLBACKS.storyQuote),
    storyQuoteAttribution: trimmed(
      row?.about_story_quote_attribution,
      ABOUT_FALLBACKS.storyQuoteAttribution,
    ),
    leaderName: trimmed(row?.about_leader_name, ABOUT_FALLBACKS.leaderName),
    leaderRole: trimmed(row?.about_leader_role, ABOUT_FALLBACKS.leaderRole),
    promiseLabel: trimmed(row?.about_promise_label, ABOUT_FALLBACKS.promiseLabel),
    promiseHeading: trimmed(row?.about_promise_heading, ABOUT_FALLBACKS.promiseHeading),
    promiseParagraph: trimmed(row?.about_promise_paragraph, ABOUT_FALLBACKS.promiseParagraph),
    partnersLabel: trimmed(row?.about_partners_label, ABOUT_FALLBACKS.partnersLabel),
    partnersHeading: trimmed(row?.about_partners_heading, ABOUT_FALLBACKS.partnersHeading),
    partners,
  };
}

export type SiteSettings = {
  row: SiteSettingsRow | null;
  siteName: string;
  /** Mark for light surfaces. Always resolves — falls back to the bundled logo. */
  logoUrl: string;
  /** Mark for dark surfaces. Null when no dark variant exists (caller inverts). */
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  hero: HeroContent;
  about: AboutContent;
};

export const FALLBACK_LOGO = fallbackLogo;
export const FALLBACK_HERO = fallbackHero;
export const FALLBACK_ABOUT_HERO = fallbackAboutHero;
export const FALLBACK_ABOUT_STORY = fallbackAboutStory;
export const FALLBACK_PORTRAIT = fallbackPortrait;
/** The site ships a built-in favicon in public/; used as the settings preview default. */
export const FALLBACK_FAVICON = "/favicon.png";

const EMPTY: SiteSettings = {
  row: null,
  siteName: SITE_NAME_FALLBACK,
  logoUrl: fallbackLogo,
  logoDarkUrl: null,
  faviconUrl: null,
  hero: resolveHero(null),
  about: resolveAbout(null),
};

export function useSiteSettings() {
  const query = useQuery({
    queryKey: SITE_SETTINGS_KEY,
    staleTime: 60_000,
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select(COLUMNS)
        .maybeSingle();
      if (error) throw error;
      const row = (data as unknown as SiteSettingsRow | null) ?? null;
      return {
        row,
        siteName: row?.site_name?.trim() || SITE_NAME_FALLBACK,
        logoUrl: row?.logo_path ? getBrandAssetUrl(row.logo_path) : fallbackLogo,
        logoDarkUrl: row?.logo_dark_path ? getBrandAssetUrl(row.logo_dark_path) : null,
        faviconUrl: row?.favicon_path ? getBrandAssetUrl(row.favicon_path) : null,
        hero: resolveHero(row),
        about: resolveAbout(row),
      };
    },
  });

  return { ...query, settings: query.data ?? EMPTY };
}

/**
 * Swaps the document favicon at runtime when one has been uploaded. The static
 * tags in index.html remain the default for crawlers.
 */
export function useFaviconFromSettings() {
  const { settings } = useSiteSettings();
  const href = settings.faviconUrl;
  useEffect(() => {
    if (!href) return;
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
    );
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
