/**
 * Three-layer content resolver shared by every public page.
 *
 *   text  : page_text row (owner value)            -> code fallback constant
 *   media : page_media row (owner image)           -> page_media_defaults row
 *                                                   -> bundled code asset
 *
 * The code fallback layer is NOT invented here: callers pass the exact
 * constants/assets the page renders today (HERO_FALLBACKS, ABOUT_FALLBACKS and
 * the bundled images in src/hooks/useSiteSettings.ts), so pages that have no
 * stored rows keep looking byte-identical.
 */
import { supabase } from "@/integrations/supabase/client";

export type PageTextRow = { page: string; slot: string; value: string };
export type PageMediaRow = {
  page: string;
  slot: string;
  bucket: string;
  storage_path: string;
  alt_text: string;
};

export type ContentBundle = {
  text: PageTextRow[];
  media: PageMediaRow[];
  defaults: PageMediaRow[];
};

export const EMPTY_BUNDLE: ContentBundle = { text: [], media: [], defaults: [] };

/** Fetches every text/media/default row for the given pages in one round trip each. */
export async function fetchContent(pages: string[]): Promise<ContentBundle> {
  const [text, media, defaults] = await Promise.all([
    supabase.from("page_text").select("page, slot, value").in("page", pages),
    supabase
      .from("page_media")
      .select("page, slot, bucket, storage_path, alt_text")
      .in("page", pages),
    supabase
      .from("page_media_defaults")
      .select("page, slot, bucket, storage_path, alt_text")
      .in("page", pages),
  ]);
  if (text.error) throw text.error;
  if (media.error) throw media.error;
  if (defaults.error) throw defaults.error;
  return {
    text: (text.data ?? []) as PageTextRow[],
    media: (media.data ?? []) as PageMediaRow[],
    defaults: (defaults.data ?? []) as PageMediaRow[],
  };
}

function publicUrl(row: PageMediaRow): string {
  return supabase.storage.from(row.bucket).getPublicUrl(row.storage_path).data.publicUrl;
}

/** Stored non-blank value, else the code fallback. */
export function resolveText(
  bundle: ContentBundle,
  page: string,
  slot: string,
  fallback: string,
): string {
  const row = bundle.text.find((r) => r.page === page && r.slot === slot);
  const value = row?.value?.trim();
  return value && value.length > 0 ? value : fallback;
}

/**
 * Same as resolveText, but distinguishes "never set" from "deliberately cleared":
 * a stored blank row returns null so the caller can hide the element entirely.
 */
export function resolveOptionalText(
  bundle: ContentBundle,
  page: string,
  slot: string,
  fallback: string,
): string | null {
  const row = bundle.text.find((r) => r.page === page && r.slot === slot);
  if (!row) return fallback.trim() ? fallback : null;
  const value = row.value?.trim() ?? "";
  return value.length > 0 ? value : null;
}


/** Owner image -> developer default -> bundled asset. */
export function resolveMedia(
  bundle: ContentBundle,
  page: string,
  slot: string,
  fallback: string,
): string {
  const row =
    bundle.media.find((r) => r.page === page && r.slot === slot) ??
    bundle.defaults.find((r) => r.page === page && r.slot === slot);
  return row ? publicUrl(row) : fallback;
}

/** Same lookup, but returns null when nothing is stored (no bundled fallback). */
export function resolveMediaOrNull(
  bundle: ContentBundle,
  page: string,
  slot: string,
): string | null {
  const row =
    bundle.media.find((r) => r.page === page && r.slot === slot) ??
    bundle.defaults.find((r) => r.page === page && r.slot === slot);
  return row ? publicUrl(row) : null;
}

export type ResolvedPartner = {
  id: string;
  name: string;
  url: string;
  description: string;
  logoUrl: string | null;
};

const PARTNER_SLOT = /^partner\.(\d+)\.name$/;

/**
 * Collects numbered partner.NN.* slots in ordinal order. A partner exists when
 * its name slot exists; its logo comes only from a media row, mirroring the
 * current behaviour where a stored partner without a logo renders no logo.
 */
export function collectPartners(bundle: ContentBundle, page: string): ResolvedPartner[] {
  const ordinals = bundle.text
    .filter((r) => r.page === page && PARTNER_SLOT.test(r.slot))
    .map((r) => r.slot.match(PARTNER_SLOT)?.[1] ?? "")
    .filter((n) => n.length > 0)
    .sort((a, b) => Number(a) - Number(b));

  return ordinals.map((n) => ({
    id: `partner-${n}`,
    name: resolveText(bundle, page, `partner.${n}.name`, ""),
    url: resolveText(bundle, page, `partner.${n}.url`, ""),
    description: resolveText(bundle, page, `partner.${n}.description`, ""),
    logoUrl: resolveMediaOrNull(bundle, page, `partner.${n}.logo`),
  }));
}
