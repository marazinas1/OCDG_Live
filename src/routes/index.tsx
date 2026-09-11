import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    pageHead({
      title: "Ocean City Development Group | Luxury Coastal Homes",
      description:
        "Premier custom luxury home builder in Ocean City, NJ. Designed by Halliday Architects. View active listings and portfolio.",
      path: "/",
    }),
});
