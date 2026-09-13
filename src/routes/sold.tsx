import { createFileRoute } from "@tanstack/react-router";
import Sold from "@/pages/Sold";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/sold")({
  component: Sold,
  head: () =>
    pageHead({
      title: "Sold Projects — Ocean City Development Group",
      description:
        "A look back at luxury coastal homes built and sold by Ocean City Development Group.",
      path: "/sold",
    }),
});
