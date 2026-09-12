import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { pageHead } from "@/lib/seo";
import { fetchContent } from "@/lib/content-resolver";
import { resolveHomeContent } from "@/lib/content/home";

export const Route = createFileRoute("/")({
  loader: async () => resolveHomeContent(await fetchContent(["home", "global"])),
  component: Index,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">Page not found.</div>,
  head: () =>
    pageHead({
      title: "Ocean City Development Group | Luxury Coastal Homes",
      description:
        "Premier custom luxury home builder in Ocean City, NJ. Designed by Halliday Architects. View active listings and portfolio.",
      path: "/",
    }),
});
