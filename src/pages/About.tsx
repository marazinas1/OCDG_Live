import { useState, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";

const routeApi = getRouteApi("/about");

/**
 * Tags outbound partner links so the partner sites can see traffic coming from
 * oceancitydevelopment.com. Existing query params and hashes are preserved.
 */
function withPartnerUtm(url: string): string {
  try {
    const target = new URL(url, "https://oceancitydevelopment.com");
    if (!target.searchParams.has("utm_source")) {
      target.searchParams.set("utm_source", "oceancitydevelopment.com");
      target.searchParams.set("utm_medium", "referral");
      target.searchParams.set("utm_campaign", "partner-network");
    }
    return target.toString();
  } catch {
    return url;
  }
}

const About = () => {
  const [scrollY, setScrollY] = useState(0);
  const about = routeApi.useLoaderData();
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={about.heroImageUrl}
          alt={about.heroTitle}
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-4">{about.heroEyebrow}</p>
          <h1 className="heading-display text-white">{about.heroTitle}</h1>
        </div>
      </section>

      {/* Our Story — Staggered Layout */}
      <section className="section-padding section-sand">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div>
              <p className="label-uppercase mb-4">{about.storyLabel}</p>
              <h2 className="heading-section text-charcoal mb-6">{about.storyHeading}</h2>
              <div className="divider mb-8" />
              <p className="text-body text-lg leading-relaxed mb-6 whitespace-pre-line">
                {about.storyParagraph1}
              </p>
              <p className="text-body text-lg leading-relaxed mb-8 whitespace-pre-line">
                {about.storyParagraph2}
              </p>
              {/* Signature-style element */}
              <div className="border-l-2 border-charcoal/20 pl-6 mt-8">
                <p className="font-serif italic text-charcoal/70 text-lg mb-2">
                  {about.storyQuote}
                </p>
                <div className="w-24 h-px bg-charcoal/30 mb-2" />
                <p className="text-xs uppercase tracking-widest text-muted-slate">
                  {about.storyQuoteAttribution}
                </p>
              </div>
            </div>
            {/* Image */}
            <div className="relative overflow-hidden" style={{ borderRadius: "4px" }}>
              <img
                src={about.storyImageUrl}
                alt={`${about.siteName} — Craftsmanship`}
                className="w-full object-cover object-center aspect-[3/4] lg:max-h-[550px] lg:aspect-auto lg:h-[60vh] lg:min-h-[400px]" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise — Zig-Zag: Image Left, Text Right */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="flex flex-col items-center">
              <div className="w-60 mx-auto">
                <img
                  src={about.portraitImageUrl}
                  alt={`${about.leaderName} — ${about.leaderRole}`}
                  className="w-full h-auto" loading="lazy" decoding="async" />
              </div>
              <p className="mt-5 text-sm tracking-wide text-charcoal font-medium">{about.leaderName}</p>
              <p className="text-xs uppercase tracking-widest text-muted-slate">{about.leaderRole}</p>
            </div>
            {/* Text */}
            <div>
              <p className="label-uppercase mb-4">{about.promiseLabel}</p>
              <h2 className="heading-section text-charcoal mb-6">{about.promiseHeading}</h2>
              <div className="divider mb-8" />
              <p className="text-body text-lg leading-relaxed whitespace-pre-line">
                {about.promiseParagraph}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section Divider ─── */}
      <div className="w-full h-px bg-border" />

      {/* Our Partners */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl text-center">
          <p className="label-uppercase mb-4">{about.partnersLabel}</p>
          <h2 className="heading-section text-charcoal mb-6">{about.partnersHeading}</h2>
          <div className="divider mx-auto mb-12" />

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 text-left">
            {about.partners.map((partner) => {
              const card = (
                <>
                  {partner.logoUrl && (
                    <div className="h-20 flex items-center justify-center mb-6">
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <h3 className="font-serif text-2xl text-charcoal mb-4 group-hover:underline decoration-1 underline-offset-4">
                    {partner.name}
                  </h3>
                  <p className="text-body leading-relaxed whitespace-pre-line">{partner.description}</p>
                </>
              );

              return partner.url ? (
                <a
                  key={partner.id}
                  href={withPartnerUtm(partner.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  {card}
                </a>
              ) : (
                <div key={partner.id} className="flex flex-col items-center text-center group">
                  {card}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default About;
