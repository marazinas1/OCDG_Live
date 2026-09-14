import { createFileRoute } from "@tanstack/react-router";
import UnderContract from "@/pages/UnderContract";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { fetchPropertyCards } from "@/lib/content/properties";

export const Route = createFileRoute("/developments/under-contract")({
  loader: () => fetchPropertyCards({ status: "under_contract" }),
  component: UnderContractRoute,
  head: () =>
    pageHead({
      title: "Under Contract — Ocean City Development Group",
      description: "Ocean City luxury homes currently under contract by OCDG.",
      path: "/developments/under-contract",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Developments", path: "/developments" },
        { name: "Under Contract", path: "/developments/under-contract" },
      ]),
    }),
});

function UnderContractRoute() {
  return <UnderContract properties={Route.useLoaderData()} />;
}
