import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useBeforeUnload } from "@/lib/router-compat";
import { useQueryClient } from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2, Plus, X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

import AdminProtected from "@/components/admin/AdminProtected";
import StringListEditor from "@/components/admin/StringListEditor";
import SpecsEditor, { SpecItem } from "@/components/admin/SpecsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { supabase } from "@/integrations/supabase/client";
import { useProperty } from "@/hooks/admin/useProperty";
import { useSlugAvailability } from "@/hooks/admin/useSlugAvailability";
import { useDeleteProperty } from "@/hooks/admin/useDeleteProperty";
import {
  ImageCategory,
  deleteStorageObjects,
  getPublicUrl,
  sweepPropertyFolder,
  uploadImage,
} from "@/lib/admin/imageUpload";
import { isValidSlug, slugify } from "@/lib/admin/slug";
import {
  PROPERTY_STATUSES,
  STATUS_LABELS,
  type PropertyStatus,
} from "@/lib/admin/status";

type FloorPlan = {
  id: string;
  name: string;
  description: string;
  highlights: string[];
};

type HighlightCell = { value: string; label: string };
type VisionFloor = { label: string; body: string };

type ExistingImage = {
  id: string;
  category: string;
  floor_plan_id: string | null;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
};

type ImageSlot =
  // Existing DB row (may have alt/order mutations).
  | {
      kind: "existing";
      dbId: string;
      storage_path: string;
      alt_text: string;
      sort_order: number;
      category: ImageCategory;
      floor_plan_id: string | null;
    }
  // Pending upload (File in memory, no DB row yet).
  | {
      kind: "pending";
      localId: string;
      file: File;
      previewUrl: string;
      alt_text: string;
      sort_order: number;
      category: ImageCategory;
      floor_plan_id: string | null;
    };

const FIXED_GROUPS: {
  category: Exclude<ImageCategory, "floor_plan">;
  label: string;
  required: number;
  allowExtra: boolean;
  hint: string;
}[] = [
  {
    category: "hero",
    label: "Hero",
    required: 1,
    allowExtra: false,
    hint: "The large background image at the top of the page.",
  },
  {
    category: "card",
    label: "Card thumbnail",
    required: 1,
    allowExtra: false,
    hint: "The image shown on listing cards across the site. Leave empty to automatically use the Hero image — only upload here if you want a different thumbnail on listing cards.",
  },
  {
    category: "vision",
    label: "Vision image",
    required: 1,
    allowExtra: false,
    hint: "The featured image beside the Vision text.",
  },
  {
    category: "exterior",
    label: "Exterior renderings",
    required: 3,
    allowExtra: true,
    hint: "The main exterior gallery.",
  },
  {
    category: "interior",
    label: "Interior renderings",
    required: 6,
    allowExtra: true,
    hint: "The interior gallery.",
  },
  {
    category: "photo",
    label: "Real Photos (after construction)",
    required: 6,
    allowExtra: true,
    hint: "Actual photographs of the finished home. Shown in a separate 'A Closer Look' gallery, below the renderings.",
  },
];

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  hero: "Hero",
  card: "Card",
  exterior: "Exterior",
  interior: "Interior",
  vision: "Vision",
  floor_plan: "Floor plan",
  photo: "Photo",
};

function newLocalId() {
  return crypto.randomUUID();
}

function formatToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


function ImageSlotBox({
  slot,
  onFile,
  onRemove,
  onAltChange,
  onMove,
  uploading,
  title,
  altPrefill,
}: {
  slot: ImageSlot | null;
  onFile: (file: File) => void;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
  onMove?: ((dir: -1 | 1) => void) | undefined;
  uploading: boolean;
  title: string;
  altPrefill: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const src =
    slot?.kind === "existing"
      ? getPublicUrl(slot.storage_path)
      : slot?.kind === "pending"
      ? slot.previewUrl
      : null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-card space-y-2">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={
          "aspect-[4/3] rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition " +
          (dragOver ? "border-primary bg-muted" : "border-border bg-muted hover:bg-muted")
        }
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : src ? (
          <img src={src} alt={slot?.alt_text ?? ""} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">Click or drop image</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      {slot && (
        <>
          <Input
            value={slot.alt_text}
            placeholder={altPrefill}
            onChange={(e) => onAltChange(e.target.value)}
            className="text-xs"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {onMove && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onMove(-1)}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onMove(1)}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploading}
                className="text-destructive hover:text-destructive"
                onClick={onRemove}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Remove
              </Button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

function FormInner() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: existing, isLoading, error, refetch } = useProperty(id);

  // Form state
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<PropertyStatus>("coming_soon");
  const [price, setPrice] = useState("");
  const [listedDate, setListedDate] = useState(() => (isEdit ? "" : formatToday()));
  const [published, setPublished] = useState(false);
  const [hasPage, setHasPage] = useState(true);
  const [mlsUrl, setMlsUrl] = useState("");

  const [headline, setHeadline] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [locationHighlight, setLocationHighlight] = useState("");
  const [locationHeading, setLocationHeading] = useState("");
  const [mapEmbedQuery, setMapEmbedQuery] = useState("");
  const [visionHeadline, setVisionHeadline] = useState("");
  const [visionCaptionEyebrow, setVisionCaptionEyebrow] = useState("");
  const [visionCaptionTitle, setVisionCaptionTitle] = useState("");
  const [visionFloors, setVisionFloors] = useState<VisionFloor[]>([]);
  const [highlights, setHighlights] = useState<HighlightCell[]>([]);

  const [bedrooms, setBedrooms] = useState<string>("");
  const [fullBaths, setFullBaths] = useState<string>("");
  const [halfBaths, setHalfBaths] = useState<string>("");
  const [totalRooms, setTotalRooms] = useState<string>("");
  const [sqft, setSqft] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Ocean City");
  const [state, setState] = useState("NJ");

  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [luxuryFeatures, setLuxuryFeatures] = useState<string[]>([]);
  const [locationFeatures, setLocationFeatures] = useState<string[]>([]);

  const [slotsByCategory, setSlotsByCategory] = useState<Record<string, ImageSlot[]>>({
    hero: [],
    card: [],
    vision: [],
    exterior: [],
    interior: [],
    floor_plan: [],
    photo: [],
  });

  // Deleted rows to remove from storage/db on save.
  const [deletedStoragePaths, setDeletedStoragePaths] = useState<string[]>([]);
  const [deletedDbIds, setDeletedDbIds] = useState<string[]>([]);

  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  const [saving, setSaving] = useState(false);

  useBlocker({
    shouldBlockFn: () => dirty && !saving && !window.confirm("You have unsaved changes. Leave without saving?"),
    enableBeforeUnload: dirty && !saving,
  });

  // Slug uniqueness
  const slugState = useSlugAvailability(slug, id);

  // Guard: only initialize from server data ONCE per mount. Any later refetch
  // (e.g. React Query focus/reconnect) must not overwrite user edits.
  const initializedRef = useRef(false);

  // Load existing property
  useEffect(() => {
    if (!existing) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    const p = existing.property;
    setTitle(p.title ?? "");
    setUnit(p.unit ?? "");
    setSlug(p.slug ?? "");
    setSlugTouched(true);
    setStatus((p.status as PropertyStatus) ?? "coming_soon");
    setPrice(p.price ?? "");
    setListedDate(p.listed_date ?? "");
    setPublished(!!p.published);
    setHasPage(p.has_page ?? true);
    setMlsUrl((p as any).mls_url ?? "");
    setHeadline(p.headline ?? "");
    setTagline(p.tagline ?? "");
    setDescription(p.description ?? "");
    setLocationHighlight(p.location_highlight ?? "");
    setLocationHeading((p as any).location_heading ?? "");
    setMapEmbedQuery((p as any).map_embed_query ?? "");
    setVisionHeadline((p as any).vision_headline ?? "");
    setVisionCaptionEyebrow((p as any).vision_caption_eyebrow ?? "");
    setVisionCaptionTitle((p as any).vision_caption_title ?? "");
    const vf = Array.isArray((p as any).vision_floors) ? ((p as any).vision_floors as any[]) : [];
    setVisionFloors(
      vf.map((f) => ({ label: f.label ?? "", body: f.body ?? "" })),
    );
    const hl = Array.isArray((p as any).highlights) ? ((p as any).highlights as any[]) : [];
    setHighlights(
      hl.map((h) => ({ value: h.value ?? "", label: h.label ?? "" })),
    );
    setBedrooms(p.bedrooms?.toString() ?? "");
    setFullBaths(p.full_baths?.toString() ?? "");
    setHalfBaths(p.half_baths?.toString() ?? "");
    setTotalRooms(p.total_rooms?.toString() ?? "");
    setSqft(p.sqft?.toString() ?? "");
    setNeighborhood(p.location_neighborhood ?? "");
    setCity(p.location_city ?? "Ocean City");
    setState(p.location_state ?? "NJ");

    const fps = Array.isArray(p.floor_plans) ? (p.floor_plans as any[]) : [];
    setFloorPlans(
      fps.map((f) => ({
        id: f.id ?? newLocalId(),
        name: f.name ?? "",
        description: f.description ?? "",
        highlights: Array.isArray(f.highlights) ? f.highlights : [],
      })),
    );
    const sp = Array.isArray(p.specs) ? (p.specs as any[]) : [];
    setSpecs(
      sp.map((s) => ({
        icon: s.icon ?? "kitchen",
        title: s.title ?? "",
        description: s.description ?? "",
      })),
    );
    setLuxuryFeatures(Array.isArray(p.luxury_features) ? (p.luxury_features as string[]) : []);
    setLocationFeatures(Array.isArray(p.location_features) ? (p.location_features as string[]) : []);

    // Group images by category
    const grouped: Record<string, ImageSlot[]> = {
      hero: [],
      card: [],
      vision: [],
      exterior: [],
      interior: [],
      floor_plan: [],
      photo: [],
    };
    const rows: ExistingImage[] = existing.images as any;
    for (const img of rows) {
      const slot: ImageSlot = {
        kind: "existing",
        dbId: img.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text ?? "",
        sort_order: img.sort_order,
        category: img.category as ImageCategory,
        floor_plan_id: img.floor_plan_id,
      };
      grouped[img.category]?.push(slot);
    }
    for (const k of Object.keys(grouped)) {
      grouped[k]!.sort((a, b) => a.sort_order - b.sort_order);
    }
    // Single-image invariant: hero/card/vision must have at most one row per
    // property. If duplicates exist (from a previously partial save), keep
    // the one with the highest sort_order (the freshest replacement) and
    // mark the rest for deletion. deleteStorageObjects is idempotent, so
    // stale rows pointing at already-missing objects are cleaned safely.
    const staleDbIds: string[] = [];
    const stalePaths: string[] = [];
    for (const single of ["hero", "card", "vision"] as const) {
      const arr = grouped[single] ?? [];
      if (arr.length > 1) {
        const keep = arr[arr.length - 1]!;
        for (const s of arr) {
          if (s === keep) continue;
          if (s.kind === "existing") {
            staleDbIds.push(s.dbId);
            stalePaths.push(s.storage_path);
          }
        }
        grouped[single] = [keep];
      }
    }
    setSlotsByCategory(grouped);
    if (staleDbIds.length) {
      setDeletedDbIds((p) => [...p, ...staleDbIds]);
      setDeletedStoragePaths((p) => [...p, ...stalePaths]);
      setDirty(true);
      toast.info(
        `Detected ${staleDbIds.length} duplicate image row(s) in single-image slot(s). They will be cleaned up on save.`,
      );
    } else {
      setDirty(false);
    }
  }, [existing]);

  // Auto-slug from title while user hasn't touched slug.
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  // Warn on navigation
  useBeforeUnload(
    useMemo(
      () => (e: BeforeUnloadEvent) => {
        if (dirty && !saving) {
          e.preventDefault();
          e.returnValue = "";
        }
      },
      [dirty, saving],
    ),
  );

  // Slot helpers
  const setCategorySlots = (cat: string, slots: ImageSlot[]) => {
    setSlotsByCategory((prev) => ({ ...prev, [cat]: slots }));
    markDirty();
  };

  const removeSlotAt = (cat: string, index: number) => {
    const cur = slotsByCategory[cat] ?? [];
    const removed = cur[index];
    if (!removed) return;
    if (removed.kind === "existing") {
      setDeletedStoragePaths((p) => [...p, removed.storage_path]);
      setDeletedDbIds((p) => [...p, removed.dbId]);
    } else {
      URL.revokeObjectURL(removed.previewUrl);
    }
    setCategorySlots(
      cat,
      cur.filter((_, i) => i !== index),
    );
  };

  const addPendingFile = (
    cat: ImageCategory,
    file: File,
    floor_plan_id: string | null = null,
  ) => {
    const cur = slotsByCategory[cat] ?? [];
    const slot: ImageSlot = {
      kind: "pending",
      localId: newLocalId(),
      file,
      previewUrl: URL.createObjectURL(file),
      alt_text: "",
      sort_order: cur.length,
      category: cat,
      floor_plan_id,
    };
    setCategorySlots(cat, [...cur, slot]);
  };

  const replaceSlot = (cat: string, index: number, file: File) => {
    const cur = slotsByCategory[cat] ?? [];
    const old = cur[index];
    if (!old) return;
    if (old.kind === "existing") {
      setDeletedStoragePaths((p) => [...p, old.storage_path]);
      setDeletedDbIds((p) => [...p, old.dbId]);
    } else {
      URL.revokeObjectURL(old.previewUrl);
    }
    const slot: ImageSlot = {
      kind: "pending",
      localId: newLocalId(),
      file,
      previewUrl: URL.createObjectURL(file),
      alt_text: old.alt_text,
      sort_order: old.sort_order,
      category: old.category,
      floor_plan_id: old.floor_plan_id,
    };
    const next = [...cur];
    next[index] = slot;
    setCategorySlots(cat, next);
  };

  const updateSlotAlt = (cat: string, index: number, alt: string) => {
    const cur = slotsByCategory[cat] ?? [];
    const s = cur[index];
    if (!s) return;
    const next = [...cur];
    next[index] = { ...s, alt_text: alt } as ImageSlot;
    setCategorySlots(cat, next);
  };

  const moveSlot = (cat: string, index: number, dir: -1 | 1) => {
    const cur = slotsByCategory[cat] ?? [];
    const j = index + dir;
    if (j < 0 || j >= cur.length) return;
    const next = [...cur];
    [next[index], next[j]] = [next[j]!, next[index]!];
    setCategorySlots(cat, next);
  };

  // Floor plan row helpers
  const addFloorPlan = () => {
    setFloorPlans((f) => [
      ...f,
      { id: newLocalId(), name: "", description: "", highlights: [] },
    ]);
    markDirty();
  };
  const updateFloorPlan = (id: string, patch: Partial<FloorPlan>) => {
    setFloorPlans((f) => f.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    markDirty();
  };
  const removeFloorPlan = (id: string) => {
    // Also remove any linked floor_plan image slots.
    const linked = (slotsByCategory["floor_plan"] ?? []).filter((s) => s.floor_plan_id === id);
    for (const s of linked) {
      if (s.kind === "existing") {
        setDeletedStoragePaths((p) => [...p, s.storage_path]);
        setDeletedDbIds((p) => [...p, s.dbId]);
      } else {
        URL.revokeObjectURL(s.previewUrl);
      }
    }
    setSlotsByCategory((prev) => ({
      ...prev,
      floor_plan: (prev["floor_plan"] ?? []).filter((s) => s.floor_plan_id !== id),
    }));
    setFloorPlans((f) => f.filter((row) => row.id !== id));
    markDirty();
  };
  const moveFloorPlan = (id: string, dir: -1 | 1) => {
    setFloorPlans((f) => {
      const idx = f.findIndex((r) => r.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= f.length) return f;
      const next = [...f];
      [next[idx], next[j]] = [next[j]!, next[idx]!];
      return next;
    });
    markDirty();
  };

  const floorPlanImageFor = (fpId: string): ImageSlot | undefined =>
    (slotsByCategory["floor_plan"] ?? []).find((s) => s.floor_plan_id === fpId);

  const setFloorPlanImage = (fpId: string, file: File) => {
    const existing = floorPlanImageFor(fpId);
    if (existing) {
      // Replace
      const cur = slotsByCategory["floor_plan"] ?? [];
      const idx = cur.indexOf(existing);
      replaceSlot("floor_plan", idx, file);
    } else {
      addPendingFile("floor_plan", file, fpId);
    }
  };

  const removeFloorPlanImage = (fpId: string) => {
    const existing = floorPlanImageFor(fpId);
    if (!existing) return;
    const cur = slotsByCategory["floor_plan"] ?? [];
    const idx = cur.indexOf(existing);
    removeSlotAt("floor_plan", idx);
  };

  // Save
  const canSave =
    title.trim().length > 0 &&
    isValidSlug(slug) &&
    (slugState.status === "available" ||
      (isEdit && existing?.property.slug === slug));

  const handleSave = async () => {
    if (saving) return;
    if (!canSave) {
      toast.error("Fix validation errors first");
      return;
    }
    setSaving(true);
    try {
      // 1. Filter deleted storage paths against any lingering reference.
      //    Multiple property_images rows may share a storage_path (e.g. the
      //    hero row that points at the same object as exterior[0], or a
      //    vision row that reuses an exterior render). Deleting a shared
      //    object because one referencing row was removed would break the
      //    others. A path is safe to delete only when NO other row
      //    references it — in this form's kept slots or in property_images
      //    (any property) after the pending row deletions are applied.
      let pathsToDelete: string[] = [];
      if (deletedStoragePaths.length) {
        const unique = Array.from(new Set(deletedStoragePaths));
        const keptInForm = new Set<string>();
        for (const cat of Object.keys(slotsByCategory)) {
          for (const s of slotsByCategory[cat] ?? []) {
            if (s.kind === "existing") keptInForm.add(s.storage_path);
          }
        }
        const candidates = unique.filter((p) => !keptInForm.has(p));
        const stillRef = new Set<string>();
        if (candidates.length) {
          const { data: refs, error: refErr } = await supabase
            .from("property_images")
            .select("id,storage_path")
            .in("storage_path", candidates);
          if (refErr) throw refErr;
          const doomedIds = new Set(deletedDbIds);
          for (const r of refs ?? []) {
            if (!doomedIds.has(r.id)) stillRef.add(r.storage_path);
          }
        }
        pathsToDelete = candidates.filter((p) => !stillRef.has(p));
      }
      // 2. Upsert property row
      const payload = {
        title: title.trim(),
        unit: unit || null,
        slug: slug.trim(),
        status,
        price: price || null,
        listed_date: listedDate || null,
        published,
        has_page: hasPage,
        mls_url: mlsUrl.trim() || null,
        headline: headline || null,
        tagline: tagline || null,
        description: description || null,
        location_highlight: locationHighlight || null,
        location_heading: locationHeading || null,
        map_embed_query: mapEmbedQuery || null,
        vision_headline: visionHeadline || null,
        vision_caption_eyebrow: visionCaptionEyebrow || null,
        vision_caption_title: visionCaptionTitle || null,
        vision_floors: visionFloors.filter((f) => f.label.trim() || f.body.trim()) as any,
        highlights: highlights.filter((h) => h.value.trim() || h.label.trim()) as any,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        full_baths: fullBaths ? parseInt(fullBaths, 10) : null,
        half_baths: halfBaths ? parseInt(halfBaths, 10) : null,
        total_rooms: totalRooms ? parseInt(totalRooms, 10) : null,
        sqft: sqft ? parseInt(sqft, 10) : null,
        location_neighborhood: neighborhood || null,
        location_city: city || null,
        location_state: state || null,
        floor_plans: floorPlans as any,
        specs: specs as any,
        luxury_features: luxuryFeatures as any,
        location_features: locationFeatures as any,
      };

      let propertyId = id;
      if (isEdit && id) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("properties")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        propertyId = data.id;
      }
      if (!propertyId) throw new Error("No property id after save");

      // 3. Delete DB rows FIRST, then storage objects. If DB delete fails we
      //    abort with no storage changes; if storage delete fails after DB
      //    delete succeeded, the objects become orphans that the sweep step
      //    cleans up — never leaves a row pointing at a missing object.
      if (deletedDbIds.length) {
        const { error } = await supabase
          .from("property_images")
          .delete()
          .in("id", deletedDbIds);
        if (error) throw error;
      }
      if (pathsToDelete.length) {
        await deleteStorageObjects(pathsToDelete);
      }

      // 4. Upload pending files, then insert rows. Update existing rows for alt/sort/floor_plan changes.
      const allSlots: ImageSlot[] = Object.values(slotsByCategory).flat();
      const uploadedRows: {
        property_id: string;
        category: string;
        storage_path: string;
        alt_text: string | null;
        sort_order: number;
        floor_plan_id: string | null;
      }[] = [];

      // Assign sort order per-category based on array position.
      const positionByCategory: Record<string, number> = {};
      for (const cat of Object.keys(slotsByCategory)) {
        slotsByCategory[cat]?.forEach((slot, index) => {
          positionByCategory[`${cat}:${index}`] = index;
        });
      }

      for (const cat of Object.keys(slotsByCategory)) {
        const cur = slotsByCategory[cat] ?? [];
        for (let i = 0; i < cur.length; i++) {
          const slot = cur[i]!;
          if (slot.kind === "pending") {
            const { storage_path } = await uploadImage({
              file: slot.file,
              category: slot.category,
              slug: slug.trim(),
            });
            uploadedRows.push({
              property_id: propertyId,
              category: slot.category,
              storage_path,
              alt_text:
                slot.alt_text ||
                `${title.trim()} - ${CATEGORY_LABELS[slot.category]}`,
              sort_order: i,
              floor_plan_id: slot.floor_plan_id,
            });
          } else if (slot.kind === "existing") {
            // Update if changed
            const { error } = await supabase
              .from("property_images")
              .update({
                alt_text:
                  slot.alt_text ||
                  `${title.trim()} - ${CATEGORY_LABELS[slot.category]}`,
                sort_order: i,
                floor_plan_id: slot.floor_plan_id,
              })
              .eq("id", slot.dbId);
            if (error) throw error;
          }
        }
      }

      if (uploadedRows.length) {
        const { error } = await supabase.from("property_images").insert(uploadedRows);
        if (error) throw error;
      }

      // 5. Sweep <slug>/ for orphans. Referenced = every storage_path now
      //    present in property_images for this property (retained existing +
      //    newly inserted). property_images is the source of truth; anything
      //    outside this set is safe to remove. sweepPropertyFolder throws if
      //    listing fails, so a failed list never wipes referenced objects.
      const referenced = new Set<string>();
      for (const cat of Object.keys(slotsByCategory)) {
        for (const slot of slotsByCategory[cat] ?? []) {
          if (slot.kind === "existing") referenced.add(slot.storage_path);
        }
      }
      for (const row of uploadedRows) referenced.add(row.storage_path);
      try {
        await sweepPropertyFolder(slug.trim(), referenced);
      } catch (sweepErr: any) {
        // Save succeeded; only the orphan cleanup failed. Surface a warning
        // instead of failing the save.
        toast.warning(
          `Saved, but orphan cleanup failed: ${sweepErr?.message ?? "unknown error"}`,
        );
      }

      toast.success("Saved");
      setDeletedStoragePaths([]);
      setDeletedDbIds([]);
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      qc.invalidateQueries({ queryKey: ["admin-property", propertyId] });
      if (!isEdit) {
        navigate(`/admin/properties/${propertyId}/edit`, { replace: true });
      }
    } catch (err: any) {
      toast.error(`Save failed: ${err?.message ?? "unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteMutation = useDeleteProperty();
  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate("/admin/properties", { replace: true });
  };

  // Preview: serialize current form state into sessionStorage and open the
  // public PropertyPage in preview mode in a new tab. Nothing is written to
  // the DB or storage — pending files render from their local blob: URLs and
  // existing objects render from their public storage URLs.
  const handlePreview = () => {
    const slotToRow = (slot: ImageSlot, idx: number) => ({
      id: slot.kind === "existing" ? slot.dbId : slot.localId,
      property_id: id ?? "preview",
      category: slot.category,
      floor_plan_id: slot.floor_plan_id,
      // publicUrl() in PropertyPage passes through http(s):/blob:/data: URLs
      // untouched, so we resolve here and the preview renders faithfully.
      storage_path:
        slot.kind === "existing"
          ? getPublicUrl(slot.storage_path)
          : slot.previewUrl,
      alt_text:
        slot.alt_text ||
        `${title.trim() || "Property"} - ${CATEGORY_LABELS[slot.category]}`,
      sort_order: idx,
    });

    const images: ReturnType<typeof slotToRow>[] = [];
    for (const cat of Object.keys(slotsByCategory)) {
      const cur = slotsByCategory[cat] ?? [];
      cur.forEach((slot, i) => images.push(slotToRow(slot, i)));
    }

    const property = {
      id: id ?? "preview",
      slug: slug.trim() || "preview",
      title: title.trim() || "Untitled property",
      unit: unit || null,
      headline: headline || null,
      tagline: tagline || null,
      description: description || null,
      price: price || null,
      status,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
      full_baths: fullBaths ? parseInt(fullBaths, 10) : null,
      half_baths: halfBaths ? parseInt(halfBaths, 10) : null,
      total_rooms: totalRooms ? parseInt(totalRooms, 10) : null,
      sqft: sqft ? parseInt(sqft, 10) : null,
      location_neighborhood: neighborhood || null,
      location_city: city || null,
      location_state: state || null,
      location_highlight: locationHighlight || null,
      location_heading: locationHeading || null,
      highlights: highlights.filter((h) => h.value.trim() || h.label.trim()),
      vision_headline: visionHeadline || null,
      vision_floors: visionFloors.filter((f) => f.label.trim() || f.body.trim()),
      vision_caption_eyebrow: visionCaptionEyebrow || null,
      vision_caption_title: visionCaptionTitle || null,
      map_embed_query: mapEmbedQuery || null,
      specs,
      floor_plans: floorPlans,
      luxury_features: luxuryFeatures,
      location_features: locationFeatures,
      published,
      has_page: hasPage,
      mls_url: mlsUrl.trim() || null,
    };

    try {
      // Use localStorage rather than sessionStorage: window.open with
      // "noopener" (which we want, to avoid leaking the admin tab) does NOT
      // clone sessionStorage into the new tab, so the preview would render
      // "No preview data". localStorage is shared across tabs on the same
      // origin and works from both the new-property and edit forms.
      localStorage.setItem(
        "admin-preview-property",
        JSON.stringify({ property, images }),
      );
      window.open("/admin/preview", "_blank", "noopener");
    } catch (err: any) {
      toast.error(`Preview failed: ${err?.message ?? "unknown error"}`);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6" aria-label="Loading property">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isEdit && error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
        <p>The property could not be loaded.</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const slugError =
    slug && !isValidSlug(slug)
      ? "Slug must be lowercase alphanumerics separated by hyphens."
      : slugState.status === "taken"
      ? "This slug is already in use."
      : null;

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              if (
                dirty &&
                !saving &&
                !window.confirm("You have unsaved changes. Leave without saving?")
              ) {
                return;
              }
              navigate("/admin/properties");
            }}
            className="h-auto p-0 text-sm text-muted-foreground"
          >
            ← Back to properties
          </Button>
          <h1 className="text-2xl font-semibold text-foreground mt-2">
            {isEdit ? "Edit property" : "New property"}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this property?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the property and all its images. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={handlePreview} disabled={saving}>
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Save changes" : "Create property"}
          </Button>
        </div>
      </div>

      {dirty && !saving && (
        <p className="rounded-md border border-warning-border bg-warning-surface px-3 py-2 text-xs text-warning-strong">
          You have unsaved changes. Use “{isEdit ? "Save changes" : "Create property"}” before
          leaving this page.
        </p>
      )}

      {/* Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input value={unit} onChange={(e) => { setUnit(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
                markDirty();
              }}
            />
            {slugError && <p className="text-xs text-destructive">{slugError}</p>}
            {slugState.status === "available" && slug && (
              <p className="text-xs text-success-strong">Slug is available.</p>
            )}
            {slugState.status === "checking" && (
              <p className="text-xs text-muted-foreground">Checking…</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => { setStatus(v as PropertyStatus); markDirty(); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              value={price}
              placeholder="$2,995,000 or From $1,995,000"
              onChange={(e) => { setPrice(e.target.value); markDirty(); }}
            />
          </div>
          <div className="space-y-2">
            <Label>Listed date</Label>
            <Input
              type="date"
              value={listedDate}
              onChange={(e) => { setListedDate(e.target.value); markDirty(); }}
            />
            <p className="text-xs text-muted-foreground">
              Determines ordering — newest first on the public site.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Published</Label>
            <div className="flex items-center h-10">
              <Switch checked={published} onCheckedChange={(v) => { setPublished(v); markDirty(); }} />
              <span className="ml-3 text-sm text-muted-foreground">
                {published ? "Visible on the public site" : "Draft"}
              </span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Full listing page</Label>
            <div className="flex items-center h-10">
              <Switch
                checked={hasPage}
                onCheckedChange={(v) => {
                  setHasPage(v);
                  markDirty();
                }}
              />
              <span className="ml-3 text-sm text-muted-foreground">
                {hasPage
                  ? "Renders a full clickable property page."
                  : "Record only — appears as a non-clickable card in Past Developments. Hidden from the sitemap and prev/next loop."}
              </span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>MLS URL</Label>
            <Input
              value={mlsUrl}
              placeholder="https://sjsr.paragonrels.com/…"
              onChange={(e) => { setMlsUrl(e.target.value); markDirty(); }}
            />
            <p className="text-xs text-muted-foreground">
              Optional. When set, renders an "Official Property Record: South Jersey MLS" link under the specs section.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Copy */}
      <Card>
        <CardHeader>
          <CardTitle>Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input value={headline} onChange={(e) => { setHeadline(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => { setTagline(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={6} value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Location highlight</Label>
            <Input value={locationHighlight} onChange={(e) => { setLocationHighlight(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Location heading</Label>
            <Input
              placeholder="e.g. Life in Baylandings"
              value={locationHeading}
              onChange={(e) => { setLocationHeading(e.target.value); markDirty(); }}
            />
            <p className="text-xs text-muted-foreground">
              Bespoke "Life in …" heading for the Location section. Falls back to Location highlight.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Map embed query</Label>
            <Input
              placeholder="e.g. 3213 Bayland Dr, Ocean City, NJ"
              value={mapEmbedQuery}
              onChange={(e) => { setMapEmbedQuery(e.target.value); markDirty(); }}
            />
            <p className="text-xs text-muted-foreground">
              Address for the Google Maps embed. Leave empty to hide the map.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vision section */}
      <Card>
        <CardHeader>
          <CardTitle>Vision section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Vision headline</Label>
            <Input
              placeholder="e.g. A Bayside Coastal Residence"
              value={visionHeadline}
              onChange={(e) => { setVisionHeadline(e.target.value); markDirty(); }}
            />
            <p className="text-xs text-muted-foreground">
              Bespoke Vision heading. Falls back to Headline, then Title.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Caption eyebrow</Label>
              <Input
                placeholder="e.g. Baylandings"
                value={visionCaptionEyebrow}
                onChange={(e) => { setVisionCaptionEyebrow(e.target.value); markDirty(); }}
              />
            </div>
            <div className="space-y-2">
              <Label>Caption title</Label>
              <Input
                placeholder="e.g. Bayside Residence"
                value={visionCaptionTitle}
                onChange={(e) => { setVisionCaptionTitle(e.target.value); markDirty(); }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Floor-by-floor prose</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setVisionFloors((v) => [...v, { label: "", body: "" }]);
                  markDirty();
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add floor
              </Button>
            </div>
            {visionFloors.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Empty falls back to the plain Description paragraph.
              </p>
            )}
            <div className="space-y-3">
              {visionFloors.map((f, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ground Floor"
                      value={f.label}
                      onChange={(e) => {
                        const next = [...visionFloors];
                        next[i] = { ...next[i]!, label: e.target.value };
                        setVisionFloors(next);
                        markDirty();
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setVisionFloors((v) => v.filter((_, j) => j !== i));
                        markDirty();
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Entry foyer, attached two-car garage…"
                    value={f.body}
                    onChange={(e) => {
                      const next = [...visionFloors];
                      next[i] = { ...next[i]!, body: e.target.value };
                      setVisionFloors(next);
                      markDirty();
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highlights bar */}
      <Card>
        <CardHeader>
          <CardTitle>Highlights bar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cells shown in the strip below the hero. Empty falls back to
            Bedrooms / Bathrooms / Total Rooms / Sqft.
          </p>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Value"
                  value={h.value}
                  onChange={(e) => {
                    const next = [...highlights];
                    next[i] = { ...next[i]!, value: e.target.value };
                    setHighlights(next);
                    markDirty();
                  }}
                />
                <Input
                  placeholder="Label"
                  value={h.label}
                  onChange={(e) => {
                    const next = [...highlights];
                    next[i] = { ...next[i]!, label: e.target.value };
                    setHighlights(next);
                    markDirty();
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setHighlights((v) => v.filter((_, j) => j !== i));
                    markDirty();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setHighlights((v) => [...v, { value: "", label: "" }]);
                markDirty();
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add cell
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const derived: HighlightCell[] = [];
                if (bedrooms) derived.push({ value: bedrooms, label: "Bedrooms" });
                if (fullBaths) {
                  const half = halfBaths ? parseInt(halfBaths, 10) : 0;
                  const full = parseInt(fullBaths, 10);
                  const v = full + half * 0.5;
                  derived.push({
                    value: Number.isInteger(v) ? String(v) : v.toString(),
                    label: "Bathrooms",
                  });
                }
                if (totalRooms) derived.push({ value: totalRooms, label: "Total Rooms" });
                setHighlights(derived);
                markDirty();
              }}
            >
              Prefill from numeric fields
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input type="number" value={bedrooms} onChange={(e) => { setBedrooms(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Full baths</Label>
            <Input type="number" value={fullBaths} onChange={(e) => { setFullBaths(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Half baths</Label>
            <Input type="number" value={halfBaths} onChange={(e) => { setHalfBaths(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Total rooms</Label>
            <Input type="number" value={totalRooms} onChange={(e) => { setTotalRooms(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Sqft</Label>
            <Input type="number" value={sqft} onChange={(e) => { setSqft(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>Neighborhood</Label>
            <Input value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={(e) => { setCity(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={state} onChange={(e) => { setState(e.target.value); markDirty(); }} />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {FIXED_GROUPS.map((group) => {
            const cur = slotsByCategory[group.category] ?? [];
            const showAdd = group.allowExtra || cur.length < group.required;
            const slotCount = Math.max(cur.length, group.required);
            const items: (ImageSlot | null)[] = [];
            for (let i = 0; i < slotCount; i++) items.push(cur[i] ?? null);
            return (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-foreground">
                  {group.label} · {cur.length}/{group.required}
                  {group.allowExtra ? "+" : ""}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{group.hint}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((slot, i) => (
                    <ImageSlotBox
                      key={i}
                      slot={slot}
                      title={`${group.label} ${i + 1}`}
                      altPrefill={`${title || "Property"} - ${group.label}`}
                      uploading={false}
                      onFile={(file) => {
                        if (slot) replaceSlot(group.category, i, file);
                        else addPendingFile(group.category, file);
                      }}
                      onRemove={() => removeSlotAt(group.category, i)}
                      onAltChange={(alt) => updateSlotAlt(group.category, i, alt)}
                      onMove={
                        group.allowExtra || group.required > 1
                          ? (dir) => moveSlot(group.category, i, dir)
                          : undefined
                      }
                    />
                  ))}
                  {showAdd && group.allowExtra && (
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={`Add ${group.label.toLowerCase()} image`}
                      className="aspect-[4/3] h-auto border-2 border-dashed text-muted-foreground"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = () => {
                          const file = input.files?.[0];
                          if (file) addPendingFile(group.category, file);
                        };
                        input.click();
                      }}
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Floor Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Floor plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground -mt-2">
            Shown as tabs in the Floor Plans section, one per level.
          </p>
          {floorPlans.map((fp, idx) => {
            const img = floorPlanImageFor(fp.id);
            return (
              <div
                key={fp.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Level {idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFloorPlan(fp.id, -1)}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFloorPlan(fp.id, 1)}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeFloorPlan(fp.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove level
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={fp.name}
                        placeholder="Ground Level"
                        onChange={(e) => updateFloorPlan(fp.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={fp.description}
                        onChange={(e) =>
                          updateFloorPlan(fp.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Highlights</Label>
                      <StringListEditor
                        value={fp.highlights}
                        onChange={(v) => updateFloorPlan(fp.id, { highlights: v })}
                        placeholder="e.g. Chef's kitchen"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Floor plan image</Label>
                    <ImageSlotBox
                      slot={img ?? null}
                      title={fp.name || `Level ${idx + 1}`}
                      altPrefill={`${title || "Property"} - ${fp.name || "Floor plan"}`}
                      uploading={false}
                      onFile={(file) => setFloorPlanImage(fp.id, file)}
                      onRemove={() => removeFloorPlanImage(fp.id)}
                      onAltChange={(alt) => {
                        const cur = slotsByCategory["floor_plan"] ?? [];
                        const idx2 = cur.findIndex((s) => s.floor_plan_id === fp.id);
                        if (idx2 >= 0) updateSlotAlt("floor_plan", idx2, alt);
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <Button type="button" variant="outline" onClick={addFloorPlan}>
            <Plus className="w-4 h-4 mr-2" />
            Add floor plan
          </Button>
        </CardContent>
      </Card>

      {/* Specs */}
      <Card>
        <CardHeader>
          <CardTitle>Specs</CardTitle>
        </CardHeader>
        <CardContent>
          <SpecsEditor value={specs} onChange={(v) => { setSpecs(v); markDirty(); }} />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Luxury features</Label>
            <StringListEditor
              value={luxuryFeatures}
              onChange={(v) => { setLuxuryFeatures(v); markDirty(); }}
              placeholder="e.g. Chef's kitchen"
            />
          </div>
          <div className="space-y-2">
            <Label>Location features</Label>
            <StringListEditor
              value={locationFeatures}
              onChange={(v) => { setLocationFeatures(v); markDirty(); }}
              placeholder="e.g. Steps to the beach"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !canSave}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Save changes" : "Create property"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminPropertyForm() {
  return (
    <AdminProtected>
      <FormInner />
    </AdminProtected>
  );
}