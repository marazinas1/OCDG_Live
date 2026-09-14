import { createFileRoute } from "@tanstack/react-router";
import ActiveListings from "@/pages/ActiveListings";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/active-listings")({
  loader: () => fetchPropertyCards({ status: "active" }),
  component: ActiveListingsRoute,
  head: () =>
    pageHead({
      title: "Active Listings — Ocean City Luxury Homes",
      description: "Custom luxury homes currently for sale in Ocean City, NJ by OCDG.",
      path: "/developments/active-listings",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Developments", path: "/developments" },
        { name: "Active Listings", path: "/developments/active-listings" },
      ]),
    }),
});

function ActiveListingsRoute() {
  return <ActiveListings properties={Route.useLoaderData()} />;
}
