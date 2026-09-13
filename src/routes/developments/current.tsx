import { createFileRoute } from "@tanstack/react-router";
import CurrentDevelopments from "@/pages/CurrentDevelopments";
import { pageHead } from "@/lib/seo";
import { fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/current")({
  loader: () => fetchPropertyCards({ status: ["active", "under_contract"] }),
  component: CurrentDevelopmentsRoute,
  head: () =>
    pageHead({
      title: "Current Developments — Ocean City Custom Homes",
      description:
        "Active and under-contract luxury custom homes by Ocean City Development Group.",
      path: "/developments/current",
    }),
});

function CurrentDevelopmentsRoute() {
  return <CurrentDevelopments properties={Route.useLoaderData()} />;
}
