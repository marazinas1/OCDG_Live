import { useEffect, useState } from "react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import PublicPropertyCard from "@/components/PublicPropertyCard";
import subpageHero from "@/assets/subpage-hero.jpg";
import {
  usePublicProperties,
  type PublicPropertyCard as PublicPropertyCardData,
} from "@/hooks/usePublicProperties";
import type { PropertyStatus } from "@/lib/admin/status";

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

/**
 * Shared layout for /developments category pages. Consumes DB-backed properties
 * filtered by a single status. Paginator + parallax hero are identical to the
 * previous per-page implementations.
 */
const CategoryPage = ({
  status,
  eyebrow,
  heading,
  seoTitle,
  seoDescription,
  path,
  emptyMessage,
  properties,
  children,
}: {
  status: PropertyStatus | PropertyStatus[];
  eyebrow: string;
  heading: string;
  seoTitle: string;
  seoDescription: string;
  path: string;
  emptyMessage: string;
  /** Server-rendered rows from the route loader; hydrates the query cache. */
  properties?: PublicPropertyCardData[];
  children?: React.ReactNode;
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data, isLoading } = usePublicProperties({ status });
  const list = data ?? [];
  const visible = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={subpageHero}
          alt={heading}
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-4">{eyebrow}</p>
          <h1 className="heading-display text-white">{heading}</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-lg">{emptyMessage}</p>
              <p className="text-small mt-2">Check back soon for updates.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visible.map((card, i) => (
                  <PublicPropertyCard key={card.id} card={card} eager={i < 3} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center justify-center px-8 py-3 text-xs font-medium tracking-[0.15em] uppercase border border-charcoal text-charcoal transition-all duration-300 hover:bg-charcoal hover:text-white"
                    style={{ borderRadius: "4px" }}
                  >
                    See More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {children}

      <GlobalFooter />
    </main>
  );
};

export default CategoryPage;