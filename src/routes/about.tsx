import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";
import { pageHead } from "@/lib/seo";
import { fetchContent } from "@/lib/content-resolver";
import { resolveAboutContent } from "@/lib/content/about";

export const Route = createFileRoute("/about")({
  loader: async () => resolveAboutContent(await fetchContent(["about", "global"])),
  component: About,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">Page not found.</div>,
  head: () =>
    pageHead({
      title: "About Ocean City Development Group",
      description:
        "45+ years building luxury coastal homes in Ocean City, NJ. Meet Patrick Halliday and our partners at Halliday Architects.",
      path: "/about",
    }),
});
