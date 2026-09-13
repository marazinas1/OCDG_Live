import { createFileRoute } from "@tanstack/react-router";
import SoldProjects from "@/pages/SoldProjects";
import { pageHead } from "@/lib/seo";
import { fetchPastDevelopments, fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/sold/")({
  loader: async () => {
    const [properties, pastDevelopments] = await Promise.all([
      fetchPropertyCards({ status: "sold" }),
      fetchPastDevelopments(),
    ]);
    return { properties, pastDevelopments };
  },
  component: SoldProjectsRoute,
  head: () =>
    pageHead({
      title: "Sold Portfolio — Ocean City Custom Homes",
      description:
        "Completed and sold luxury custom homes built by Ocean City Development Group.",
      path: "/developments/sold",
    }),
});

function SoldProjectsRoute() {
  const { properties, pastDevelopments } = Route.useLoaderData();
  return <SoldProjects properties={properties} pastDevelopments={pastDevelopments} />;
}
