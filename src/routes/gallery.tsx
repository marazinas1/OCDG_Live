import { createFileRoute } from "@tanstack/react-router";
import GalleryPage from "@/pages/GalleryPage";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () =>
    pageHead({
      title: "Gallery — Ocean City Luxury Home Portfolio",
      description:
        "Curated renderings and photography of luxury custom homes by Ocean City Development Group.",
      path: "/gallery",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Gallery", path: "/gallery" },
      ]),
    }),
});
