import { createFileRoute } from "@tanstack/react-router";
import CurrentDevelopments from "@/pages/CurrentDevelopments";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/current")({
  loader: () => fetchPropertyCards({ status: ["active", "under_contract", "coming_soon"] }),
  component: CurrentDevelopmentsRoute,
  head: () =>
    pageHead({
      title: "Current Developments — Ocean City Custom Homes",
      description:
        "Active and under-contract luxury custom homes by Ocean City Development Group.",
      path: "/developments/current",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Developments", path: "/developments" },
        { name: "Current Developments", path: "/developments/current" },
      ]),
    }),
});

function CurrentDevelopmentsRoute() {
  return <CurrentDevelopments properties={Route.useLoaderData()} />;
}
