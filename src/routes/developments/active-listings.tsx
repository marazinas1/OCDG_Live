import { createFileRoute } from "@tanstack/react-router";
import ActiveListings from "@/pages/ActiveListings";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/developments/active-listings")({
  component: ActiveListings,
  head: () =>
    pageHead({
      title: "Active Listings — Ocean City Luxury Homes",
      description: "Custom luxury homes currently for sale in Ocean City, NJ by OCDG.",
      path: "/developments/active-listings",
    }),
});
