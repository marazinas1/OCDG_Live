import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/pages/ComingSoon";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/developments/coming-soon")({
  component: ComingSoon,
  head: () =>
    pageHead({
      title: "Coming Soon — Ocean City Development Group",
      description: "Upcoming custom luxury home developments in Ocean City, NJ.",
      path: "/developments/coming-soon",
    }),
});
