import { createFileRoute } from "@tanstack/react-router";
import CurrentDevelopments from "@/pages/CurrentDevelopments";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/developments/current")({
  component: CurrentDevelopments,
  head: () =>
    pageHead({
      title: "Current Developments — Ocean City Custom Homes",
      description:
        "Active and under-contract luxury custom homes by Ocean City Development Group.",
      path: "/developments/current",
    }),
});
