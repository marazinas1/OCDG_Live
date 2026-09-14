import { useState, useEffect, useCallback } from "react";
import { useLocation } from "@/lib/router-compat";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import { useTestimonials, quoteParagraphs } from "@/hooks/useTestimonials";
import subpageHero from "@/assets/subpage-hero.jpg";


const Testimonials = () => {
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();
  const { data: testimonials = [], isLoading } = useTestimonials();


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Embla carousel with loop and peek
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Handle hash anchor — scroll to specific testimonial slide
  useEffect(() => {
    if (!emblaApi || !location.hash) return;
    const target = location.hash.replace("#", "");
    const idx = testimonials.findIndex((t) => t.anchor === target);
    if (idx >= 0) {
      setTimeout(() => emblaApi.scrollTo(idx), 300);
    }
  }, [emblaApi, location.hash, testimonials]);

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            "@id": "https://oceancitydevelopment.com/#organization",
            name: "Ocean City Development Group",
            url: "https://oceancitydevelopment.com/testimonials",
            review: testimonials.map((t) => ({
              "@type": "Review",
              author: { "@type": "Person", name: t.author_name },
              reviewBody: t.quote,
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={subpageHero}
          alt="Ocean City Development Group — Testimonials"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-4">What Our Clients Say</p>
          <h1 className="heading-display text-white">Testimonials</h1>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="section-padding overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          {testimonials.length === 0 ? (
            <p className="text-center text-body">
              {isLoading ? "Loading testimonials…" : "Testimonials are coming soon."}
            </p>
          ) : (
          <div className="relative">
            {/* Navigation arrows */}
            <button
              onClick={scrollPrev}
              aria-label="Previous testimonial"
              className="btn-icon absolute -left-2 lg:left-0 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next testimonial"
              className="btn-icon absolute -right-2 lg:right-0 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>


            {/* Carousel */}
            <div ref={emblaRef} className="overflow-hidden mx-8 lg:mx-14">
              <div className="flex">
                {testimonials.map((t, i) => (
                  <div
                    key={t.id}
                    id={t.anchor ?? undefined}
                    className="flex-shrink-0 px-4"
                    style={{ flex: "0 0 100%", minWidth: 0 }}
                  >
                    <div className="card-elegant p-8 md:p-12 transition-all duration-500">
                      <svg className="w-8 h-8 mb-6 text-muted-slate opacity-30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.3 2.5c-1.4.7-2.5 1.6-3.4 2.7C6.9 6.3 6.3 7.5 5.9 8.9c-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2zm10 0c-1.4.7-2.5 1.6-3.4 2.7-1 1.1-1.6 2.3-2 3.7-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2z" />
                      </svg>
                      <div className="space-y-4 mb-8 pr-2">
                        {quoteParagraphs(t.quote).map((p, j) => (
                          <p key={j} className="text-body text-base leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>
                      <div className="divider mb-4" />
                      <p className="text-sm font-medium text-charcoal">
                        {t.author_detail || t.author_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`btn-dot ${i === selectedIndex ? "is-active" : ""}`}
                />

              ))}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="section-padding section-sand">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl text-center">
          <p className="label-uppercase mb-4">Ready to Build?</p>
          <h2 className="heading-section text-charcoal mb-6">Start Your Journey</h2>
          <div className="divider mx-auto mb-8" />
          <p className="text-body text-lg leading-relaxed mb-8">
            Contact us today to discuss your dream home in Ocean City.
          </p>
          <a href="/contact" className="btn-primary">
            Get In Touch
          </a>
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default Testimonials;
