import { supabase } from "@/integrations/supabase/client";

const BUCKET = "brand-assets";

export type BrandAssetKind =
  | "logo"
  | "logo_dark"
  | "favicon"
  | "hero"
  | "about_hero"
  | "about_story"
  | "about_portrait"
  | "partner_logo";

type Preset = { maxEdge: number; type: "image/png" | "image/jpeg"; quality?: number };

const PRESETS: Record<BrandAssetKind, Preset> = {
  logo: { maxEdge: 800, type: "image/png" },
  logo_dark: { maxEdge: 800, type: "image/png" },
  favicon: { maxEdge: 256, type: "image/png" },
  hero: { maxEdge: 2400, type: "image/jpeg", quality: 0.82 },
  about_hero: { maxEdge: 2400, type: "image/jpeg", quality: 0.82 },
  about_story: { maxEdge: 1800, type: "image/jpeg", quality: 0.82 },
  about_portrait: { maxEdge: 900, type: "image/png" },
  partner_logo: { maxEdge: 800, type: "image/png" },
};

export class NotAnImageError extends Error {
  constructor() {
    super("That file is not an image we can read. Use a PNG or JPG.");
    this.name = "NotAnImageError";
  }
}

/** Resizes/encodes a file with the preset for the given kind. Shared with the page-media uploader. */
export async function encodeAsset(
  file: File,
  kind: BrandAssetKind,
): Promise<{ blob: Blob; ext: "png" | "jpg"; contentType: string }> {
  const preset = PRESETS[kind];
  const blob = await encode(file, preset);
  return {
    blob,
    ext: preset.type === "image/png" ? "png" : "jpg",
    contentType: preset.type,
  };
}

async function encode(file: File, preset: Preset): Promise<Blob> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new NotAnImageError();
  }
  const longest = Math.max(bmp.width, bmp.height);
  const scale = longest > preset.maxEdge ? preset.maxEdge / longest : 1;
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));

  let blob: Blob;
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(bmp, 0, 0, w, h);
    blob = await canvas.convertToBlob({ type: preset.type, ...(preset.quality !== undefined ? { quality: preset.quality } : {}) });
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(bmp, 0, 0, w, h);
    blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas encode failed"))),
        preset.type,
        preset.quality,
      ),
    );
  }
  bmp.close?.();
  return blob;
}

/** Optimises a brand asset and uploads it to the public brand-assets bucket. */
export async function uploadBrandAsset(
  file: File,
  kind: BrandAssetKind,
  onProgress?: (percent: number) => void,
): Promise<string> {
  onProgress?.(10);
  const preset = PRESETS[kind];
  const blob = await encode(file, preset);
  onProgress?.(55);
  const ext = preset.type === "image/png" ? "png" : "jpg";
  const path = `${kind}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: preset.type,
    upsert: false,
  });
  if (error) throw error;
  onProgress?.(100);
  return path;
}

export function getBrandAssetUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes a stored brand asset. Called on replace and on remove. */
export async function deleteBrandAsset(path: string | null | undefined): Promise<void> {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
