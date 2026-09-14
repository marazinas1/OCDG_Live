/**
 * Uploads for the page_media content model. New images always land in the
 * public `page-media` bucket; rows created earlier keep their own bucket and
 * are deleted from that bucket when replaced.
 */
import { supabase } from "@/integrations/supabase/client";
import { encodeAsset, type BrandAssetKind } from "@/lib/admin/uploadBrandAsset";

export const PAGE_MEDIA_BUCKET = "page-media";

export type UploadedMedia = { bucket: string; storagePath: string };

/** Optimises an image and uploads it to the page-media bucket. */
export async function uploadPageMedia(
  file: File,
  kind: BrandAssetKind,
  page: string,
  slot: string,
  onProgress?: (percent: number) => void,
): Promise<UploadedMedia> {
  onProgress?.(10);
  const { blob, ext, contentType } = await encodeAsset(file, kind);
  onProgress?.(55);
  const safeSlot = slot.replace(/[^a-z0-9._-]/gi, "-");
  const storagePath = `${page}/${safeSlot}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PAGE_MEDIA_BUCKET).upload(storagePath, blob, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });
  if (error) throw error;
  onProgress?.(100);
  return { bucket: PAGE_MEDIA_BUCKET, storagePath };
}

/** Removes a stored object from whichever bucket it lives in. Best effort. */
export async function deleteStoredObject(
  bucket: string | null | undefined,
  storagePath: string | null | undefined,
): Promise<void> {
  if (!bucket || !storagePath) return;
  await supabase.storage.from(bucket).remove([storagePath]);
}

export function publicUrlFor(bucket: string, storagePath: string): string {
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}
