import { createFileRoute } from "@tanstack/react-router";
import UnderContract from "@/pages/UnderContract";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/developments/under-contract")({
  component: UnderContract,
  head: () =>
    pageHead({
      title: "Under Contract — Ocean City Development Group",
      description: "Ocean City luxury homes currently under contract by OCDG.",
      path: "/developments/under-contract",
    }),
});
