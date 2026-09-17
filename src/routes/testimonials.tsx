import { createFileRoute } from "@tanstack/react-router";
import Testimonials from "@/pages/Testimonials";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { fetchContent } from "@/lib/content-resolver";
import { resolveTestimonialsContent } from "@/lib/content/pages";

export const Route = createFileRoute("/testimonials")({
  loader: async () => resolveTestimonialsContent(await fetchContent(["testimonials"])),
  component: Testimonials,
  head: () =>
    pageHead({
      title: "Testimonials — Ocean City Development Group",
      description:
        "What clients say about building their dream coastal homes with Ocean City Development Group.",
      path: "/testimonials",
      jsonLd: [
        {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "@id": "https://oceancitydevelopment.com/#organization",
        name: "Ocean City Development Group",
        url: "https://oceancitydevelopment.com/testimonials",
      },
        breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Testimonials", path: "/testimonials" },
      ]),
      ],
    }),
});
