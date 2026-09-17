import { createFileRoute } from "@tanstack/react-router";
import Developments from "@/pages/Developments";
import { absoluteOgImage, breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/")({
  loader: () => fetchPropertyCards(),
  component: DevelopmentsRoute,
  head: ({ loaderData }) =>
    pageHead({
      title: "Developments — Ocean City Custom Homes",
      description:
        "Browse Ocean City Development Group's portfolio: active listings, under contract, and sold luxury coastal homes.",
      path: "/developments",
      image: absoluteOgImage(loaderData?.[0]?.card_image_url),
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Developments", path: "/developments" },
      ]),
    }),
});

function DevelopmentsRoute() {
  const properties = Route.useLoaderData();
  return <Developments properties={properties} />;
}
