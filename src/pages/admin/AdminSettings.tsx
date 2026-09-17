import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  FALLBACK_LOGO,
  FALLBACK_HERO,
  FALLBACK_FAVICON,
  FALLBACK_ABOUT_HERO,
  FALLBACK_ABOUT_STORY,
  FALLBACK_PORTRAIT,
  HERO_FALLBACKS,
  ABOUT_FALLBACKS,
  SITE_NAME_FALLBACK,
} from "@/hooks/useSiteSettings";
import {
  usePageContent,
  findMedia,
  useSaveText,
  useSaveMedia,
  useRemoveMedia,
  useContentInvalidate,
  writeText,
} from "@/hooks/admin/usePageContentAdmin";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteStoredObject,
  publicUrlFor,
  uploadPageMedia,
} from "@/lib/admin/uploadPageMedia";
import { NotAnImageError, type BrandAssetKind } from "@/lib/admin/uploadBrandAsset";
import type { ContentBundle, PageMediaRow } from "@/lib/content-resolver";
import { BUSINESS_FALLBACKS, MAINTENANCE_FALLBACK_MESSAGE } from "@/lib/content/business";
import { CONTACT_FALLBACKS } from "@/lib/content/contact";
import {
  ADVANTAGE_FALLBACKS,
  SNIPPET_FALLBACKS,
  advantageSlot,
  snippetSlot,
} from "@/lib/content/home";
import {
  DEVELOPMENTS_FALLBACKS,
  GALLERY_FALLBACKS,
  TESTIMONIALS_FALLBACKS,
} from "@/lib/content/pages";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const PAGES = [
  "global",
  "home",
  "about",
  "contact",
  "gallery",
  "testimonials",
  "developments",
];

type SlotDef = {
  page: string;
  slot: string;
  kind: BrandAssetKind;
  label: string;
  help: string;
  dark?: boolean;
  fallbackUrl?: string;
  fallbackNote?: string;
};

const BRAND_SLOTS: SlotDef[] = [
  {
    page: "global",
    slot: "logo",
    kind: "logo",
    label: "Logo",
    help: "Used in the header, footer and admin panel. PNG with transparency works best.",
    fallbackUrl: FALLBACK_LOGO,
    fallbackNote: "Currently using the built-in logo.",
  },
  {
    page: "global",
    slot: "logo_dark",
    kind: "logo_dark",
    label: "Dark-background logo",
    help: "Optional. Without it, the main logo is knocked out to white on dark surfaces.",
    dark: true,
  },
  {
    page: "global",
    slot: "favicon",
    kind: "favicon",
    label: "Favicon",
    help: "Square image shown in the browser tab.",
    fallbackUrl: FALLBACK_FAVICON,
    fallbackNote: "Currently using the built-in favicon.",
  },
];

const HOME_SLOTS: SlotDef[] = [
  {
    page: "home",
    slot: "hero_image",
    kind: "hero",
    label: "Homepage hero image",
    help: "Wide landscape photo behind the homepage headline.",
    dark: true,
    fallbackUrl: FALLBACK_HERO,
    fallbackNote: "Currently using the built-in homepage photo.",
  },
];

const ABOUT_SLOTS: SlotDef[] = [
  {
    page: "about",
    slot: "hero_image",
    kind: "about_hero",
    label: "About header photo",
    help: "Background photo behind the About page title.",
    dark: true,
    fallbackUrl: FALLBACK_ABOUT_HERO,
    fallbackNote: "Currently using the built-in header photo.",
  },
  {
    page: "about",
    slot: "story_image",
    kind: "about_story",
    label: "Our Story photo",
    help: "Tall photo beside the Our Story text.",
    fallbackUrl: FALLBACK_ABOUT_STORY,
    fallbackNote: "Currently using the built-in craftsmanship photo.",
  },
  {
    page: "about",
    slot: "portrait_image",
    kind: "about_portrait",
    label: "Leadership portrait",
    help: "Portrait shown in the Our Promise section.",
    fallbackUrl: FALLBACK_PORTRAIT,
    fallbackNote: "Currently using the built-in portrait.",
  },
];

function AssetSlot({
  label,
  help,
  url,
  hasUpload,
  dark,
  note,
  busy,
  progress,
  onPick,
  onRemove,
}: {
  label: string;
  help: string;
  url: string | null;
  hasUpload: boolean;
  dark?: boolean | undefined;
  note?: string | undefined;
  busy: boolean;
  progress: number;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{help}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {hasUpload ? "Replace" : "Upload"}
          </Button>
          {hasUpload && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <div
        className={`flex h-28 items-center justify-center overflow-hidden rounded-lg px-6 ${
          dark ? "bg-slate-900" : "bg-slate-100"
        }`}
      >
        {url ? (
          <img src={url} alt={label} className="max-h-24 w-auto object-contain" />
        ) : (
          <span className={`text-xs ${dark ? "text-white/50" : "text-slate-400"}`}>
            Nothing uploaded
          </span>
        )}
      </div>

      {!hasUpload && note && <p className="mt-3 text-xs text-slate-500">{note}</p>}
      {busy && <Progress value={progress} className="mt-3 h-1" />}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

function PartnerLogoField({
  url,
  busy,
  onPick,
  onClear,
}: {
  url: string | null;
  busy: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-slate-100 px-3">
        {url ? (
          <img src={url} alt="Partner logo" className="max-h-12 w-auto object-contain" />
        ) : (
          <span className="text-[11px] text-slate-400">No logo</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {url ? "Replace logo" : "Upload logo"}
        </Button>
        {url && (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClear}>
            Remove
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

type PartnerDraft = {
  id: string;
  name: string;
  url: string;
  description: string;
  logo: { bucket: string; storagePath: string } | null;
};

const PARTNER_NAME_SLOT = /^partner\.(\d+)\.name$/;

/** Reads the numbered partner slots out of the content bundle, in ordinal order. */
function partnersFromBundle(bundle: ContentBundle): PartnerDraft[] {
  const textFor = (slot: string) =>
    bundle.text.find((r) => r.page === "about" && r.slot === slot)?.value ?? "";

  return bundle.text
    .filter((r) => r.page === "about" && PARTNER_NAME_SLOT.test(r.slot))
    .map((r) => r.slot.match(PARTNER_NAME_SLOT)?.[1] ?? "")
    .filter((n) => n.length > 0)
    .sort((a, b) => Number(a) - Number(b))
    .map((n) => {
      const media = findMedia(bundle, "about", `partner.${n}.logo`);
      return {
        id: `partner-${n}`,
        name: textFor(`partner.${n}.name`),
        url: textFor(`partner.${n}.url`),
        description: textFor(`partner.${n}.description`),
        logo: media ? { bucket: media.bucket, storagePath: media.storage_path } : null,
      };
    });
}

const ordinal = (index: number) => String(index + 1).padStart(2, "0");

function SettingsBody() {
  const { bundle, isLoading } = usePageContent(PAGES);
  const saveText = useSaveText();
  const saveMedia = useSaveMedia();
  const removeMedia = useRemoveMedia();
  const invalidate = useContentInvalidate();
  const { toast } = useToast();

  const [siteName, setSiteName] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [headline, setHeadline] = useState("");
  const [subline, setSubline] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [quote, setQuote] = useState("");
  const [quoteAttribution, setQuoteAttribution] = useState("");

  const [about, setAbout] = useState({
    heroEyebrow: "",
    heroTitle: "",
    storyLabel: "",
    storyHeading: "",
    storyParagraph1: "",
    storyParagraph2: "",
    storyQuote: "",
    storyQuoteAttribution: "",
    leaderName: "",
    leaderRole: "",
    promiseLabel: "",
    promiseHeading: "",
    promiseParagraph: "",
    partnersLabel: "",
    partnersHeading: "",
  });
  const [business, setBusiness] = useState({
    contactName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    blurb: "",
    facebookUrl: "",
    instagramUrl: "",
  });
  const [logoScale, setLogoScale] = useState(100);
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [contactCopy, setContactCopy] = useState({
    heroEyebrow: "",
    heroTitle: "",
    infoLabel: "",
    infoHeading: "",
    formTitle: "",
    formIntro: "",
    leadContact: "",
  });
  const [advantages, setAdvantages] = useState(
    ADVANTAGE_FALLBACKS.map(() => ({ title: "", description: "" })),
  );
  const [snippets, setSnippets] = useState(
    SNIPPET_FALLBACKS.map(() => ({ author: "", quote: "" })),
  );
  const [galleryCopy, setGalleryCopy] = useState({
    heroEyebrow: "",
    heroTitle: "",
    emptyMessage: "",
  });
  const [testimonialsCopy, setTestimonialsCopy] = useState({
    heroEyebrow: "",
    heroTitle: "",
    emptyMessage: "",
    ctaLabel: "",
    ctaHeading: "",
    ctaBody: "",
    ctaButton: "",
  });
  const [developmentsCopy, setDevelopmentsCopy] = useState({
    heroEyebrow: "",
    heroTitle: "",
  });
  const [partners, setPartners] = useState<PartnerDraft[]>([]);
  /** Storage objects to delete once the About page saves successfully. */
  const [orphanedLogos, setOrphanedLogos] = useState<{ bucket: string; storagePath: string }[]>([]);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [savingAbout, setSavingAbout] = useState(false);

  useEffect(() => {
    const text = (page: string, slot: string) =>
      bundle.text.find((r) => r.page === page && r.slot === slot)?.value ?? "";

    // A stored row wins (including a deliberately blank one); with no row at
    // all the site renders the built-in link, so the field must show that.
    const socialText = (slot: string, fallback: string) => {
      const row = bundle.text.find((r) => r.page === "global" && r.slot === slot);
      return row ? (row.value ?? "") : fallback;
    };


    setSiteName(text("global", "site_name"));
    setEyebrow(text("home", "hero_eyebrow"));
    setHeadline(text("home", "hero_headline"));
    setSubline(text("home", "hero_subline"));
    setCtaLabel(text("home", "hero_cta_label"));
    setQuote(text("home", "quote"));
    setQuoteAttribution(text("home", "quote_attribution"));

    setBusiness({
      contactName: text("global", "business.contact_name"),
      phone: text("global", "business.phone"),
      email: text("global", "business.email"),
      addressLine1: text("global", "business.address_line_1"),
      addressLine2: text("global", "business.address_line_2"),
      blurb: text("global", "business.blurb"),
      // Social links are "preserve blank on save": an empty field means
      // "hide this icon". So the form must start from the link the site is
      // actually showing (stored row, or the built-in default) — otherwise a
      // plain phone-number save would silently blank both icons.
      facebookUrl: socialText("business.facebook_url", BUSINESS_FALLBACKS.facebookUrl),
      instagramUrl: socialText("business.instagram_url", BUSINESS_FALLBACKS.instagramUrl),
    });
    const scaleRaw = Number.parseFloat(text("global", "logo.scale"));
    setLogoScale(Number.isFinite(scaleRaw) && scaleRaw > 0 ? scaleRaw : 100);
    setMaintenanceOn(text("global", "maintenance.enabled").trim() === "on");
    setMaintenanceMessage(text("global", "maintenance.message"));

    setContactCopy({
      heroEyebrow: text("contact", "hero_eyebrow"),
      heroTitle: text("contact", "hero_title"),
      infoLabel: text("contact", "info_label"),
      infoHeading: text("contact", "info_heading"),
      formTitle: text("contact", "form_title"),
      formIntro: text("contact", "form_intro"),
      leadContact: text("contact", "lead_contact"),
    });

    setAdvantages(
      ADVANTAGE_FALLBACKS.map((_, i) => ({
        title: text("home", advantageSlot(i, "title")),
        description: text("home", advantageSlot(i, "description")),
      })),
    );
    setSnippets(
      SNIPPET_FALLBACKS.map((_, i) => ({
        author: text("home", snippetSlot(i, "author")),
        quote: text("home", snippetSlot(i, "quote")),
      })),
    );

    setGalleryCopy({
      heroEyebrow: text("gallery", "hero_eyebrow"),
      heroTitle: text("gallery", "hero_title"),
      emptyMessage: text("gallery", "empty_message"),
    });
    setTestimonialsCopy({
      heroEyebrow: text("testimonials", "hero_eyebrow"),
      heroTitle: text("testimonials", "hero_title"),
      emptyMessage: text("testimonials", "empty_message"),
      ctaLabel: text("testimonials", "cta_label"),
      ctaHeading: text("testimonials", "cta_heading"),
      ctaBody: text("testimonials", "cta_body"),
      ctaButton: text("testimonials", "cta_button"),
    });
    setDevelopmentsCopy({
      heroEyebrow: text("developments", "hero_eyebrow"),
      heroTitle: text("developments", "hero_title"),
    });


    setAbout({
      heroEyebrow: text("about", "hero_eyebrow"),
      heroTitle: text("about", "hero_title"),
      storyLabel: text("about", "story_label"),
      storyHeading: text("about", "story_heading"),
      storyParagraph1: text("about", "story_paragraph_1"),
      storyParagraph2: text("about", "story_paragraph_2"),
      storyQuote: text("about", "story_quote"),
      storyQuoteAttribution: text("about", "story_quote_attribution"),
      leaderName: text("about", "leader_name"),
      leaderRole: text("about", "leader_role"),
      promiseLabel: text("about", "promise_label"),
      promiseHeading: text("about", "promise_heading"),
      promiseParagraph: text("about", "promise_paragraph"),
      partnersLabel: text("about", "partners_label"),
      partnersHeading: text("about", "partners_heading"),
    });
    setPartners(partnersFromBundle(bundle));
    savedSnapshot.current = null; // re-baselined by the effect below
  }, [bundle]);

  /**
   * Unsaved-changes guard: every editable field is folded into one snapshot and
   * compared against the last loaded/saved state, so leaving the page with
   * pending edits warns instead of silently dropping them.
   */
  const snapshot = JSON.stringify({
    siteName,
    eyebrow,
    headline,
    subline,
    ctaLabel,
    quote,
    quoteAttribution,
    about,
    business,
    logoScale,
    maintenanceOn,
    maintenanceMessage,
    contactCopy,
    advantages,
    snippets,
    galleryCopy,
    testimonialsCopy,
    developmentsCopy,
    partners,
  });
  const savedSnapshot = useRef<string | null>(null);
  useEffect(() => {
    if (savedSnapshot.current === null) savedSnapshot.current = snapshot;
  }, [snapshot]);
  const isDirty = savedSnapshot.current !== null && savedSnapshot.current !== snapshot;

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const mediaFor = (slot: SlotDef): PageMediaRow | null => findMedia(bundle, slot.page, slot.slot);

  const urlFor = (slot: SlotDef) => {
    const row = mediaFor(slot);
    if (row) return publicUrlFor(row.bucket, row.storage_path);
    return slot.fallbackUrl ?? null;
  };

  const slotKey = (slot: SlotDef) => `${slot.page}.${slot.slot}`;

  const handleUpload = async (slot: SlotDef, file: File) => {
    setBusyKey(slotKey(slot));
    setProgress(0);
    try {
      await saveMedia.mutateAsync({
        page: slot.page,
        slot: slot.slot,
        kind: slot.kind,
        file,
        previous: mediaFor(slot),
        altText: slot.label,
        onProgress: setProgress,
      });
      toast({ title: "Saved", description: "Image updated across the site." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          err instanceof NotAnImageError ? err.message : (err as Error).message || "Please try again.",
      });
    } finally {
      setBusyKey(null);
      setProgress(0);
    }
  };

  const handleRemove = async (slot: SlotDef) => {
    setBusyKey(slotKey(slot));
    try {
      await removeMedia.mutateAsync({
        page: slot.page,
        slot: slot.slot,
        previous: mediaFor(slot),
      });
      toast({ title: "Removed", description: "The default image is back in place." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not remove",
        description: (err as Error).message || "Please try again.",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const saveTextWithToast = async (
    page: string,
    entries: { slot: string; value: string }[],
    description: string,
    preserveBlank?: string[],
  ) => {
    try {
      await saveText.mutateAsync({
        page,
        entries,
        ...(preserveBlank ? { preserveBlank } : {}),
      });
      toast({ title: "Saved", description });

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: (err as Error).message || "Please try again.",
      });
    }
  };

  const handleSaveBusiness = () =>
    saveTextWithToast(
      "global",
      [
        { slot: "site_name", value: siteName.trim() || SITE_NAME_FALLBACK },
        { slot: "business.contact_name", value: business.contactName },
        { slot: "business.phone", value: business.phone },
        { slot: "business.email", value: business.email },
        { slot: "business.address_line_1", value: business.addressLine1 },
        { slot: "business.address_line_2", value: business.addressLine2 },
        { slot: "business.blurb", value: business.blurb },
        { slot: "business.facebook_url", value: business.facebookUrl },
        { slot: "business.instagram_url", value: business.instagramUrl },
      ],
      "Business details updated.",
      // Clearing a social link must hide the icon, not restore the built-in URL.
      ["business.facebook_url", "business.instagram_url"],
    );


  const handleSaveAppearance = () =>
    saveTextWithToast(
      "global",
      [{ slot: "logo.scale", value: String(logoScale) }],
      "Appearance updated.",
    );

  const handleSaveMaintenance = (nextOn: boolean, nextMessage: string) =>
    saveTextWithToast(
      "global",
      [
        { slot: "maintenance.enabled", value: nextOn ? "on" : "off" },
        { slot: "maintenance.message", value: nextMessage },
      ],
      nextOn ? "Maintenance mode is on." : "Maintenance mode is off.",
    );

  const handleSaveContact = () =>
    saveTextWithToast(
      "contact",
      [
        { slot: "hero_eyebrow", value: contactCopy.heroEyebrow },
        { slot: "hero_title", value: contactCopy.heroTitle },
        { slot: "info_label", value: contactCopy.infoLabel },
        { slot: "info_heading", value: contactCopy.infoHeading },
        { slot: "form_title", value: contactCopy.formTitle },
        { slot: "form_intro", value: contactCopy.formIntro },
        { slot: "lead_contact", value: contactCopy.leadContact },
      ],
      "Contact page content updated.",
    );

  const handleSaveHome = () =>
    saveTextWithToast(
      "home",
      [
        { slot: "hero_eyebrow", value: eyebrow },
        { slot: "hero_headline", value: headline },
        { slot: "hero_subline", value: subline },
        { slot: "hero_cta_label", value: ctaLabel },
        { slot: "quote", value: quote },
        { slot: "quote_attribution", value: quoteAttribution },
        ...advantages.flatMap((a, i) => [
          { slot: advantageSlot(i, "title"), value: a.title },
          { slot: advantageSlot(i, "description"), value: a.description },
        ]),
        ...snippets.flatMap((s, i) => [
          { slot: snippetSlot(i, "author"), value: s.author },
          { slot: snippetSlot(i, "quote"), value: s.quote },
        ]),
      ],
      "Homepage content updated.",
    );

  const handleSaveGallery = () =>
    saveTextWithToast(
      "gallery",
      [
        { slot: "hero_eyebrow", value: galleryCopy.heroEyebrow },
        { slot: "hero_title", value: galleryCopy.heroTitle },
        { slot: "empty_message", value: galleryCopy.emptyMessage },
      ],
      "Gallery page content updated.",
    );

  const handleSaveTestimonials = () =>
    saveTextWithToast(
      "testimonials",
      [
        { slot: "hero_eyebrow", value: testimonialsCopy.heroEyebrow },
        { slot: "hero_title", value: testimonialsCopy.heroTitle },
        { slot: "empty_message", value: testimonialsCopy.emptyMessage },
        { slot: "cta_label", value: testimonialsCopy.ctaLabel },
        { slot: "cta_heading", value: testimonialsCopy.ctaHeading },
        { slot: "cta_body", value: testimonialsCopy.ctaBody },
        { slot: "cta_button", value: testimonialsCopy.ctaButton },
      ],
      "Testimonials page content updated.",
    );

  const handleSaveDevelopments = () =>
    saveTextWithToast(
      "developments",
      [
        { slot: "hero_eyebrow", value: developmentsCopy.heroEyebrow },
        { slot: "hero_title", value: developmentsCopy.heroTitle },
      ],
      "Developments page content updated.",
    );

  /**
   * Rewrites the whole About page: plain text slots, then the numbered partner
   * slots renumbered from 01 with no gaps so collectPartners() keeps its order.
   */
  const saveAboutWithToast = async () => {
    setSavingAbout(true);
    const kept = partners.filter((p) => p.name.trim().length > 0);
    try {
      await writeText("about", [
        { slot: "hero_eyebrow", value: about.heroEyebrow },
        { slot: "hero_title", value: about.heroTitle },
        { slot: "story_label", value: about.storyLabel },
        { slot: "story_heading", value: about.storyHeading },
        { slot: "story_paragraph_1", value: about.storyParagraph1 },
        { slot: "story_paragraph_2", value: about.storyParagraph2 },
        { slot: "story_quote", value: about.storyQuote },
        { slot: "story_quote_attribution", value: about.storyQuoteAttribution },
        { slot: "leader_name", value: about.leaderName },
        { slot: "leader_role", value: about.leaderRole },
        { slot: "promise_label", value: about.promiseLabel },
        { slot: "promise_heading", value: about.promiseHeading },
        { slot: "promise_paragraph", value: about.promiseParagraph },
        { slot: "partners_label", value: about.partnersLabel },
        { slot: "partners_heading", value: about.partnersHeading },
      ]);

      // Replace the partner block wholesale: clear every numbered slot, then
      // write the current list back starting at 01.
      const clearText = await supabase
        .from("page_text")
        .delete()
        .eq("page", "about")
        .like("slot", "partner.%");
      if (clearText.error) throw clearText.error;

      const clearMedia = await supabase
        .from("page_media")
        .delete()
        .eq("page", "about")
        .like("slot", "partner.%");
      if (clearMedia.error) throw clearMedia.error;

      const textRows = kept.flatMap((p, i) => {
        const n = ordinal(i);
        const rows = [{ page: "about", slot: `partner.${n}.name`, value: p.name.trim() }];
        if (p.url.trim()) rows.push({ page: "about", slot: `partner.${n}.url`, value: p.url.trim() });
        if (p.description.trim())
          rows.push({
            page: "about",
            slot: `partner.${n}.description`,
            value: p.description.trim(),
          });
        return rows;
      });
      if (textRows.length) {
        const { error } = await supabase.from("page_text").insert(textRows);
        if (error) throw error;
      }

      const mediaRows = kept
        .map((p, i) =>
          p.logo
            ? {
                page: "about",
                slot: `partner.${ordinal(i)}.logo`,
                bucket: p.logo.bucket,
                storage_path: p.logo.storagePath,
                alt_text: p.name.trim(),
              }
            : null,
        )
        .filter((r): r is NonNullable<typeof r> => r !== null);
      if (mediaRows.length) {
        const { error } = await supabase.from("page_media").insert(mediaRows);
        if (error) throw error;
      }

      for (const orphan of orphanedLogos) {
        await deleteStoredObject(orphan.bucket, orphan.storagePath);
      }
      setOrphanedLogos([]);

      await invalidate();
      toast({ title: "Saved", description: "About page updated." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: (err as Error).message || "Please try again.",
      });
    } finally {
      setSavingAbout(false);
    }
  };

  const updatePartner = (id: string, patch: Partial<PartnerDraft>) =>
    setPartners((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const movePartner = (index: number, delta: number) =>
    setPartners((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const dropPartnerLogo = (partner: PartnerDraft) => {
    if (partner.logo) setOrphanedLogos((list) => [...list, partner.logo!]);
    updatePartner(partner.id, { logo: null });
  };

  const handlePartnerLogo = async (partner: PartnerDraft, file: File) => {
    setBusyKey(`partner-${partner.id}`);
    try {
      const uploaded = await uploadPageMedia(file, "partner_logo", "about", "partner-logo");
      if (partner.logo) setOrphanedLogos((list) => [...list, partner.logo!]);
      updatePartner(partner.id, { logo: uploaded });
      toast({ title: "Logo uploaded", description: "Save the About page to publish it." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          err instanceof NotAnImageError ? err.message : (err as Error).message || "Please try again.",
      });
    } finally {
      setBusyKey(null);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading settings…</p>;
  }

  const textSaving = saveText.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Business details, branding and page texts. Changes go live on the public site
          immediately.
        </p>
        {isDirty && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            You have unsaved changes. Use the save button in this section before leaving the page.
          </p>
        )}
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-2 h-auto bg-transparent p-0">
          {[
            { value: "business", label: "Business" },
            { value: "appearance", label: "Appearance" },
            { value: "homepage", label: "Home texts" },
            { value: "about", label: "About texts" },
            { value: "contact", label: "Contact texts" },
            { value: "developments", label: "Developments texts" },
            { value: "gallery", label: "Gallery texts" },
            { value: "testimonials", label: "Testimonials texts" },
            { value: "maintenance", label: "Maintenance" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-[4px] px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-300 border border-border bg-transparent text-slate shadow-none hover:text-charcoal data-[state=active]:bg-charcoal data-[state=active]:text-white data-[state=active]:border-charcoal data-[state=active]:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>


      <TabsContent value="business" className="space-y-4">
        <p className="text-xs text-slate-500">
          Name, contact details and social links. These appear in the footer, on the contact page
          and in search results.
        </p>

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <div>
            <Label htmlFor="site-name">Business name</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder={SITE_NAME_FALLBACK}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="business-contact">Lead contact</Label>
            <Input
              id="business-contact"
              value={business.contactName}
              onChange={(e) => setBusiness((b) => ({ ...b, contactName: e.target.value }))}
              placeholder={BUSINESS_FALLBACKS.contactName}
              className="mt-2"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={business.phone}
                onChange={(e) => setBusiness((b) => ({ ...b, phone: e.target.value }))}
                placeholder={BUSINESS_FALLBACKS.phone}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                value={business.email}
                onChange={(e) => setBusiness((b) => ({ ...b, email: e.target.value }))}
                placeholder={BUSINESS_FALLBACKS.email}
                className="mt-2"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="business-address-1">Address line 1</Label>
              <Input
                id="business-address-1"
                value={business.addressLine1}
                onChange={(e) => setBusiness((b) => ({ ...b, addressLine1: e.target.value }))}
                placeholder={BUSINESS_FALLBACKS.addressLine1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="business-address-2">Address line 2</Label>
              <Input
                id="business-address-2"
                value={business.addressLine2}
                onChange={(e) => setBusiness((b) => ({ ...b, addressLine2: e.target.value }))}
                placeholder={BUSINESS_FALLBACKS.addressLine2}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="business-blurb">Short description (footer)</Label>
            <Textarea
              id="business-blurb"
              value={business.blurb}
              onChange={(e) => setBusiness((b) => ({ ...b, blurb: e.target.value }))}
              placeholder={BUSINESS_FALLBACKS.blurb}
              rows={2}
              className="mt-2"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="business-facebook">Facebook link</Label>
              <Input
                id="business-facebook"
                value={business.facebookUrl}
                onChange={(e) => setBusiness((b) => ({ ...b, facebookUrl: e.target.value }))}
                placeholder={BUSINESS_FALLBACKS.facebookUrl}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="business-instagram">Instagram link</Label>
              <Input
                id="business-instagram"
                value={business.instagramUrl}
                onChange={(e) => setBusiness((b) => ({ ...b, instagramUrl: e.target.value }))}
                placeholder={BUSINESS_FALLBACKS.instagramUrl}
                className="mt-2"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Leave a social link empty to hide that icon in the footer.
          </p>
          <Button onClick={handleSaveBusiness} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save business details"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-4">
        <p className="text-xs text-slate-500">
          Logo, favicon and logo size. Uploading an image saves it right away.
        </p>

        {BRAND_SLOTS.map((slot) => (
          <AssetSlot
            key={slotKey(slot)}
            label={slot.label}
            help={slot.help}
            url={urlFor(slot)}
            hasUpload={!!mediaFor(slot)}
            dark={slot.dark}
            note={slot.fallbackNote}
            busy={busyKey === slotKey(slot)}
            progress={progress}
            onPick={(file) => handleUpload(slot, file)}
            onRemove={() => handleRemove(slot)}
          />
        ))}

        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="logo-scale">Logo size</Label>
            <span className="text-xs tabular-nums text-slate-500">{logoScale}%</span>
          </div>
          <Slider
            id="logo-scale"
            value={[logoScale]}
            min={50}
            max={200}
            step={5}
            onValueChange={(v) => setLogoScale(v[0] ?? 100)}
          />
          <p className="text-xs text-slate-500">
            100% is the standard size used everywhere on the site.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleSaveAppearance} disabled={textSaving}>
              {textSaving ? "Saving…" : "Save appearance"}
            </Button>
            <Button
              variant="ghost"
              disabled={textSaving}
              onClick={() => {
                setLogoScale(100);
                void saveTextWithToast(
                  "global",
                  [{ slot: "logo.scale", value: "100" }],
                  "Logo size restored to the default.",
                );
              }}
            >
              Restore default
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="homepage" className="space-y-4">
        {HOME_SLOTS.map((slot) => (
          <AssetSlot
            key={slotKey(slot)}
            label={slot.label}
            help={slot.help}
            url={urlFor(slot)}
            hasUpload={!!mediaFor(slot)}
            dark={slot.dark}
            note={slot.fallbackNote}
            busy={busyKey === slotKey(slot)}
            progress={progress}
            onPick={(file) => handleUpload(slot, file)}
            onRemove={() => handleRemove(slot)}
          />
        ))}

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">

          <div>
            <Label htmlFor="hero-eyebrow">Small line above the headline</Label>
            <Input
              id="hero-eyebrow"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder={HERO_FALLBACKS.eyebrow}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="hero-headline">Headline</Label>
            <Textarea
              id="hero-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={HERO_FALLBACKS.headline}
              rows={2}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-slate-500">
              Press Enter to break the headline onto a second line.
            </p>
          </div>

          <div>
            <Label htmlFor="hero-subline">Subline</Label>
            <Textarea
              id="hero-subline"
              value={subline}
              onChange={(e) => setSubline(e.target.value)}
              placeholder={HERO_FALLBACKS.subline}
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="hero-cta">Button label</Label>
            <Input
              id="hero-cta"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder={HERO_FALLBACKS.ctaLabel}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="home-quote">Quote</Label>
            <Textarea
              id="home-quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder={HERO_FALLBACKS.quote}
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="home-quote-attribution">Quote attribution</Label>
            <Input
              id="home-quote-attribution"
              value={quoteAttribution}
              onChange={(e) => setQuoteAttribution(e.target.value)}
              placeholder={HERO_FALLBACKS.quoteAttribution}
              className="mt-2"
            />
          </div>

          <div className="space-y-5 border-t border-slate-200 pt-5">
            <div>
              <h3 className="text-sm font-medium text-slate-900">The OCDG Advantage cards</h3>
              <p className="mt-1 text-xs text-slate-500">
                Three cards below the homepage intro. The icons stay the same.
              </p>
            </div>
            {advantages.map((item, i) => (
              <div key={`advantage-${i}`} className="space-y-3 rounded-lg bg-slate-50 p-4">
                <div>
                  <Label htmlFor={`advantage-title-${i}`}>Card {i + 1} title</Label>
                  <Input
                    id={`advantage-title-${i}`}
                    value={item.title}
                    onChange={(e) =>
                      setAdvantages((prev) =>
                        prev.map((p, j) => (j === i ? { ...p, title: e.target.value } : p)),
                      )
                    }
                    placeholder={ADVANTAGE_FALLBACKS[i]?.title}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`advantage-text-${i}`}>Card {i + 1} text</Label>
                  <Textarea
                    id={`advantage-text-${i}`}
                    value={item.description}
                    onChange={(e) =>
                      setAdvantages((prev) =>
                        prev.map((p, j) => (j === i ? { ...p, description: e.target.value } : p)),
                      )
                    }
                    placeholder={ADVANTAGE_FALLBACKS[i]?.description}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5 border-t border-slate-200 pt-5">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Client quote teasers</h3>
              <p className="mt-1 text-xs text-slate-500">
                Short quotes near the bottom of the homepage. Each one links to the full
                testimonial.
              </p>
            </div>
            {snippets.map((item, i) => (
              <div key={`snippet-${i}`} className="space-y-3 rounded-lg bg-slate-50 p-4">
                <div>
                  <Label htmlFor={`snippet-author-${i}`}>Quote {i + 1} — client name</Label>
                  <Input
                    id={`snippet-author-${i}`}
                    value={item.author}
                    onChange={(e) =>
                      setSnippets((prev) =>
                        prev.map((p, j) => (j === i ? { ...p, author: e.target.value } : p)),
                      )
                    }
                    placeholder={SNIPPET_FALLBACKS[i]?.author}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`snippet-quote-${i}`}>Quote {i + 1} — short quote</Label>
                  <Textarea
                    id={`snippet-quote-${i}`}
                    value={item.quote}
                    onChange={(e) =>
                      setSnippets((prev) =>
                        prev.map((p, j) => (j === i ? { ...p, quote: e.target.value } : p)),
                      )
                    }
                    placeholder={SNIPPET_FALLBACKS[i]?.snippet}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Leave a field empty to fall back to the default wording shown in grey.
          </p>

          <Button onClick={handleSaveHome} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save homepage content"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="about" className="space-y-4">


        {ABOUT_SLOTS.map((slot) => (
          <AssetSlot
            key={slotKey(slot)}
            label={slot.label}
            help={slot.help}
            url={urlFor(slot)}
            hasUpload={!!mediaFor(slot)}
            dark={slot.dark}
            note={slot.fallbackNote}
            busy={busyKey === slotKey(slot)}
            progress={progress}
            onPick={(file) => handleUpload(slot, file)}
            onRemove={() => handleRemove(slot)}
          />
        ))}

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-900">Page header</p>
          <div>
            <Label htmlFor="about-eyebrow">Small line above the title</Label>
            <Input
              id="about-eyebrow"
              value={about.heroEyebrow}
              onChange={(e) => setAbout({ ...about, heroEyebrow: e.target.value })}
              placeholder={ABOUT_FALLBACKS.heroEyebrow}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="about-title">Page title</Label>
            <Input
              id="about-title"
              value={about.heroTitle}
              onChange={(e) => setAbout({ ...about, heroTitle: e.target.value })}
              placeholder={ABOUT_FALLBACKS.heroTitle}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-900">Our Story</p>
          <div>
            <Label htmlFor="story-label">Small label</Label>
            <Input
              id="story-label"
              value={about.storyLabel}
              onChange={(e) => setAbout({ ...about, storyLabel: e.target.value })}
              placeholder={ABOUT_FALLBACKS.storyLabel}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="story-heading">Heading</Label>
            <Input
              id="story-heading"
              value={about.storyHeading}
              onChange={(e) => setAbout({ ...about, storyHeading: e.target.value })}
              placeholder={ABOUT_FALLBACKS.storyHeading}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="story-p1">First paragraph</Label>
            <Textarea
              id="story-p1"
              value={about.storyParagraph1}
              onChange={(e) => setAbout({ ...about, storyParagraph1: e.target.value })}
              placeholder={ABOUT_FALLBACKS.storyParagraph1}
              rows={4}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="story-p2">Second paragraph</Label>
            <Textarea
              id="story-p2"
              value={about.storyParagraph2}
              onChange={(e) => setAbout({ ...about, storyParagraph2: e.target.value })}
              placeholder={ABOUT_FALLBACKS.storyParagraph2}
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="story-quote">Pull-quote</Label>
            <Input
              id="story-quote"
              value={about.storyQuote}
              onChange={(e) => setAbout({ ...about, storyQuote: e.target.value })}
              placeholder={ABOUT_FALLBACKS.storyQuote}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="story-attr">Quote attribution</Label>
            <Input
              id="story-attr"
              value={about.storyQuoteAttribution}
              onChange={(e) => setAbout({ ...about, storyQuoteAttribution: e.target.value })}
              placeholder={ABOUT_FALLBACKS.storyQuoteAttribution}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-900">Leadership &amp; Our Promise</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="leader-name">Name under the portrait</Label>
              <Input
                id="leader-name"
                value={about.leaderName}
                onChange={(e) => setAbout({ ...about, leaderName: e.target.value })}
                placeholder={ABOUT_FALLBACKS.leaderName}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="leader-role">Role</Label>
              <Input
                id="leader-role"
                value={about.leaderRole}
                onChange={(e) => setAbout({ ...about, leaderRole: e.target.value })}
                placeholder={ABOUT_FALLBACKS.leaderRole}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="promise-label">Small label</Label>
            <Input
              id="promise-label"
              value={about.promiseLabel}
              onChange={(e) => setAbout({ ...about, promiseLabel: e.target.value })}
              placeholder={ABOUT_FALLBACKS.promiseLabel}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="promise-heading">Heading</Label>
            <Input
              id="promise-heading"
              value={about.promiseHeading}
              onChange={(e) => setAbout({ ...about, promiseHeading: e.target.value })}
              placeholder={ABOUT_FALLBACKS.promiseHeading}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="promise-paragraph">Paragraph</Label>
            <Textarea
              id="promise-paragraph"
              value={about.promiseParagraph}
              onChange={(e) => setAbout({ ...about, promiseParagraph: e.target.value })}
              placeholder={ABOUT_FALLBACKS.promiseParagraph}
              rows={4}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-900">Trusted Collaborators</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="partners-label">Small label</Label>
              <Input
                id="partners-label"
                value={about.partnersLabel}
                onChange={(e) => setAbout({ ...about, partnersLabel: e.target.value })}
                placeholder={ABOUT_FALLBACKS.partnersLabel}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="partners-heading">Heading</Label>
              <Input
                id="partners-heading"
                value={about.partnersHeading}
                onChange={(e) => setAbout({ ...about, partnersHeading: e.target.value })}
                placeholder={ABOUT_FALLBACKS.partnersHeading}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            {partners.map((partner, index) => (
              <div key={partner.id} className="space-y-4 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Partner {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => movePartner(index, -1)}
                      aria-label="Move partner up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === partners.length - 1}
                      onClick={() => movePartner(index, 1)}
                      aria-label="Move partner down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPartners((list) => list.filter((p) => p.id !== partner.id))}
                      aria-label="Remove partner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <PartnerLogoField
                  url={partner.logo ? publicUrlFor(partner.logo.bucket, partner.logo.storagePath) : null}
                  busy={busyKey === `partner-${partner.id}`}
                  onPick={(file) => handlePartnerLogo(partner, file)}
                  onClear={() => dropPartnerLogo(partner)}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`partner-name-${partner.id}`}>Name</Label>
                    <Input
                      id={`partner-name-${partner.id}`}
                      value={partner.name}
                      onChange={(e) => updatePartner(partner.id, { name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`partner-url-${partner.id}`}>Website</Label>
                    <Input
                      id={`partner-url-${partner.id}`}
                      value={partner.url}
                      onChange={(e) => updatePartner(partner.id, { url: e.target.value })}
                      placeholder="https://example.com"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`partner-desc-${partner.id}`}>Description</Label>
                  <Textarea
                    id={`partner-desc-${partner.id}`}
                    value={partner.description}
                    onChange={(e) => updatePartner(partner.id, { description: e.target.value })}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPartners((list) => [
                ...list,
                { id: crypto.randomUUID(), name: "", url: "", description: "", logo: null },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add partner
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          Leave a field empty to fall back to the default wording shown in grey.
        </p>

        <Button onClick={saveAboutWithToast} disabled={savingAbout}>
          {savingAbout ? "Saving…" : "Save About page"}
        </Button>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4">
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <div>
            <Label htmlFor="contact-eyebrow">Small line above the title</Label>
            <Input
              id="contact-eyebrow"
              value={contactCopy.heroEyebrow}
              onChange={(e) => setContactCopy((c) => ({ ...c, heroEyebrow: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.heroEyebrow}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contact-title">Page title</Label>
            <Input
              id="contact-title"
              value={contactCopy.heroTitle}
              onChange={(e) => setContactCopy((c) => ({ ...c, heroTitle: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.heroTitle}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contact-info-label">Small line above the heading</Label>
            <Input
              id="contact-info-label"
              value={contactCopy.infoLabel}
              onChange={(e) => setContactCopy((c) => ({ ...c, infoLabel: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.infoLabel}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contact-info-heading">Heading</Label>
            <Input
              id="contact-info-heading"
              value={contactCopy.infoHeading}
              onChange={(e) => setContactCopy((c) => ({ ...c, infoHeading: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.infoHeading}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contact-lead">Lead contact name</Label>
            <Input
              id="contact-lead"
              value={contactCopy.leadContact}
              onChange={(e) => setContactCopy((c) => ({ ...c, leadContact: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.leadContact}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contact-form-title">Form title</Label>
            <Input
              id="contact-form-title"
              value={contactCopy.formTitle}
              onChange={(e) => setContactCopy((c) => ({ ...c, formTitle: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.formTitle}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contact-form-intro">Text above the form</Label>
            <Textarea
              id="contact-form-intro"
              value={contactCopy.formIntro}
              onChange={(e) => setContactCopy((c) => ({ ...c, formIntro: e.target.value }))}
              placeholder={CONTACT_FALLBACKS.formIntro}
              rows={2}
              className="mt-2"
            />
          </div>
          <p className="text-xs text-slate-500">
            Phone, email and address on this page come from the Business tab.
          </p>
          <Button onClick={handleSaveContact} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save contact page"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="maintenance" className="space-y-4">
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-slate-900">Maintenance mode</p>
              <p className="mt-1 text-xs text-slate-500">
                Visitors see a short holding page instead of the site. You stay signed in and keep
                seeing the real site, with a reminder bar at the top.
              </p>
            </div>
            <Switch
              checked={maintenanceOn}
              disabled={textSaving}
              onCheckedChange={(next) => {
                setMaintenanceOn(next);
                void handleSaveMaintenance(next, maintenanceMessage);
              }}
            />
          </div>
          <div>
            <Label htmlFor="maintenance-message">Message shown to visitors</Label>
            <Textarea
              id="maintenance-message"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder={MAINTENANCE_FALLBACK_MESSAGE}
              rows={3}
              className="mt-2"
            />
          </div>
          <Button
            onClick={() => handleSaveMaintenance(maintenanceOn, maintenanceMessage)}
            disabled={textSaving}
          >
            {textSaving ? "Saving…" : "Save message"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="developments" className="space-y-4">
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">
            The header at the top of the Developments page. The homes themselves are managed under
            Properties.
          </p>
          <div>
            <Label htmlFor="dev-eyebrow">Small line above the title</Label>
            <Input
              id="dev-eyebrow"
              value={developmentsCopy.heroEyebrow}
              onChange={(e) =>
                setDevelopmentsCopy((p) => ({ ...p, heroEyebrow: e.target.value }))
              }
              placeholder={DEVELOPMENTS_FALLBACKS.heroEyebrow}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="dev-title">Page title</Label>
            <Input
              id="dev-title"
              value={developmentsCopy.heroTitle}
              onChange={(e) => setDevelopmentsCopy((p) => ({ ...p, heroTitle: e.target.value }))}
              placeholder={DEVELOPMENTS_FALLBACKS.heroTitle}
              className="mt-2"
            />
          </div>
          <Button onClick={handleSaveDevelopments} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save developments content"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="gallery" className="space-y-4">
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">
            The header of the Gallery page. The photos come from each property.
          </p>
          <div>
            <Label htmlFor="gallery-eyebrow">Small line above the title</Label>
            <Input
              id="gallery-eyebrow"
              value={galleryCopy.heroEyebrow}
              onChange={(e) => setGalleryCopy((p) => ({ ...p, heroEyebrow: e.target.value }))}
              placeholder={GALLERY_FALLBACKS.heroEyebrow}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="gallery-title">Page title</Label>
            <Input
              id="gallery-title"
              value={galleryCopy.heroTitle}
              onChange={(e) => setGalleryCopy((p) => ({ ...p, heroTitle: e.target.value }))}
              placeholder={GALLERY_FALLBACKS.heroTitle}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="gallery-empty">Message when there are no photos yet</Label>
            <Input
              id="gallery-empty"
              value={galleryCopy.emptyMessage}
              onChange={(e) => setGalleryCopy((p) => ({ ...p, emptyMessage: e.target.value }))}
              placeholder={GALLERY_FALLBACKS.emptyMessage}
              className="mt-2"
            />
          </div>
          <Button onClick={handleSaveGallery} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save gallery content"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="testimonials" className="space-y-4">
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">
            The header and the closing call to action. The reviews themselves are managed under
            Testimonials.
          </p>
          <div>
            <Label htmlFor="testi-eyebrow">Small line above the title</Label>
            <Input
              id="testi-eyebrow"
              value={testimonialsCopy.heroEyebrow}
              onChange={(e) =>
                setTestimonialsCopy((p) => ({ ...p, heroEyebrow: e.target.value }))
              }
              placeholder={TESTIMONIALS_FALLBACKS.heroEyebrow}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="testi-title">Page title</Label>
            <Input
              id="testi-title"
              value={testimonialsCopy.heroTitle}
              onChange={(e) => setTestimonialsCopy((p) => ({ ...p, heroTitle: e.target.value }))}
              placeholder={TESTIMONIALS_FALLBACKS.heroTitle}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="testi-empty">Message when there are no reviews yet</Label>
            <Input
              id="testi-empty"
              value={testimonialsCopy.emptyMessage}
              onChange={(e) =>
                setTestimonialsCopy((p) => ({ ...p, emptyMessage: e.target.value }))
              }
              placeholder={TESTIMONIALS_FALLBACKS.emptyMessage}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="testi-cta-label">Call to action — small line</Label>
            <Input
              id="testi-cta-label"
              value={testimonialsCopy.ctaLabel}
              onChange={(e) => setTestimonialsCopy((p) => ({ ...p, ctaLabel: e.target.value }))}
              placeholder={TESTIMONIALS_FALLBACKS.ctaLabel}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="testi-cta-heading">Call to action — heading</Label>
            <Input
              id="testi-cta-heading"
              value={testimonialsCopy.ctaHeading}
              onChange={(e) => setTestimonialsCopy((p) => ({ ...p, ctaHeading: e.target.value }))}
              placeholder={TESTIMONIALS_FALLBACKS.ctaHeading}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="testi-cta-body">Call to action — text</Label>
            <Textarea
              id="testi-cta-body"
              value={testimonialsCopy.ctaBody}
              onChange={(e) => setTestimonialsCopy((p) => ({ ...p, ctaBody: e.target.value }))}
              placeholder={TESTIMONIALS_FALLBACKS.ctaBody}
              rows={2}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="testi-cta-button">Call to action — button label</Label>
            <Input
              id="testi-cta-button"
              value={testimonialsCopy.ctaButton}
              onChange={(e) => setTestimonialsCopy((p) => ({ ...p, ctaButton: e.target.value }))}
              placeholder={TESTIMONIALS_FALLBACKS.ctaButton}
              className="mt-2"
            />
          </div>
          <Button onClick={handleSaveTestimonials} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save testimonials content"}
          </Button>
        </div>
      </TabsContent>
      </Tabs>
    </div>

  );
}

export default function AdminSettings() {
  return (
    <AdminProtected>
      <SettingsBody />
    </AdminProtected>
  );
}
