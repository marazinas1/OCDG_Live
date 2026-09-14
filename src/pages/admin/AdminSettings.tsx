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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const PAGES = ["global", "home", "about", "contact"];

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
  const [partners, setPartners] = useState<PartnerDraft[]>([]);
  /** Storage objects to delete once the About page saves successfully. */
  const [orphanedLogos, setOrphanedLogos] = useState<{ bucket: string; storagePath: string }[]>([]);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [savingAbout, setSavingAbout] = useState(false);

  useEffect(() => {
    const text = (page: string, slot: string) =>
      bundle.text.find((r) => r.page === page && r.slot === slot)?.value ?? "";

    setSiteName(text("global", "site_name"));
    setEyebrow(text("home", "hero_eyebrow"));
    setHeadline(text("home", "hero_headline"));
    setSubline(text("home", "hero_subline"));
    setCtaLabel(text("home", "hero_cta_label"));
    setQuote(text("home", "quote"));
    setQuoteAttribution(text("home", "quote_attribution"));

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
  }, [bundle]);

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
  ) => {
    try {
      await saveText.mutateAsync({ page, entries });
      toast({ title: "Saved", description });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: (err as Error).message || "Please try again.",
      });
    }
  };

  const handleSaveBrand = () =>
    saveTextWithToast(
      "global",
      [{ slot: "site_name", value: siteName.trim() || SITE_NAME_FALLBACK }],
      "Brand settings updated.",
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
      ],
      "Homepage content updated.",
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
          Brand assets, homepage and About page content. Changes go live on the public site
          immediately.
        </p>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-2 h-auto bg-transparent p-0">
          {[
            { value: "brand", label: "Brand" },
            { value: "homepage", label: "Homepage" },
            { value: "about", label: "About page" },
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


      <TabsContent value="brand" className="space-y-4">
        <p className="text-xs text-slate-500">
          Logo, favicon and site name. Uploading an image saves it right away.
        </p>


        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Label htmlFor="site-name">Site name</Label>
          <Input
            id="site-name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Ocean City Development Group"
            className="mt-2"
          />
          <p className="mt-2 text-xs text-slate-500">Used as the logo's alternative text.</p>
        </div>

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
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Button onClick={handleSaveBrand} disabled={textSaving}>
            {textSaving ? "Saving…" : "Save brand settings"}
          </Button>
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
