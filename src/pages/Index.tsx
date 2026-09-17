import { getRouteApi } from "@tanstack/react-router";
import { useGlobalBranding } from "@/hooks/useGlobalBranding";
import { Link } from "@/lib/router-compat";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import PropertyCarousel from "@/components/PropertyCarousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicProperties } from "@/hooks/usePublicProperties";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/lib/admin/status";
import approachImage from "@/assets/28th-approach-v4.jpg";
import type { HomeAdvantage } from "@/lib/content/home";

/** Anchors stay in code; the author and quote come from Settings → Home texts. */
const snippetAnchors = ["#melfi", "#oneill", "#lavoice"];

type SnippetCard = { author: string; snippet: string; anchor: string };

/* Intersection Observer hook for scroll-triggered fade-in */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const RevealSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
};

/** Icons stay in code; the titles and descriptions come from Settings. */
const advantageIcons = [
  (
    <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
    </svg>
  ),
  (
    <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  (
    <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  ),
];

/* Mobile horizontal carousel for cards */
const MobileCarousel = ({ children, itemCount }: { children: React.ReactNode[]; itemCount: number }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", dragFree: false });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap() % itemCount);
  }, [emblaApi, itemCount]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {children.map((child, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4">
              {child}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: itemCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1} of ${itemCount}`}
            aria-current={i === selected}
            className={`btn-dot ${i === selected ? "is-active" : ""}`}
          />

        ))}
      </div>
    </div>
  );
};

const AdvantageCards = ({ items }: { items: HomeAdvantage[] }) => {
  const isMobile = useIsMobile();

  const cards = items.map((item, i) => (
    <div key={item.title} className="text-center p-8">
      <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">{advantageIcons[i]}</div>
      <h3 className="heading-card text-charcoal mb-4">{item.title}</h3>
      <div className="w-8 h-px bg-charcoal/30 mx-auto mb-4" />
      <p className="text-body leading-relaxed">{item.description}</p>
    </div>
  ));

  if (isMobile) {
    return (
      <RevealSection>
        <MobileCarousel itemCount={items.length}>{cards}</MobileCarousel>
      </RevealSection>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-8">
      {items.map((item, i) => (
        <RevealSection key={item.title} className={`delay-${i * 100}`}>
          <div className="text-center p-8">
            <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">{advantageIcons[i]}</div>
            <h3 className="heading-card text-charcoal mb-4">{item.title}</h3>
            <div className="w-8 h-px bg-charcoal/30 mx-auto mb-4" />
            <p className="text-body leading-relaxed">{item.description}</p>
          </div>
        </RevealSection>
      ))}
    </div>
  );
};
const TestimonialCard = ({ t }: { t: SnippetCard }) => (
  <div className="card-elegant p-8 h-full flex flex-col">
    <svg className="w-6 h-6 mb-4 text-charcoal/20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.3 2.5c-1.4.7-2.5 1.6-3.4 2.7C6.9 6.3 6.3 7.5 5.9 8.9c-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2zm10 0c-1.4.7-2.5 1.6-3.4 2.7-1 1.1-1.6 2.3-2 3.7-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2z" />
    </svg>
    <p className="text-body text-sm leading-relaxed italic flex-grow mb-6">"{t.snippet}"</p>
    <div className="w-8 h-px bg-charcoal/20 mb-3" />
    <p className="text-xs font-medium text-charcoal uppercase tracking-wider mb-4">{t.author}</p>
    <a
      href={`/testimonials${t.anchor}`}
      className="text-xs font-medium uppercase tracking-wider text-charcoal/60 hover:text-charcoal transition-colors inline-flex items-center gap-1"
    >
      Read Full Testimonial
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    </a>
  </div>
);

const TestimonialCards = ({ items }: { items: SnippetCard[] }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <RevealSection>
        <MobileCarousel itemCount={items.length}>
          {items.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </MobileCarousel>
      </RevealSection>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-8">
      {items.map((t, i) => (
        <RevealSection key={t.author} className={`delay-${i * 100}`}>
          <TestimonialCard t={t} />
        </RevealSection>
      ))}
    </div>
  );
};

const homeRoute = getRouteApi("/");

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const { hero, advantages, snippets } = homeRoute.useLoaderData();
  const snippetCards: SnippetCard[] = snippets.map((s, i) => ({
    ...s,
    anchor: snippetAnchors[i] ?? "",
  }));
  const { siteName } = useGlobalBranding();


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Featured carousel = active + under_contract, active group first, newest-first within each.
  const { data: featuredProps = [] } = usePublicProperties({ status: ["active", "under_contract"] });
  const featuredItems = [...featuredProps]
    .sort((a, b) => {
      const order = (s: string) => (s === "active" ? 0 : s === "under_contract" ? 1 : 2);
      const g = order(a.status) - order(b.status);
      if (g !== 0) return g;
      const ta = a.listed_date ? Date.parse(a.listed_date) : -Infinity;
      const tb = b.listed_date ? Date.parse(b.listed_date) : -Infinity;
      return tb - ta;
    })
    .map((p) => ({
      title: p.title,
      image: p.card_image_url ?? "",
      link: `/developments/${p.slug}`,
      location: p.location,
      description: p.tagline ?? p.description ?? "",
      price: p.price ?? undefined,
      badgeLabel: STATUS_LABELS[p.status],
      badgeColor: STATUS_BADGE_CLASSES[p.status],
    }));

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      {/* ─── Hero ─── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={hero.imageUrl}
          alt={`${siteName} — Premier Developments`}
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          fetchPriority="high"
          decoding="async"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <p className="label-uppercase text-on-dark/70 mb-6">{hero.eyebrow}</p>
          <h1 className="heading-display text-on-dark mb-6 whitespace-pre-line">{hero.headline}</h1>
          <div className="w-16 h-px bg-on-dark/40 mx-auto mb-6" />
          <p className="text-lg md:text-xl text-on-dark/80 font-light max-w-2xl mx-auto leading-relaxed">
            {hero.subline}
          </p>
          <button
            onClick={() => document.getElementById("developments")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-on-dark btn-compact mt-10"
          >
            {hero.ctaLabel}
          </button>

        </div>
      </section>

      {/* ─── Section Divider ─── */}
      <div className="w-full h-px bg-border" />

      {/* ─── Featured Portfolio ─── */}
      <section id="developments" className="section-padding section-sand">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <RevealSection>
            <div className="text-center mb-16">
              <p className="label-uppercase mb-4">Portfolio</p>
              <h2 className="heading-section text-charcoal mb-6">Current Developments</h2>
              <div className="divider mx-auto" />
            </div>
          </RevealSection>

          <RevealSection>
            <PropertyCarousel
              items={featuredItems}
            />
          </RevealSection>

          <RevealSection>
            <div className="text-center mt-12">
              <Link to="/developments/current" className="btn-outline btn-compact">
                View All Current Projects
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── Section Divider ─── */}
      <div className="w-full h-px bg-border" />

      {/* ─── Patrick's Quote with Architectural Crop Marks ─── */}
      <section className="section-padding bg-charcoal">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl text-center">
          <RevealSection>
            <div className="relative inline-block px-8 py-6">
              {/* L-shaped crop marks */}
              <div className="absolute top-0 left-0 w-6 h-px bg-rule" />
              <div className="absolute top-0 left-0 w-px h-6 bg-rule" />
              <div className="absolute top-0 right-0 w-6 h-px bg-rule" />
              <div className="absolute top-0 right-0 w-px h-6 bg-rule" />
              <div className="absolute bottom-0 left-0 w-6 h-px bg-rule" />
              <div className="absolute bottom-0 left-0 w-px h-6 bg-rule" />
              <div className="absolute bottom-0 right-0 w-6 h-px bg-rule" />
              <div className="absolute bottom-0 right-0 w-px h-6 bg-rule" />

              <svg className="w-10 h-10 mx-auto mb-8 text-on-dark/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.3 2.5c-1.4.7-2.5 1.6-3.4 2.7C6.9 6.3 6.3 7.5 5.9 8.9c-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2zm10 0c-1.4.7-2.5 1.6-3.4 2.7-1 1.1-1.6 2.3-2 3.7-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2z" />
              </svg>
              <p className="text-xl md:text-2xl lg:text-3xl font-serif font-light text-on-dark leading-relaxed italic mb-8">
                {hero.quote}
              </p>
              <div className="w-12 h-px bg-on-dark/30 mx-auto mb-4" />
              <p className="text-sm uppercase tracking-widest text-on-dark/50">{hero.quoteAttribution}</p>

            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── Section Divider ─── */}
      <div className="w-full h-px bg-border" />

      {/* ─── The OCDG Advantage ─── */}
      <section className="section-padding section-sand">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="label-uppercase mb-4">Why Choose Us</p>
              <h2 className="heading-section text-charcoal mb-6">The OCDG Advantage</h2>
              <div className="divider mx-auto" />
            </div>
          </RevealSection>
          <AdvantageCards items={advantages} />
          <RevealSection>
            <div className="text-center mt-10">
              <Link to="/about" className="btn-primary btn-compact">
                Learn More About Us
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── Section Divider ─── */}
      <div className="w-full h-px bg-border" />

      {/* ─── Our Approach ─── */}
      <section className="section-padding bg-background-mist">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Visual */}
            <RevealSection>
              <div className="relative overflow-hidden" style={{ borderRadius: "4px" }}>
                <img
                  src={approachImage}
                  alt="201 28th Street — Architectural detail"
                  className="w-full object-cover object-center aspect-[3/4] lg:max-h-[550px] lg:aspect-auto lg:h-[60vh] lg:min-h-[400px]" loading="lazy" decoding="async" />
              </div>
            </RevealSection>
            {/* Right — Content */}
            <RevealSection>
              <div className="text-center md:text-left">
                <p className="label-uppercase mb-4">How We Work</p>
                <h2 className="heading-section text-charcoal mb-4">Our Approach</h2>
                <div className="divider mx-auto md:mx-0 mb-6" />
                <p className="text-lg font-serif text-charcoal/80 italic mb-6">
                  Crafting Coastal Legacies with Precision.
                </p>
                <p className="text-body text-base leading-relaxed mb-8">
                  From site selection to the final architectural flourish, we manage every detail of the development lifecycle to ensure uncompromising quality. Our integrated process — pairing visionary architecture with meticulous construction — means every home we deliver is a testament to craft, durability, and timeless coastal elegance.
                </p>
                <Link
                  to="/about"
                  className="btn-primary btn-compact"
                >
                  Learn More About Us
                </Link>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ─── Section Divider ─── */}
      <div className="w-full h-px bg-border" />

      {/* ─── Testimonials Snippets ─── */}
      <section className="section-padding section-sand">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="label-uppercase mb-4">Social Proof</p>
              <h2 className="heading-section text-charcoal mb-6">What Our Clients Say</h2>
              <div className="divider mx-auto" />
            </div>
          </RevealSection>
          <TestimonialCards items={snippetCards} />
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default Index;
