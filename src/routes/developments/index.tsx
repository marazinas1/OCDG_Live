import { createFileRoute } from "@tanstack/react-router";
import Developments from "@/pages/Developments";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/developments/")({
  component: Developments,
  head: () =>
    pageHead({
      title: "Developments — Ocean City Custom Homes",
      description:
        "Browse Ocean City Development Group's portfolio: active listings, under contract, and sold luxury coastal homes.",
      path: "/developments",
    }),
});
