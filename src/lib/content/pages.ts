/**
 * Editable copy for the remaining public pages (Gallery, Testimonials,
 * Developments). Same page_text model as home/about/contact: every string keeps
 * the wording that is on the site today as its fallback, so nothing changes
 * until someone edits it in Settings.
 */
import { resolveText, type ContentBundle } from "@/lib/content-resolver";

export const GALLERY_FALLBACKS = {
  heroEyebrow: "Our Work",
  heroTitle: "Gallery",
  emptyMessage: "No gallery images yet.",
} as const;

export const TESTIMONIALS_FALLBACKS = {
  heroEyebrow: "What Our Clients Say",
  heroTitle: "Testimonials",
  emptyMessage: "Testimonials are coming soon.",
  ctaLabel: "Ready to Build?",
  ctaHeading: "Start Your Journey",
  ctaBody: "Contact us today to discuss your dream home in Ocean City.",
  ctaButton: "Get In Touch",
} as const;

export const DEVELOPMENTS_FALLBACKS = {
  heroEyebrow: "Our Portfolio",
  heroTitle: "Developments",
} as const;

export type GalleryPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  emptyMessage: string;
};

export type TestimonialsPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  emptyMessage: string;
  ctaLabel: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
};

export type DevelopmentsPageContent = {
  heroEyebrow: string;
  heroTitle: string;
};

export function resolveGalleryContent(bundle: ContentBundle): GalleryPageContent {
  const t = (slot: string, fallback: string) => resolveText(bundle, "gallery", slot, fallback);
  return {
    heroEyebrow: t("hero_eyebrow", GALLERY_FALLBACKS.heroEyebrow),
    heroTitle: t("hero_title", GALLERY_FALLBACKS.heroTitle),
    emptyMessage: t("empty_message", GALLERY_FALLBACKS.emptyMessage),
  };
}

export function resolveTestimonialsContent(bundle: ContentBundle): TestimonialsPageContent {
  const t = (slot: string, fallback: string) => resolveText(bundle, "testimonials", slot, fallback);
  return {
    heroEyebrow: t("hero_eyebrow", TESTIMONIALS_FALLBACKS.heroEyebrow),
    heroTitle: t("hero_title", TESTIMONIALS_FALLBACKS.heroTitle),
    emptyMessage: t("empty_message", TESTIMONIALS_FALLBACKS.emptyMessage),
    ctaLabel: t("cta_label", TESTIMONIALS_FALLBACKS.ctaLabel),
    ctaHeading: t("cta_heading", TESTIMONIALS_FALLBACKS.ctaHeading),
    ctaBody: t("cta_body", TESTIMONIALS_FALLBACKS.ctaBody),
    ctaButton: t("cta_button", TESTIMONIALS_FALLBACKS.ctaButton),
  };
}

export function resolveDevelopmentsContent(bundle: ContentBundle): DevelopmentsPageContent {
  const t = (slot: string, fallback: string) => resolveText(bundle, "developments", slot, fallback);
  return {
    heroEyebrow: t("hero_eyebrow", DEVELOPMENTS_FALLBACKS.heroEyebrow),
    heroTitle: t("hero_title", DEVELOPMENTS_FALLBACKS.heroTitle),
  };
}

export const DEFAULT_GALLERY_CONTENT: GalleryPageContent = { ...GALLERY_FALLBACKS };
export const DEFAULT_TESTIMONIALS_CONTENT: TestimonialsPageContent = { ...TESTIMONIALS_FALLBACKS };
export const DEFAULT_DEVELOPMENTS_CONTENT: DevelopmentsPageContent = { ...DEVELOPMENTS_FALLBACKS };
