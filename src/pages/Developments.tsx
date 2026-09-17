import { Link, useSearchParams } from "@/lib/router-compat";
import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import PropertyCarousel from "@/components/PropertyCarousel";
import PublicPropertyCard from "@/components/PublicPropertyCard";
import subpageHero from "@/assets/subpage-hero.jpg";
import {
  usePublicProperties,
  type PublicPropertyCard as PublicPropertyCardData,
} from "@/hooks/usePublicProperties";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, type PropertyStatus } from "@/lib/admin/status";
import {
  DEFAULT_DEVELOPMENTS_CONTENT,
  type DevelopmentsPageContent,
} from "@/lib/content/pages";

type DevStatus = "active" | "under-contract" | "sold";
type DevGroup = "current" | "sold";

const tabs: { label: string; value: DevGroup | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Current Developments", value: "current" },
  { label: "Sold", value: "sold" },
];

const seeAllLinks: Record<DevGroup, { label: string; href: string }> = {
  current: { label: "See All Current Developments", href: "/developments/current" },
  sold: { label: "See All Sold", href: "/developments/sold" },
};

const PAGE_SIZE = 9;

const CardSkeleton = () => (
  <div className="card-elegant overflow-hidden h-full flex flex-col">
    <div className="relative aspect-[4/3] bg-muted animate-pulse" />
    <div className="p-6 flex flex-col gap-3">
      <div className="h-3 w-1/3 bg-muted animate-pulse rounded-lg" />
      <div className="h-5 w-2/3 bg-muted animate-pulse rounded-lg" />
      <div className="h-3 w-1/2 bg-muted animate-pulse rounded-lg" />
      <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
    </div>
  </div>
);

const Developments = ({
  properties,
  content = DEFAULT_DEVELOPMENTS_CONTENT,
}: {
  /** Server-rendered rows from the route loader; hydrates the query cache. */
  properties?: PublicPropertyCardData[] | undefined;
  /** Editable hero copy from Settings; falls back to the wording in code. */
  content?: DevelopmentsPageContent;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const normalizeFilter = (v: string | null) =>
    v === "active" || v === "under-contract" || v === "current" ? "current" : v === "sold" ? "sold" : "all";
  const filterParam = normalizeFilter(searchParams.get("filter"));
  const [activeTab, setActiveTab] = useState<string>(filterParam);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setActiveTab(normalizeFilter(searchParams.get("filter")));
    setVisibleCount(PAGE_SIZE);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setVisibleCount(PAGE_SIZE);
    if (value === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ filter: value });
    }
  };

  const { data: allProps = [], isLoading } = usePublicProperties(
    properties ? { initialData: properties } : undefined,
  );

  type Dev = {
    slug: string;
    title: string;
    status: DevStatus;
    image: string;
    location: string;
    price?: string | undefined;
    description: string;
  };

  const toDevStatus = (s: PropertyStatus): DevStatus | null =>
    s === "active" ? "active" : s === "under_contract" ? "under-contract" : s === "sold" ? "sold" : null;

  const allDevelopments: Dev[] = allProps
    .map((p): Dev | null => {
      const ds = toDevStatus(p.status);
      if (!ds) return null;
      return {
        slug: p.slug,
        title: p.title,
        status: ds,
        image: p.card_image_url ?? "",
        location: p.location,
        price: p.price ?? undefined,
        description: p.tagline ?? p.description ?? "",
      };
    })
    .filter((d): d is Dev => d !== null);

  // For "all" view, group by status and show max 3 per category
  const isAllView = activeTab === "all";

  const renderCategorySection = (group: DevGroup, items: Dev[]) => {
    const info = seeAllLinks[group];
    const categoryLabels: Record<DevGroup, string> = {
      current: "Current Developments",
      sold: "Sold",
    };

    const toPropStatus = (s: DevStatus): PropertyStatus =>
      s === "active" ? "active" : s === "under-contract" ? "under_contract" : "sold";

    return (
      <div key={group} className="mb-16 last:mb-0">
        <h2 className="heading-section text-charcoal text-xl mb-8">{categoryLabels[group]}</h2>
        <PropertyCarousel
          items={items.map((dev) => ({
            title: dev.title,
            image: dev.image,
            link: `/developments/${dev.slug}`,
            location: dev.location,
            description: dev.description,
            price: dev.price,
            badgeLabel: STATUS_LABELS[toPropStatus(dev.status)],
            badgeColor: STATUS_BADGE_CLASSES[toPropStatus(dev.status)],
          }))}
        />
        {items.length > 0 && (
          <div className="text-center mt-8">
            <Link to={info.href} className="btn-outline btn-compact">
              {info.label}
            </Link>
          </div>
        )}
      </div>
    );
  };

  const soldDevs = allDevelopments.filter((d) => d.status === "sold");
  const currentDevs = allDevelopments.filter(
    (d) => d.status === "active" || d.status === "under-contract",
  );

  // Raw DB rows for the grid view (PublicPropertyCard consumes these directly)
  const filteredCards = allProps.filter((p) =>
    activeTab === "sold"
      ? p.status === "sold"
      : p.status === "active" || p.status === "under_contract",
  );
  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCards.length;

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={subpageHero}
          alt="Ocean City Development Group — Developments"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-4">Our Portfolio</p>
          <h1 className="heading-display text-white">Developments</h1>
        </div>
      </section>

      {/* Filter Tabs + Grid */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`btn-toggle ${activeTab === tab.value ? "is-active" : ""}`}
              >

                {tab.label}
              </button>
            ))}
          </div>

          {isAllView ? (
            <>
              {currentDevs.length > 0 && renderCategorySection("current", currentDevs)}
              {soldDevs.length > 0 && renderCategorySection("sold", soldDevs)}
            </>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-lg">No developments in this category yet.</p>
              <p className="text-small mt-2">Check back soon for updates.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleCards.map((card, i) => (
                  <PublicPropertyCard key={card.id} card={card} eager={i < 3} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="btn-outline btn-compact"
                  >
                    See More
                  </button>

                </div>
              )}
            </>
          )}
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default Developments;
