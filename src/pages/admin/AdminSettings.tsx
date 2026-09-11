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
  useSiteSettings,
  FALLBACK_LOGO,
  FALLBACK_HERO,
  FALLBACK_FAVICON,
  FALLBACK_ABOUT_HERO,
  FALLBACK_ABOUT_STORY,
  FALLBACK_PORTRAIT,
  HERO_FALLBACKS,
  ABOUT_FALLBACKS,
  type PartnerEntry,
} from "@/hooks/useSiteSettings";
import { useSaveSiteSettings } from "@/hooks/admin/useSiteSettingsAdmin";
import {
  uploadBrandAsset,
  deleteBrandAsset,
  getBrandAssetUrl,
  NotAnImageError,
  type BrandAssetKind,
} from "@/lib/admin/uploadBrandAsset";

type SlotKey =
  | "logo_path"
  | "logo_dark_path"
  | "favicon_path"
  | "hero_image_path"
  | "about_hero_image_path"
  | "about_story_image_path"
  | "about_portrait_image_path";

type SlotDef = {
  key: SlotKey;
  kind: BrandAssetKind;
  label: string;
  help: string;
  dark?: boolean;
  fallbackUrl?: string;
  fallbackNote?: string;
};

const BRAND_SLOTS: SlotDef[] = [
  {
    key: "logo_path",
    kind: "logo",
    label: "Logo",
    help: "Used in the header, footer and admin panel. PNG with transparency works best.",
    fallbackUrl: FALLBACK_LOGO,
    fallbackNote: "Currently using the built-in logo.",
  },
  {
    key: "logo_dark_path",
    kind: "logo_dark",
    label: "Dark-background logo",
    help: "Optional. Without it, the main logo is knocked out to white on dark surfaces.",
    dark: true,
  },
  {
    key: "favicon_path",
    kind: "favicon",
    label: "Favicon",
    help: "Square image shown in the browser tab.",
    fallbackUrl: FALLBACK_FAVICON,
    fallbackNote: "Currently using the built-in favicon.",
  },
];

const HOME_SLOTS: SlotDef[] = [
  {
    key: "hero_image_path",
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
    key: "about_hero_image_path",
    kind: "about_hero",
    label: "About header photo",
    help: "Background photo behind the About page title.",
    dark: true,
    fallbackUrl: FALLBACK_ABOUT_HERO,
    fallbackNote: "Currently using the built-in header photo.",
  },
  {
    key: "about_story_image_path",
    kind: "about_story",
    label: "Our Story photo",
    help: "Tall photo beside the Our Story text.",
    fallbackUrl: FALLBACK_ABOUT_STORY,
    fallbackNote: "Currently using the built-in craftsmanship photo.",
  },
  {
    key: "about_portrait_image_path",
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
  dark?: boolean;
  note?: string;
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
  path,
  busy,
  onPick,
  onClear,
}: {
  path: string | null;
  busy: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-slate-100 px-3">
        {path ? (
          <img src={getBrandAssetUrl(path)} alt="Partner logo" className="max-h-12 w-auto object-contain" />
        ) : (
          <span className="text-[11px] text-slate-400">No logo</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {path ? "Replace logo" : "Upload logo"}
        </Button>
        {path && (
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

const FALLBACK_PARTNER_ROWS: PartnerEntry[] = [
  {
    id: "halliday-architects",
    name: "Halliday Architects",
    url: "https://www.hallidayarchitects.com/",
    logo_path: null,
    description:
      "Every Ocean City Development Group project is brought to life in collaboration with Halliday Architects, whose award-winning designs blend coastal elegance with modern functionality.",
  },
  {
    id: "halliday-leonard",
    name: "Halliday-Leonard Custom Home Builders",
    url: "https://www.hallidayleonardllc.com/",
    logo_path: null,
    description:
      "Our trusted construction partner, Halliday-Leonard delivers master-level craftsmanship on every residence — combining decades of building expertise with an unwavering commitment to quality.",
  },
];

function SettingsBody() {
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSiteSettings();
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
  const [partners, setPartners] = useState<PartnerEntry[]>([]);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const row = settings.row;
    if (!row) return;
    setSiteName(row.site_name ?? "");
    setEyebrow(row.hero_eyebrow ?? "");
    setHeadline(row.hero_headline ?? "");
    setSubline(row.hero_subline ?? "");
    setCtaLabel(row.hero_cta_label ?? "");
    setQuote(row.home_quote ?? "");
    setQuoteAttribution(row.home_quote_attribution ?? "");

    setAbout({
      heroEyebrow: row.about_hero_eyebrow ?? "",
      heroTitle: row.about_hero_title ?? "",
      storyLabel: row.about_story_label ?? "",
      storyHeading: row.about_story_heading ?? "",
      storyParagraph1: row.about_story_paragraph_1 ?? "",
      storyParagraph2: row.about_story_paragraph_2 ?? "",
      storyQuote: row.about_story_quote ?? "",
      storyQuoteAttribution: row.about_story_quote_attribution ?? "",
      leaderName: row.about_leader_name ?? "",
      leaderRole: row.about_leader_role ?? "",
      promiseLabel: row.about_promise_label ?? "",
      promiseHeading: row.about_promise_heading ?? "",
      promiseParagraph: row.about_promise_paragraph ?? "",
      partnersLabel: row.about_partners_label ?? "",
      partnersHeading: row.about_partners_heading ?? "",
    });
    const stored = Array.isArray(row.about_partners) ? row.about_partners : [];
    setPartners(stored.length ? stored : FALLBACK_PARTNER_ROWS);
  }, [settings.row]);

  const rowId = settings.row?.id ?? null;
  const pathFor = (key: SlotKey) => settings.row?.[key] ?? null;

  const urlFor = (slot: SlotDef) => {
    const path = pathFor(slot.key);
    if (path) return getBrandAssetUrl(path);
    return slot.fallbackUrl ?? null;
  };

  const handleUpload = async (slot: SlotDef, file: File) => {
    setBusyKey(slot.key);
    setProgress(0);
    try {
      const previous = pathFor(slot.key);
      const path = await uploadBrandAsset(file, slot.kind, setProgress);
      await save.mutateAsync({ id: rowId, patch: { [slot.key]: path } });
      await deleteBrandAsset(previous);
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
    const previous = pathFor(slot.key);
    setBusyKey(slot.key);
    try {
      await save.mutateAsync({ id: rowId, patch: { [slot.key]: null } });
      await deleteBrandAsset(previous);
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

  const saveWithToast = async (
    patch: Parameters<typeof save.mutateAsync>[0]["patch"],
    description: string,
  ) => {
    try {
      await save.mutateAsync({ id: rowId, patch });
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
    saveWithToast(
      { site_name: siteName.trim() || "Ocean City Development Group" },
      "Brand settings updated.",
    );

  const handleSaveHome = () =>
    saveWithToast(
      {
        hero_eyebrow: eyebrow.trim() || null,
        hero_headline: headline.trim() || null,
        hero_subline: subline.trim() || null,
        hero_cta_label: ctaLabel.trim() || null,
        home_quote: quote.trim() || null,
        home_quote_attribution: quoteAttribution.trim() || null,
      },
      "Homepage content updated.",
    );


  const handleSaveAbout = async (nextPartners: PartnerEntry[] = partners) => {
    await save.mutateAsync({
      id: rowId,
      patch: {
        about_hero_eyebrow: about.heroEyebrow.trim() || null,
        about_hero_title: about.heroTitle.trim() || null,
        about_story_label: about.storyLabel.trim() || null,
        about_story_heading: about.storyHeading.trim() || null,
        about_story_paragraph_1: about.storyParagraph1.trim() || null,
        about_story_paragraph_2: about.storyParagraph2.trim() || null,
        about_story_quote: about.storyQuote.trim() || null,
        about_story_quote_attribution: about.storyQuoteAttribution.trim() || null,
        about_leader_name: about.leaderName.trim() || null,
        about_leader_role: about.leaderRole.trim() || null,
        about_promise_label: about.promiseLabel.trim() || null,
        about_promise_heading: about.promiseHeading.trim() || null,
        about_promise_paragraph: about.promiseParagraph.trim() || null,
        about_partners_label: about.partnersLabel.trim() || null,
        about_partners_heading: about.partnersHeading.trim() || null,
        about_partners: nextPartners.filter((p) => p.name.trim().length > 0),
      },
    });
  };

  const saveAboutWithToast = async () => {
    try {
      await handleSaveAbout();
      toast({ title: "Saved", description: "About page updated." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: (err as Error).message || "Please try again.",
      });
    }
  };

  const updatePartner = (id: string, patch: Partial<PartnerEntry>) =>
    setPartners((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const movePartner = (index: number, delta: number) =>
    setPartners((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handlePartnerLogo = async (partner: PartnerEntry, file: File) => {
    setBusyKey(`partner-${partner.id}`);
    try {
      const path = await uploadBrandAsset(file, "partner_logo");
      await deleteBrandAsset(partner.logo_path);
      updatePartner(partner.id, { logo_path: path });
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
            key={slot.key}
            label={slot.label}
            help={slot.help}
            url={urlFor(slot)}
            hasUpload={!!pathFor(slot.key)}
            dark={slot.dark}
            note={slot.fallbackNote}
            busy={busyKey === slot.key}
            progress={progress}
            onPick={(file) => handleUpload(slot, file)}
            onRemove={() => handleRemove(slot)}
          />
        ))}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Button onClick={handleSaveBrand} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save brand settings"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="homepage" className="space-y-4">
        {HOME_SLOTS.map((slot) => (
          <AssetSlot
            key={slot.key}
            label={slot.label}
            help={slot.help}
            url={urlFor(slot)}
            hasUpload={!!pathFor(slot.key)}
            dark={slot.dark}
            note={slot.fallbackNote}
            busy={busyKey === slot.key}
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

          <Button onClick={handleSaveHome} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save homepage content"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="about" className="space-y-4">


        {ABOUT_SLOTS.map((slot) => (
          <AssetSlot
            key={slot.key}
            label={slot.label}
            help={slot.help}
            url={urlFor(slot)}
            hasUpload={!!pathFor(slot.key)}
            dark={slot.dark}
            note={slot.fallbackNote}
            busy={busyKey === slot.key}
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
                  path={partner.logo_path}
                  busy={busyKey === `partner-${partner.id}`}
                  onPick={(file) => handlePartnerLogo(partner, file)}
                  onClear={() => updatePartner(partner.id, { logo_path: null })}
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
                { id: crypto.randomUUID(), name: "", url: "", logo_path: null, description: "" },
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

        <Button onClick={saveAboutWithToast} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save About page"}
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
