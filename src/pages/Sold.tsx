import { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import subpageHero from "@/assets/subpage-hero.jpg";

const soldProjects = [
  {
    title: "Gardens Home",
    subtitle: "Year-Round Luxury",
    location: "Ocean City, NJ",
  },
  {
    title: "Beach Front Retreat",
    subtitle: "High-End Duplex",
    location: "Ocean City, NJ",
  },
  {
    title: "North End Single Family Home",
    subtitle: "Custom Residence",
    location: "Ocean City, NJ",
  },
];

const Sold = () => {
  const [scrollY, setScrollY] = useState(0);
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
          src={subpageHero}
          alt="Ocean City Development Group — Sold Projects"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-on-dark/70 mb-4">Our Legacy</p>
          <h1 className="heading-display text-on-dark">Sold Projects</h1>
        </div>
      </section>

      {/* Grid */}
      <section id="contact" className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {soldProjects.map((project) => (
              <div key={project.title} className="card-elegant overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden bg-accent">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-border flex items-center justify-center">
                        <svg className="w-5 h-5 text-muted-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                      <p className="text-small">Photo Coming Soon</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-on-dark bg-charcoal backdrop-blur-sm" style={{ borderRadius: "4px" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-on-dark/80" />
                      Sold
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-small mb-1">{project.location}</p>
                  <h3 className="heading-card text-charcoal mb-1">{project.title}</h3>
                  <p className="text-body text-sm">{project.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default Sold;
