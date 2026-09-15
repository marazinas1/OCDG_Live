/**
 * Business identity (contact details, socials) and the maintenance-mode switch.
 *
 * Both live on the `global` page of the page_text model and are resolved in the
 * root route loader, so every page — public and admin — reads them without an
 * extra request. The fallbacks are the exact values the site renders today, so
 * nothing changes visually until someone edits a field in Settings.
 */
import { resolveText, resolveOptionalText, type ContentBundle } from "@/lib/content-resolver";

export const BUSINESS_FALLBACKS = {
  contactName: "Patrick Halliday",
  phone: "(609) 602-3917",
  email: "PatrickAHalliday@gmail.com",
  addressLine1: "700 Haven Avenue",
  addressLine2: "Ocean City, NJ 08226",
  blurb: "Premier residential developments and custom homes in Ocean City, New Jersey.",
  facebookUrl: "https://www.facebook.com/profile.php?id=61557120296532",
  instagramUrl: "https://www.instagram.com/oceancitydevelopmentgroup/",
} as const;

export const MAINTENANCE_FALLBACK_MESSAGE =
  "We are making a few improvements to the site and will be back shortly.";

export type BusinessInfo = {
  contactName: string;
  phone: string;
  /** tel: href derived from the phone number's digits. */
  phoneHref: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  blurb: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

export type MaintenanceState = {
  enabled: boolean;
  message: string;
};

const telHref = (phone: string) => {
  const digits = phone.replace(/[^0-9+]/g, "");
  return digits.length ? `tel:${digits}` : "";
};

export function resolveBusinessInfo(bundle: ContentBundle): BusinessInfo {
  const t = (slot: string, fallback: string) => resolveText(bundle, "global", slot, fallback);
  const phone = t("business.phone", BUSINESS_FALLBACKS.phone);
  const facebook = resolveOptionalText(
    bundle,
    "global",
    "business.facebook_url",
    BUSINESS_FALLBACKS.facebookUrl,
  );
  const instagram = resolveOptionalText(
    bundle,
    "global",
    "business.instagram_url",
    BUSINESS_FALLBACKS.instagramUrl,
  );

  return {
    contactName: t("business.contact_name", BUSINESS_FALLBACKS.contactName),
    phone,
    phoneHref: telHref(phone),
    email: t("business.email", BUSINESS_FALLBACKS.email),
    addressLine1: t("business.address_line_1", BUSINESS_FALLBACKS.addressLine1),
    addressLine2: t("business.address_line_2", BUSINESS_FALLBACKS.addressLine2),
    blurb: t("business.blurb", BUSINESS_FALLBACKS.blurb),
    facebookUrl: facebook,
    instagramUrl: instagram,
  };

}

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  contactName: BUSINESS_FALLBACKS.contactName,
  phone: BUSINESS_FALLBACKS.phone,
  phoneHref: telHref(BUSINESS_FALLBACKS.phone),
  email: BUSINESS_FALLBACKS.email,
  addressLine1: BUSINESS_FALLBACKS.addressLine1,
  addressLine2: BUSINESS_FALLBACKS.addressLine2,
  blurb: BUSINESS_FALLBACKS.blurb,
  facebookUrl: BUSINESS_FALLBACKS.facebookUrl,
  instagramUrl: BUSINESS_FALLBACKS.instagramUrl,
};

export function resolveMaintenance(bundle: ContentBundle): MaintenanceState {
  return {
    enabled: resolveText(bundle, "global", "maintenance.enabled", "off").trim() === "on",
    message: resolveText(bundle, "global", "maintenance.message", MAINTENANCE_FALLBACK_MESSAGE),
  };
}

export const DEFAULT_MAINTENANCE: MaintenanceState = {
  enabled: false,
  message: MAINTENANCE_FALLBACK_MESSAGE,
};
