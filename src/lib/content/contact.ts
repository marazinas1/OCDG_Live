/**
 * Contact page copy, resolved from page_text with the exact wording the page
 * renders today as the fallback layer.
 */
import { resolveText, type ContentBundle } from "@/lib/content-resolver";

export const CONTACT_FALLBACKS = {
  heroEyebrow: "Get In Touch",
  heroTitle: "Contact Ocean City Development Group",
  infoLabel: "Ocean City Development Group",
  infoHeading: "Let's Build Together",
  formTitle: "Inquiry Form",
  formIntro: "Tell us about your project and we'll be in touch shortly.",
  leadContact: "Patrick A. Halliday",
} as const;

export type ContactPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  infoLabel: string;
  infoHeading: string;
  formTitle: string;
  formIntro: string;
};

export function resolveContactContent(bundle: ContentBundle): ContactPageContent {
  const t = (slot: string, fallback: string) => resolveText(bundle, "contact", slot, fallback);
  return {
    heroEyebrow: t("hero_eyebrow", CONTACT_FALLBACKS.heroEyebrow),
    heroTitle: t("hero_title", CONTACT_FALLBACKS.heroTitle),
    infoLabel: t("info_label", CONTACT_FALLBACKS.infoLabel),
    infoHeading: t("info_heading", CONTACT_FALLBACKS.infoHeading),
    formTitle: t("form_title", CONTACT_FALLBACKS.formTitle),
    formIntro: t("form_intro", CONTACT_FALLBACKS.formIntro),
  };
}
