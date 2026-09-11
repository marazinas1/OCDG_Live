import { createFileRoute } from "@tanstack/react-router";
import SoldProjects from "@/pages/SoldProjects";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/developments/sold/")({
  component: SoldProjects,
  head: () =>
    pageHead({
      title: "Sold Portfolio — Ocean City Custom Homes",
      description:
        "Completed and sold luxury custom homes built by Ocean City Development Group.",
      path: "/developments/sold",
    }),
});
