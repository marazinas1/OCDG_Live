import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import BrandLogo from "@/components/BrandLogo";

const GlobalNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDevDropdownOpen, setIsDevDropdownOpen] = useState(false);
  const [isMobileDevOpen, setIsMobileDevOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDevDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const developmentCategories = [
    { label: "Current Developments", href: "/developments/current" },
    { label: "Sold", href: "/developments/sold" },
  ];

  const handleInquire = () => {
    setIsMobileMenuOpen(false);
    window.location.href = "/contact";
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const linkClass = `text-xs tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
    isScrolled ? "text-slate hover:text-charcoal" : "text-white hover:text-white/80"
  }`;
  const textShadow = !isScrolled ? "0 1px 3px rgba(0,0,0,0.4)" : "none";

  return (
    <>
      {!isScrolled && (
        <div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none bg-gradient-to-b from-black/50 via-black/25 to-transparent" />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-nav shadow-sm" : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" onClick={handleLogoClick} className="flex items-center flex-shrink-0">
              <BrandLogo
                variant={isScrolled ? "light" : "dark"}
                className={`h-7 sm:h-8 md:h-10 w-auto max-h-[50px] object-contain transition-all duration-300 ${
                  !isScrolled ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : ""
                }`}
              />
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className={linkClass} style={{ textShadow }}>
                Home
              </Link>

              {/* Developments Dropdown */}
              <div ref={dropdownRef} className="relative">
                <div className="flex items-center gap-1">
                  <Link
                    to="/developments"
                    onClick={() => setIsDevDropdownOpen(false)}
                    className={linkClass}
                    style={{ textShadow }}
                  >
                    Developments
                  </Link>
                  <button
                    onClick={() => setIsDevDropdownOpen(!isDevDropdownOpen)}
                    aria-label="Toggle developments submenu"
                    aria-expanded={isDevDropdownOpen}
                    className={linkClass}
                    style={{ textShadow }}
                  >
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${isDevDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {isDevDropdownOpen && (
                  <div
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-52 bg-white border border-border shadow-lg z-50 animate-fade-in"
                    style={{ borderRadius: "4px" }}
                  >
                    <div className="p-3 space-y-0.5">
                      {developmentCategories.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsDevDropdownOpen(false)}
                          className="block text-sm text-slate hover:text-charcoal hover:bg-accent/50 px-3 py-2 transition-colors"
                          style={{ borderRadius: "4px" }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/gallery" className={linkClass} style={{ textShadow }}>
                Gallery
              </Link>
              <Link to="/testimonials" className={linkClass} style={{ textShadow }}>
                Testimonials
              </Link>
              <Link to="/about" className={linkClass} style={{ textShadow }}>
                About Us
              </Link>
              <Link to="/contact" className={linkClass} style={{ textShadow }}>
                Contact
              </Link>

              <button
                onClick={handleInquire}
                className={`btn-nav ${isScrolled ? "btn-primary" : "btn-on-dark"}`}
              >
                Inquire Now
              </button>

            </div>

            {/* Mobile hamburger */}
            <button
              className="btn-icon-plain md:hidden -mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"

            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 transition-all duration-300 ${isScrolled ? "bg-charcoal" : "bg-white"} ${isMobileMenuOpen ? "rotate-45 translate-y-2 bg-charcoal" : ""}`} />
                <span className={`w-full h-0.5 transition-all duration-300 ${isScrolled ? "bg-charcoal" : "bg-white"} ${isMobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`w-full h-0.5 transition-all duration-300 ${isScrolled ? "bg-charcoal" : "bg-white"} ${isMobileMenuOpen ? "-rotate-45 -translate-y-2 bg-charcoal" : ""}`} />
              </div>
            </button>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 absolute top-full left-0 right-0 ${isMobileMenuOpen ? "max-h-[600px]" : "max-h-0"}`}>
            <div className={`flex flex-col gap-5 px-6 pt-6 pb-8 ${isScrolled ? "bg-white border-t border-border" : "bg-charcoal"}`}>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}
                className={`text-left text-sm tracking-wider uppercase transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}>
                Home
              </Link>

              {/* Mobile Developments — Link + separate chevron toggle */}
              <div className="flex items-center justify-between">
                <Link
                  to="/developments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left text-sm tracking-wider uppercase transition-colors flex-1 ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}
                >
                  Developments
                </Link>
                <button
                  onClick={() => setIsMobileDevOpen(!isMobileDevOpen)}
                  aria-label="Toggle developments submenu"
                  className={`btn-icon-plain -mr-2 ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}

                >
                  <svg className={`w-3 h-3 transition-transform ${isMobileDevOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {isMobileDevOpen && (
                <div className="pl-4 space-y-1">
                  {developmentCategories.map((item) => (
                    <Link key={item.href} to={item.href} onClick={() => setIsMobileMenuOpen(false)}
                      className={`block text-sm py-1.5 transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/80 hover:text-white"}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}
                className={`text-left text-sm tracking-wider uppercase transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}>
                Gallery
              </Link>
              <Link to="/testimonials" onClick={() => setIsMobileMenuOpen(false)}
                className={`text-left text-sm tracking-wider uppercase transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}>
                Testimonials
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}
                className={`text-left text-sm tracking-wider uppercase transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}>
                About Us
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}
                className={`text-left text-sm tracking-wider uppercase transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-white/90 hover:text-white"}`}>
                Contact
              </Link>

              <button
                onClick={handleInquire}
                className={`btn-nav mt-2 w-fit ${isScrolled ? "btn-primary" : "btn-on-dark-solid"}`}
              >
                Inquire Now
              </button>

            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default GlobalNav;
