import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/pages/ComingSoon";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/coming-soon")({
  loader: () => fetchPropertyCards({ status: "coming_soon" }),
  component: ComingSoonRoute,
  head: () =>
    pageHead({
      title: "Coming Soon — Ocean City Development Group",
      description: "Upcoming custom luxury home developments in Ocean City, NJ.",
      path: "/developments/coming-soon",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Developments", path: "/developments" },
        { name: "Coming Soon", path: "/developments/coming-soon" },
      ]),
    }),
});

function ComingSoonRoute() {
  return <ComingSoon properties={Route.useLoaderData()} />;
}
