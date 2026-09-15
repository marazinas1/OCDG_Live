/**
 * Admin-side reads and writes for the page_text / page_media content model.
 * Writes rely on the is_admin() policies already in place on both tables.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import {
  fetchContent,
  EMPTY_BUNDLE,
  type ContentBundle,
  type PageMediaRow,
} from "@/lib/content-resolver";
import { deleteStoredObject, uploadPageMedia } from "@/lib/admin/uploadPageMedia";
import type { BrandAssetKind } from "@/lib/admin/uploadBrandAsset";

export const PAGE_CONTENT_KEY = ["page-content-admin"];

export function usePageContent(pages: string[]) {
  const query = useQuery({
    queryKey: [...PAGE_CONTENT_KEY, ...pages],
    queryFn: () => fetchContent(pages),
  });
  return { ...query, bundle: (query.data ?? EMPTY_BUNDLE) as ContentBundle };
}

export function findMedia(
  bundle: ContentBundle,
  page: string,
  slot: string,
): PageMediaRow | null {
  return bundle.media.find((r) => r.page === page && r.slot === slot) ?? null;
}

export type TextEntry = { slot: string; value: string };

/**
 * Upserts non-blank values and deletes the slots that were cleared.
 *
 * Slots listed in `preserveBlank` are stored as an empty row instead of being
 * deleted: for those, "cleared" means "hide this", not "fall back to the
 * built-in default".
 */
export async function writeText(
  page: string,
  entries: TextEntry[],
  options: { preserveBlank?: string[] } = {},
): Promise<void> {
  const preserve = new Set(options.preserveBlank ?? []);
  const keep = entries.filter((e) => e.value.trim().length > 0 || preserve.has(e.slot));
  const clear = entries
    .filter((e) => e.value.trim().length === 0 && !preserve.has(e.slot))
    .map((e) => e.slot);

  if (keep.length) {
    const { error } = await supabase
      .from("page_text")
      .upsert(
        keep.map((e) => ({ page, slot: e.slot, value: e.value.trim() })),
        { onConflict: "page,slot" },
      );
    if (error) throw error;
  }

  if (clear.length) {
    const { error } = await supabase
      .from("page_text")
      .delete()
      .eq("page", page)
      .in("slot", clear);
    if (error) throw error;
  }
}

export async function writeMedia(
  page: string,
  slot: string,
  bucket: string,
  storagePath: string,
  altText = "",
): Promise<void> {
  const { error } = await supabase
    .from("page_media")
    .upsert({ page, slot, bucket, storage_path: storagePath, alt_text: altText }, {
      onConflict: "page,slot",
    });
  if (error) throw error;
}

export async function removeMediaRow(page: string, slot: string): Promise<void> {
  const { error } = await supabase.from("page_media").delete().eq("page", page).eq("slot", slot);
  if (error) throw error;
}

/** Invalidates both the admin query cache and the router loaders that read content. */
export function useContentInvalidate() {
  const qc = useQueryClient();
  const router = useRouter();
  return async () => {
    await qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });
    await router.invalidate();
  };
}

export function useSaveText() {
  const invalidate = useContentInvalidate();
  return useMutation({
    mutationFn: ({
      page,
      entries,
      preserveBlank,
    }: {
      page: string;
      entries: TextEntry[];
      preserveBlank?: string[];
    }) => writeText(page, entries, preserveBlank ? { preserveBlank } : {}),

    onSuccess: invalidate,
  });
}

export function useSaveMedia() {
  const invalidate = useContentInvalidate();
  return useMutation({
    mutationFn: async ({
      page,
      slot,
      kind,
      file,
      previous,
      altText,
      onProgress,
    }: {
      page: string;
      slot: string;
      kind: BrandAssetKind;
      file: File;
      previous: PageMediaRow | null;
      altText?: string;
      onProgress?: (percent: number) => void;
    }) => {
      const { bucket, storagePath } = await uploadPageMedia(file, kind, page, slot, onProgress);
      await writeMedia(page, slot, bucket, storagePath, altText ?? previous?.alt_text ?? "");
      if (previous) await deleteStoredObject(previous.bucket, previous.storage_path);
    },
    onSuccess: invalidate,
  });
}

export function useRemoveMedia() {
  const invalidate = useContentInvalidate();
  return useMutation({
    mutationFn: async ({
      page,
      slot,
      previous,
    }: {
      page: string;
      slot: string;
      previous: PageMediaRow | null;
    }) => {
      await removeMediaRow(page, slot);
      if (previous) await deleteStoredObject(previous.bucket, previous.storage_path);
    },
    onSuccess: invalidate,
  });
}
