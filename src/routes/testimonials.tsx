import { createFileRoute } from "@tanstack/react-router";
import Testimonials from "@/pages/Testimonials";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/testimonials")({
  component: Testimonials,
  head: () =>
    pageHead({
      title: "Testimonials — Ocean City Development Group",
      description:
        "What clients say about building their dream coastal homes with Ocean City Development Group.",
      path: "/testimonials",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "@id": "https://oceancitydevelopment.com/#organization",
        name: "Ocean City Development Group",
        url: "https://oceancitydevelopment.com/testimonials",
      },
    }),
});
