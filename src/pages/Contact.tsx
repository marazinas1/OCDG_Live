import { useState, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import subpageHero from "@/assets/subpage-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessInfo } from "@/hooks/useGlobalBranding";
import { toast } from "sonner";

const routeApi = getRouteApi("/contact");

const INTEREST_OPTIONS = [
  "Active Listing inquiry",
  "Under Contract / Pre-Sale inquiry",
  "Custom Home / New Build",
  "Past Project inquiry",
  "Press / Media",
  "General inquiry",
];

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hp, setHp] = useState(""); // honeypot
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        toast.success("Thank you — Patrick will be in touch shortly.");
        setForm({ name: "", email: "", phone: "", interest: "", message: "" });
        setHp("");
        return;
      }
      const id = crypto.randomUUID();
      const { error: insertError } = await supabase.from("leads").insert({
        id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest: form.interest || null,
        message: form.message || null,
        source: "Contact page",
        user_agent: navigator.userAgent,
      });
      if (insertError) {
        console.error("Lead insert failed:", insertError);
        toast.error("Something went wrong. Please call (609) 602-3917 or email PatrickAHalliday@gmail.com.");
        return;
      }

      // Lead is saved. Email notification is best-effort.
      const { error: emailError } = await supabase.functions.invoke("send-inquiry-notification", {
        body: {
          leadId: id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          interest: form.interest,
          message: form.message,
          source: "Contact page",
        },
      });
      if (emailError) {
        console.error("Inquiry email notification failed (lead was saved):", emailError);
      }

      toast.success("Thank you — Patrick will be in touch shortly.");
      setForm({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please call (609) 602-3917 or email PatrickAHalliday@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={subpageHero}
          alt="Contact Ocean City Development Group"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-4">Get In Touch</p>
          <h1 className="heading-display text-white">Contact Ocean City Development Group</h1>
        </div>
      </section>

      {/* Contact Content */}
      <section id="contact" className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <p className="label-uppercase mb-4">Ocean City Development Group</p>
              <h2 className="heading-section text-charcoal mb-6">Let's Build Together</h2>
              <div className="divider mb-8" />

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-muted-slate mb-2">Lead Contact</h4>
                  <p className="text-body">Patrick A. Halliday</p>
                </div>
                <div>
                  <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-muted-slate mb-2">Address</h4>
                  <p className="text-body">700 Haven Avenue<br />Ocean City, NJ 08226</p>
                </div>
                <div>
                  <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-muted-slate mb-2">Phone</h4>
                  <a href="tel:6096023917" className="text-body hover:text-charcoal transition-colors">(609) 602-3917</a>
                </div>
                <div>
                  <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-muted-slate mb-2">Email</h4>
                  <a href="mailto:PatrickAHalliday@gmail.com" className="text-body hover:text-charcoal transition-colors">
                    PatrickAHalliday@gmail.com
                  </a>
                </div>
              </div>

              {/* Google Map — Grayscale */}
              <div className="mt-10 aspect-[4/3] w-full overflow-hidden" style={{ borderRadius: "4px", filter: "grayscale(100%) contrast(1.1)" }}>
                <iframe
                  title="Ocean City Development Group Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3072.0!2d-74.575!3d39.2776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c0e54b1d4b0001%3A0x1!2s700+Haven+Ave%2C+Ocean+City%2C+NJ+08226!5e0!3m2!1sen!2sus!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Form */}
            <div className="h-full">
              <div className="card-elegant p-8 md:p-10 h-full flex flex-col">
                <h3 className="heading-card text-charcoal mb-2">Inquiry Form</h3>
                <p className="text-small mb-8">Tell us about your project and we'll be in touch shortly.</p>

                <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
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
                    <label htmlFor="contact-name" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-slate mb-2 block">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-elegant"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-slate mb-2 block">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-elegant"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-slate mb-2 block">Phone Number</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                      className="input-elegant"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-interest" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-slate mb-2 block">Interest</label>
                    <select
                      id="contact-interest"
                      value={form.interest}
                      onChange={(e) => setForm({ ...form, interest: e.target.value })}
                      className="input-elegant"
                    >
                      <option value="">Select your interest</option>
                      {INTEREST_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label htmlFor="contact-message" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-slate mb-2 block">Message</label>
                    <textarea
                      id="contact-message"
                      rows={12}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input-elegant resize-none flex-1 min-h-[18rem]"
                      placeholder="Tell us about your dream home…"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary btn-block mt-auto"
                  >
                    {submitting ? "Sending…" : "Send Inquiry"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default Contact;
