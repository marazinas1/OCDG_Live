import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/pages/Contact";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () =>
    pageHead({
      title: "Contact Ocean City Development Group",
      description:
        "Get in touch with Patrick A. Halliday to discuss your custom luxury home in Ocean City, NJ.",
      path: "/contact",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "@id": "https://oceancitydevelopment.com/#organization",
        name: "Ocean City Development Group",
        url: "https://oceancitydevelopment.com/contact",
        telephone: "+1-609-602-3917",
        email: "PatrickAHalliday@gmail.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "700 Haven Avenue",
          addressLocality: "Ocean City",
          addressRegion: "NJ",
          postalCode: "08226",
          addressCountry: "US",
        },
        areaServed: { "@type": "City", name: "Ocean City, NJ" },
        employee: { "@type": "Person", name: "Patrick A. Halliday" },
      },
    }),
});
