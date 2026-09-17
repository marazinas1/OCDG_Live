import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import {
  Bed,
  Bath,
  MapPin,
  Phone,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getSpecIcon } from "@/lib/specIcons";
import { STATUS_LABELS, isPropertyStatus } from "@/lib/admin/status";
import { usePropertyNeighbors } from "@/hooks/usePublicProperties";

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  unit: string | null;
  headline: string | null;
  tagline: string | null;
  description: string | null;
  price: string | null;
  status: string | null;
  bedrooms: number | null;
  full_baths: number | null;
  half_baths: number | null;
  total_rooms: number | null;
  sqft: number | null;
  location_neighborhood: string | null;
  location_city: string | null;
  location_state: string | null;
  location_highlight: string | null;
  location_heading: string | null;
  highlights: Array<{ value: string; label: string }> | null;
  vision_headline: string | null;
  vision_floors: Array<{ label: string; body: string }> | null;
  vision_caption_eyebrow: string | null;
  vision_caption_title: string | null;
  map_embed_query: string | null;
  specs: Array<{ icon: string; title: string; description: string }> | null;
  floor_plans:
    | Array<{
        id: string;
        name: string;
        description?: string | null;
        highlights?: string[] | null;
      }>
    | null;
  luxury_features: string[] | null;
  location_features: string[] | null;
  published: boolean;
  has_page: boolean;
  mls_url: string | null;
};

type ImageRow = {
  id: string;
  property_id: string;
  category: string;
  floor_plan_id: string | null;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
};

type GalleryImage = { src: string; alt: string };

const CONTACT = {
  name: "Patrick Halliday",
  company: "Ocean City Development Group, LLC",
  phone: "(609) 602-3917",
  email: "PatrickAHalliday@gmail.com",
};

const INTEREST_LEVELS = [
  { value: "buyer", label: "Ready to Purchase" },
  { value: "investor", label: "Investment Opportunity" },
  { value: "exploring", label: "Exploring Options" },
  { value: "agent", label: "Real Estate Professional" },
];

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const publicUrl = (path: string) => {
  // Preview mode passes fully-resolved URLs (public URL for existing objects,
  // blob: URL for pending file uploads). Pass those through untouched.
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;
};

const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
  </div>
);

const PropertyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const adminAuth = useAdminAuth();
  const isAdmin = adminAuth.status === "admin";

  // Preview mode: renders unsaved form data from sessionStorage instead of
  // fetching from the DB. Enabled when the admin form opens /admin/preview
  // in a new tab. No DB reads/writes happen in this mode.
  const isPreview = location.pathname === "/admin/preview";
  const previewData = useMemo(() => {
    if (!isPreview || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("admin-preview-property");
      if (!raw) return null;
      return JSON.parse(raw) as {
        property: PropertyRow;
        images: ImageRow[];
      };
    } catch {
      return null;
    }
  }, [isPreview]);

  const propertyQuery = useQuery({
    queryKey: ["public-property", slug],
    enabled: !!slug && !isPreview,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as (PropertyRow & { property_images: ImageRow[] }) | null;
    },
  });

  const property: (PropertyRow & { property_images: ImageRow[] }) | null = isPreview
    ? previewData
      ? { ...previewData.property, property_images: previewData.images }
      : null
    : propertyQuery.data ?? null;

  const images = useMemo(() => {
    const rows = (property?.property_images ?? []) as ImageRow[];
    return [...rows].sort((a, b) => a.sort_order - b.sort_order);
  }, [property]);

  const grouped = useMemo(() => {
    const g: Record<string, ImageRow[]> = {};
    for (const row of images) {
      (g[row.category] ??= []).push(row);
    }
    return g;
  }, [images]);

  const heroImage = grouped["hero"]?.[0] ?? null;
  const cardImage = grouped["card"]?.[0] ?? null;
  const exteriorImages: GalleryImage[] = (grouped["exterior"] ?? []).map(
    (r) => ({ src: publicUrl(r.storage_path), alt: r.alt_text ?? property?.title ?? "" })
  );
  const interiorImages: GalleryImage[] = (grouped["interior"] ?? []).map((r) => ({
    src: publicUrl(r.storage_path),
    alt: r.alt_text ?? property?.title ?? "",
  }));
  const photoImages: GalleryImage[] = (grouped["photo"] ?? []).map((r) => ({
    src: publicUrl(r.storage_path),
    alt: r.alt_text ?? property?.title ?? "",
  }));
  const allGallery = [...exteriorImages, ...interiorImages];

  const visionImageRow = grouped["vision"]?.[0] ?? null;

  const floorPlans = property?.floor_plans ?? [];
  const floorPlanImageBy = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of grouped["floor_plan"] ?? []) {
      if (row.floor_plan_id) map[row.floor_plan_id] = publicUrl(row.storage_path);
    }
    return map;
  }, [grouped["floor_plan"]]);

  const [activeFloor, setActiveFloor] = useState<string | null>(null);
  useEffect(() => {
    if (!activeFloor && floorPlans.length) setActiveFloor(floorPlans[0]!.id);
  }, [floorPlans, activeFloor]);
  const currentFloor = floorPlans.find((f) => f.id === activeFloor) ?? floorPlans[0] ?? null;

  // Parallax + lightbox state
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };
  const nextImage = () =>
    setLightboxIndex((p) => (allGallery.length ? (p + 1) % allGallery.length : 0));
  const prevImage = () =>
    setLightboxIndex((p) =>
      allGallery.length ? (p - 1 + allGallery.length) % allGallery.length : 0
    );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, allGallery.length]);

  // Scroll reveals
  const { ref: highlightsRef, isVisible: highlightsVisible } = useScrollReveal(0.3);
  const { ref: visionRef, isVisible: visionVisible } = useScrollReveal();
  const { ref: specsRef, isVisible: specsVisible } = useScrollReveal();
  const { ref: floorRef, isVisible: floorVisible } = useScrollReveal();
  const { ref: galleryRef, isVisible: galleryVisible } = useScrollReveal();
  const { ref: locationRef, isVisible: locationVisible } = useScrollReveal();
  const { ref: registerRef, isVisible: registerVisible } = useScrollReveal();

  // Loading / not-found gates
  if (isPreview && !previewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-lg font-serif text-charcoal mb-2">No preview data</p>
          <p className="text-sm text-slate-500">
            Open this preview from the admin property form's Preview button.
          </p>
        </div>
      </div>
    );
  }
  if (!isPreview && propertyQuery.isLoading) {
    return <PageSkeleton />;
  }
  if (!property) {
    return <Navigate to="/404" replace />;
  }
  // Preview bypasses has_page / published gates so admins can see the page
  // exactly as it will render before publishing.
  if (!isPreview) {
    if (!property.has_page) {
      return <Navigate to="/404" replace />;
    }
    if (!property.published && !isAdmin && adminAuth.status !== "loading") {
      return <Navigate to="/404" replace />;
    }
    if (!property.published && adminAuth.status === "loading") {
      return <PageSkeleton />;
    }
  }

  const statusLabel =
    property.status && isPropertyStatus(property.status)
      ? STATUS_LABELS[property.status]
      : property.status ?? "";

  const bathTotal =
    property.full_baths != null
      ? (() => {
          const v = property.full_baths + (property.half_baths ?? 0) * 0.5;
          return Number.isInteger(v) ? `${v}` : `${v.toFixed(1)}`;
        })()
      : null;

  const bathBar =
    property.full_baths != null
      ? (() => {
          const v = property.full_baths + (property.half_baths ?? 0) * 0.5;
          return Number.isInteger(v) ? String(v) : v.toString();
        })()
      : null;

  const derivedHighlights: Array<{ value: string; label: string }> = [];
  if (property.bedrooms != null)
    derivedHighlights.push({ value: String(property.bedrooms), label: "Bedrooms" });
  if (bathBar) derivedHighlights.push({ value: bathBar, label: "Bathrooms" });
  if (property.total_rooms != null)
    derivedHighlights.push({ value: String(property.total_rooms), label: "Total Rooms" });
  if (property.sqft != null)
    derivedHighlights.push({ value: property.sqft.toLocaleString(), label: "Sq Ft" });

  const highlightCells: Array<{ value: string; label: string }> =
    property.highlights && property.highlights.length > 0
      ? property.highlights
      : derivedHighlights;

  const locationLine = [property.location_neighborhood, property.location_city]
    .filter(Boolean)
    .join(" · ");

  const heroUrl = heroImage ? publicUrl(heroImage.storage_path) : null;
  const visionImage: GalleryImage | null = visionImageRow
    ? {
        src: publicUrl(visionImageRow.storage_path),
        alt: visionImageRow.alt_text ?? property.title,
      }
    : exteriorImages[0] ?? interiorImages[0] ?? null;
  const visionFloors = property.vision_floors ?? [];
  const visionHeadline =
    property.vision_headline ?? property.headline ?? property.title;
  const locationHeading =
    property.location_heading ?? property.location_highlight ?? "The Setting";

  const seoDescription =
    property.tagline ??
    property.headline ??
    property.description ??
    `${property.title} — Ocean City Development Group`;

  const listingJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: seoDescription,
    url: `https://oceancitydevelopment.com${location.pathname}`,
    ...(heroUrl ? { image: heroUrl } : {}),
    provider: {
      "@type": "Organization",
      "@id": "https://oceancitydevelopment.com/#organization",
      name: "Ocean City Development Group",
    },
    ...(property.location_city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: property.location_city,
            ...(property.location_state ? { addressRegion: property.location_state } : {}),
            addressCountry: "US",
          },
        }
      : {}),
    ...(property.bedrooms != null || property.full_baths != null || property.sqft != null
      ? {
          mainEntity: {
            "@type": "SingleFamilyResidence",
            name: property.title,
            ...(property.bedrooms != null ? { numberOfBedrooms: property.bedrooms } : {}),
            ...(property.full_baths != null
              ? {
                  numberOfBathroomsTotal:
                    property.full_baths + (property.half_baths ?? 0) * 0.5,
                }
              : {}),
            ...(property.sqft != null
              ? {
                  floorSize: {
                    "@type": "QuantitativeValue",
                    value: property.sqft,
                    unitCode: "FTK",
                  },
                }
              : {}),
          },
        }
      : {}),
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      <GlobalNav />

      {/* Hero */}
      <section className="relative h-[85vh] md:h-screen min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroUrl && (
            <>
              <link rel="preload" as="image" href={heroUrl} fetchPriority="high" />
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translateY(${scrollY * 0.15}px)` }}
              >
                <div
                  className="absolute -inset-[15%] animate-ken-burns"
                  style={{
                    backgroundImage: `url(${heroUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center 40%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="max-w-3xl animate-fade-in-up">
            {statusLabel && (
              <Link
                to="/developments"
                className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-[10px] font-medium tracking-[0.2em] uppercase text-on-dark/90 border border-on-dark/30 backdrop-blur-sm bg-on-dark/5 transition-all duration-300 hover:bg-on-dark/15 hover:border-on-dark/50"
                style={{ borderRadius: "4px" }}
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {statusLabel}
              </Link>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-normal text-on-dark mb-2 tracking-tight leading-tight">
              {property.title}
            </h1>
            {property.unit && (
              <p className="text-sm sm:text-base font-light tracking-[0.2em] uppercase text-on-dark/70 mb-3">
                {property.unit}
              </p>
            )}
            {property.headline && (
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-on-dark/90 mb-3">
                {property.headline}
              </p>
            )}
            {property.price && (
              <p className="text-lg sm:text-xl md:text-2xl font-light text-on-dark/80 tracking-wide mb-6">
                {property.price}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-on-dark/80">
              {property.bedrooms != null && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                  <span className="text-xs md:text-sm">{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {bathTotal && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                  <span className="text-xs md:text-sm">{bathTotal} Bathrooms</span>
                </div>
              )}
              {locationLine && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                  <span className="text-xs md:text-sm">{locationLine}</span>
                </div>
              )}
            </div>
            {property.tagline && (
              <p className="text-base md:text-lg lg:text-xl text-on-dark/80 font-light leading-relaxed mb-8 md:mb-10 max-w-2xl">
                {property.tagline}
              </p>
            )}
            <button
              onClick={() => document.getElementById("vision")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-on-dark btn-compact md:text-sm px-6 md:px-8 py-2.5 md:py-3"
            >
              View the Opportunity
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-12 md:h-16 bg-on-dark/30 relative">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-on-dark animate-pulse" />
          </div>
        </div>
      </section>

      {/* Highlights */}
      {highlightCells.length > 0 && (
        <section ref={highlightsRef} className="py-10 md:py-14 border-y border-border-subtle bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 transition-all duration-1000 ${
                highlightsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {highlightCells.map((item, i) => (
                <div key={i} className="text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                  <p className="text-2xl md:text-3xl font-serif text-charcoal mb-1">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-slate">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vision */}
      {(property.description || property.headline || visionImage || visionFloors.length > 0) && (
        <section id="vision" className="section-padding">
          <div ref={visionRef} className="container mx-auto px-6 lg:px-12">
            <div
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-1000 ${
                visionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="order-2 lg:order-1">
                <p className="label-uppercase mb-4">The Vision</p>
                <h2 className="heading-section text-charcoal mb-6">
                  {visionHeadline}
                </h2>
                <div className="divider mb-8" />
                {(property.bedrooms != null || bathTotal || property.total_rooms != null) && (
                  <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-sand border border-border-subtle">
                    <div className="text-center">
                      <p className="text-2xl font-serif text-charcoal">
                        {property.bedrooms ?? "—"}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-muted-slate">Bedrooms</p>
                    </div>
                    <div className="text-center border-x border-border-subtle">
                      <p className="text-2xl font-serif text-charcoal">{bathTotal ?? "—"}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-slate">Bathrooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-serif text-charcoal">
                        {property.total_rooms ?? "—"}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-muted-slate">Total Rooms</p>
                    </div>
                  </div>
                )}
                {visionFloors.length > 0 ? (
                  <div className="space-y-6">
                    {visionFloors.map((f, i) => (
                      <p key={i} className="text-body">
                        <strong className="text-charcoal">{f.label}:</strong> {f.body}
                      </p>
                    ))}
                  </div>
                ) : property.description ? (
                  <p className="text-body whitespace-pre-line">{property.description}</p>
                ) : null}
              </div>
              {visionImage && (
                <div className="order-1 lg:order-2">
                  <div className="relative">
                    <img
                      src={visionImage.src}
                      alt={visionImage.alt}
                      className="w-full aspect-[4/5] object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    {(property.vision_caption_eyebrow || property.vision_caption_title) && (
                      <div className="absolute -bottom-6 -left-6 w-40 h-24 border border-border bg-card flex items-center justify-center p-4">
                        <div className="text-center">
                          {property.vision_caption_eyebrow && (
                            <p className="text-xs uppercase tracking-wider text-muted-slate mb-1">
                              {property.vision_caption_eyebrow}
                            </p>
                          )}
                          {property.vision_caption_title && (
                            <p className="text-sm font-serif text-charcoal">
                              {property.vision_caption_title}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Specs */}
      {property.specs && property.specs.length > 0 && (
        <section id="specs" className="section-padding section-sand">
          <div ref={specsRef} className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div
              className={`text-center max-w-2xl mx-auto mb-12 md:mb-16 transition-all duration-1000 ${
                specsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <p className="label-uppercase mb-4">Technical Excellence</p>
              <h2 className="heading-section text-charcoal">The OCDG Standard</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {property.specs.map((spec, index) => {
                const Icon = getSpecIcon(spec.icon);
                return (
                  <div
                    key={index}
                    className={`bg-card p-6 md:p-8 border border-border-subtle hover:border-border hover:shadow-sm hover:-translate-y-0.5 transition-all duration-700 ${
                      specsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ borderRadius: "4px", transitionDelay: `${200 + index * 150}ms` }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-charcoal" strokeWidth={1} />
                    </div>
                    <h3 className="heading-card text-charcoal mb-3">{spec.title}</h3>
                    <p className="text-body text-sm leading-relaxed">{spec.description}</p>
                  </div>
                );
              })}
            </div>

            {property.luxury_features && property.luxury_features.length > 0 && (
              <div
                className={`mt-12 md:mt-16 max-w-4xl mx-auto transition-all duration-1000 delay-700 ${
                  specsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {property.luxury_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-charcoal rounded-full flex-shrink-0" />
                      <span className="text-body text-sm md:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {property.mls_url && (
              <div
                className={`mt-10 md:mt-14 flex justify-center transition-all duration-1000 delay-700 ${
                  specsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <a
                  href={property.mls_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-slate hover:text-charcoal transition-colors tracking-wider uppercase inline-flex items-center gap-1.5"
                >
                  Official Property Record: South Jersey MLS
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Floor Plans */}
      {floorPlans.length > 0 && currentFloor && (
        <section id="floor-plans" className="section-padding">
          <div ref={floorRef} className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div
              className={`text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-1000 ${
                floorVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <p className="label-uppercase mb-4">Floor Plans</p>
              <h2 className="heading-section text-charcoal">Explore Every Level</h2>
            </div>
            <div
              className={`flex flex-wrap justify-center gap-2 mb-8 md:mb-12 transition-all duration-1000 delay-200 ${
                floorVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {floorPlans.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloor(floor.id)}
                  className={`btn-toggle ${activeFloor === floor.id ? "is-active" : ""}`}

                >
                  {floor.name}
                </button>
              ))}
            </div>
            <div
              className={`grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8 items-start transition-all duration-1000 delay-300 ${
                floorVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div
                  className="bg-card p-3 md:p-4 border border-border min-h-[300px] sm:min-h-[400px] lg:min-h-0"
                  style={{ borderRadius: "4px" }}
                >
                  {floorPlanImageBy[currentFloor.id] ? (
                    <img
                      key={currentFloor.id}
                      src={floorPlanImageBy[currentFloor.id]}
                      alt={currentFloor.name}
                      className="w-full h-auto animate-fade-in"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center text-muted-slate text-xs uppercase tracking-wider">
                      Floor plan coming soon
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-background-sand p-6 md:p-8 order-2 lg:order-1" style={{ borderRadius: "4px" }}>
                <h3 className="heading-card mb-4 text-charcoal">{currentFloor.name}</h3>
                {currentFloor.description && (
                  <p className="text-body text-sm md:text-base leading-relaxed mb-6">
                    {currentFloor.description}
                  </p>
                )}
                <div className="divider mb-6" />
                {currentFloor.highlights && currentFloor.highlights.length > 0 && (
                  <>
                    <p className="label-uppercase mb-4">Key Features</p>
                    <ul className="space-y-3 mb-8">
                      {currentFloor.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-3 text-body text-sm md:text-base">
                          <span className="w-1.5 h-1.5 bg-charcoal rounded-full flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button
                  onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-outline btn-block"
                >
                  <Download className="w-4 h-4" />
                  Request Floor Plans PDF
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {(exteriorImages.length > 0 || interiorImages.length > 0) && (
        <section id="gallery" className="section-padding section-sand">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div
              ref={galleryRef}
              className={`text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-1000 ${
                galleryVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <p className="label-uppercase mb-4">Gallery</p>
              <h2 className="heading-section text-charcoal">Immersive Visualizations</h2>
            </div>

            {exteriorImages.length > 0 && (
              <div className="mb-12 md:mb-16">
                <p className="label-uppercase mb-6 text-center">Exterior Perspectives</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {exteriorImages.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer overflow-hidden group ${
                        index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
                      }`}
                      onClick={() => openLightbox(index)}
                      style={{ borderRadius: "4px" }}
                    >
                      <div className="relative h-full">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
                            index === 0 ? "aspect-[4/3]" : "aspect-square"
                          }`}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 border border-on-dark rounded-full flex items-center justify-center">
                            <span className="text-on-dark text-2xl">+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interiorImages.length > 0 && (
              <div>
                <p className="label-uppercase mb-6 text-center">Interior Design & Lifestyle</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {interiorImages.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer overflow-hidden group ${
                        index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
                      }`}
                      onClick={() => openLightbox(exteriorImages.length + index)}
                      style={{ borderRadius: "4px" }}
                    >
                      <div className="relative h-full">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
                            index === 0 ? "aspect-[4/3]" : "aspect-square"
                          }`}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 border border-on-dark rounded-full flex items-center justify-center">
                            <span className="text-on-dark text-2xl">+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {lightboxOpen && allGallery[lightboxIndex] && (
            <div className="lightbox-overlay" onClick={closeLightbox}>
              <button
                className="btn-icon-plain absolute top-6 right-6 text-on-dark/80 hover:text-on-dark z-10"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <X className="w-8 h-8" />
              </button>
              <button
                className="btn-icon-plain absolute left-6 top-1/2 -translate-y-1/2 text-on-dark/80 hover:text-on-dark z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                className="btn-icon-plain absolute right-6 top-1/2 -translate-y-1/2 text-on-dark/80 hover:text-on-dark z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
              <img
                src={allGallery[lightboxIndex].src}
                alt={allGallery[lightboxIndex].alt}
                className="max-w-[90vw] max-h-[85vh] object-contain"
                loading="lazy"
                decoding="async"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-on-dark/60 text-sm">
                {lightboxIndex + 1} / {allGallery.length}
              </div>
            </div>
          )}
        </section>
      )}

      {/* A Closer Look — real photographs of the finished home */}
      {photoImages.length > 0 && (
        <section id="closer-look" className="section-padding">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
              <p className="label-uppercase mb-4">Photography</p>
              <h2 className="heading-section text-charcoal">A Closer Look</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {photoImages.map((image, index) => (
                <div
                  key={index}
                  className={`overflow-hidden group ${
                    index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
                  }`}
                  style={{ borderRadius: "4px" }}
                >
                  <div className="relative h-full">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                        index === 0 ? "aspect-[4/3]" : "aspect-square"
                      }`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location features */}
      {((property.location_features && property.location_features.length > 0) ||
        property.map_embed_query) && (
        <section id="location" className="section-padding">
          <div ref={locationRef} className="container mx-auto px-6 lg:px-12 max-w-7xl">
            <div
              className={`grid ${property.map_embed_query ? "lg:grid-cols-2" : ""} gap-12 items-center transition-all duration-1000 ${
                locationVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {property.map_embed_query && (
                <div className="relative h-[400px] lg:h-[500px] bg-muted">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                      property.map_embed_query,
                    )}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale contrast-125"
                    title={`${property.title} location`}
                  />
                </div>
              )}
              <div>
              <p className="label-uppercase mb-4">The Location</p>
              <h2 className="heading-section text-charcoal mb-6">
                {locationHeading}
              </h2>
              <div className="divider mb-8" />
              {(property.location_city || property.location_state) && (
                <div className="flex items-start gap-4 mb-8">
                  <MapPin className="w-5 h-5 text-charcoal mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-lg font-serif text-charcoal">{property.title}</p>
                    <p className="text-body">
                      {[property.location_city, property.location_state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
              {property.location_features && property.location_features.length > 0 && (
              <ul className="space-y-4">
                {property.location_features.map((f, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 bg-charcoal rounded-full mt-2.5 flex-shrink-0" />
                    <span className="text-body">{f}</span>
                  </li>
                ))}
              </ul>
              )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Inquiry */}
      <section id="register" className="section-padding section-sand">
        <div ref={registerRef} className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div
            className={`max-w-xl mx-auto transition-all duration-1000 ${
              registerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-12">
              <p className="label-uppercase mb-4">Exclusive Opportunity</p>
              <h2 className="heading-section text-charcoal mb-4">Request Exclusive Information</h2>
              <p className="text-body">
                Register your interest to receive priority access to architectural plans, pricing
                details, and exclusive updates for {property.title}.
              </p>
            </div>

            <div className="bg-card border border-border-subtle p-6 mb-8" style={{ borderRadius: "4px" }}>
              <p className="text-xs uppercase tracking-wider text-muted-slate mb-4 text-center">
                Direct Contact
              </p>
              <div className="text-center mb-4">
                <p className="font-serif text-lg text-charcoal">{CONTACT.name}</p>
                <p className="text-sm text-muted-slate">{CONTACT.company}</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href={`tel:${CONTACT.phone.replace(/[^0-9]/g, "")}`}
                  className="flex items-center justify-center gap-2 text-sm text-charcoal hover:text-muted-slate transition-colors"
                >
                  <Phone className="w-4 h-4" strokeWidth={1.5} />
                  {CONTACT.phone}
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center justify-center gap-2 text-sm text-charcoal hover:text-muted-slate transition-colors"
                >
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  {CONTACT.email}
                </a>
              </div>
            </div>

            <PropertyInquiryForm property={property} />
          </div>
        </div>
      </section>

      <PropertyNeighborsNav slug={property.slug} status={property.status} />

      <GlobalFooter />
    </main>
  );
};

// ── Prev / Back / Next nav ─────────────────────────────────────

const PropertyNeighborsNav = ({ slug, status }: { slug: string; status: string | null }) => {
  const validStatus = status && isPropertyStatus(status) ? status : undefined;
  const { prev, next } = usePropertyNeighbors(slug, validStatus);

  if (!prev && !next) {
    return (
      <nav className="border-t border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl flex justify-center">
          <Link
            to="/developments"
            className="text-xs tracking-[0.15em] uppercase text-muted-slate hover:text-charcoal transition-colors"
          >
            ← Back to Developments
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-t border-border py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl flex items-center justify-between gap-4">
        {prev ? (
          <Link
            to={`/developments/${prev.slug}`}
            className="text-xs tracking-[0.15em] uppercase text-muted-slate hover:text-charcoal transition-colors"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <Link
          to="/developments"
          className="text-xs tracking-[0.15em] uppercase text-muted-slate hover:text-charcoal transition-colors"
        >
          ← Back to Developments
        </Link>
        {next ? (
          <Link
            to={`/developments/${next.slug}`}
            className="text-xs tracking-[0.15em] uppercase text-muted-slate hover:text-charcoal transition-colors"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
};

// ── Inquiry form ────────────────────────────────────────────────

const PropertyInquiryForm = ({ property }: { property: PropertyRow }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
  });
  const [hp, setHp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhone(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.replace(/\D/g, "").length !== 10) {
      toast.error("Please enter a valid US phone number — (555) 000-0000");
      return;
    }
    setSubmitting(true);
    try {
      // Honeypot tripped — fail safe: show success to the user, skip DB write.
      if (hp) {
        toast.success(`Thank you. Patrick will be in touch regarding ${property.title} shortly.`);
        setForm({ name: "", email: "", phone: "", interest: "" });
        setHp("");
        return;
      }
      const id = crypto.randomUUID();
      const source = property.title;
      const { error: insertError } = await supabase.from("leads").insert({
        id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest: form.interest || null,
        message: null,
        source,
        user_agent: navigator.userAgent,
      });
      if (insertError) {
        console.error("Lead insert failed:", insertError);
        toast.error(
          "Something went wrong. Please call (609) 602-3917 or email PatrickAHalliday@gmail.com."
        );
        return;
      }

      // Lead is saved. Email notification is best-effort — don't fail the UX
      // if the invoke errors; the inquiry is already captured in the DB.
      const { error: emailError } = await supabase.functions.invoke("send-inquiry-notification", {
        body: {
          leadId: id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          interest: form.interest,
          message: "",
          source,
        },
      });
      if (emailError) {
        console.error("Inquiry email notification failed (lead was saved):", emailError);
      }

      toast.success(`Thank you. Patrick will be in touch regarding ${property.title} shortly.`);
      setForm({ name: "", email: "", phone: "", interest: "" });
    } catch (err) {
      console.error(err);
      toast.error(
        "Something went wrong. Please call (609) 602-3917 or email PatrickAHalliday@gmail.com."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="lv_hp_field"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="new-password"
        aria-hidden="true"
        aria-label="Leave this field empty"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />
      <div>
        <label htmlFor="name" className="block text-xs uppercase tracking-wider text-muted-slate mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={100}
          className="input-elegant"
          placeholder="John Smith"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-slate mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          maxLength={255}
          className="input-elegant"
          placeholder="john@example.com"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-xs uppercase tracking-wider text-muted-slate mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="input-elegant"
          placeholder="(555) 000-0000"
        />
      </div>
      <div>
        <label
          htmlFor="interest"
          className="block text-xs uppercase tracking-wider text-muted-slate mb-2"
        >
          Interest Level
        </label>
        <select
          id="interest"
          name="interest"
          value={form.interest}
          onChange={handleChange}
          required
          className="input-elegant appearance-none cursor-pointer"
        >
          <option value="">Select your interest...</option>
          {INTEREST_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary btn-block"
      >
        {submitting ? "Submitting..." : "Request Private Brochure"}
      </button>
      <p className="text-xs text-center text-muted-slate">
        Your information is kept strictly confidential and will never be shared.
      </p>
    </form>
  );
};

export default PropertyPage;