import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: About,
  head: () =>
    pageHead({
      title: "About Ocean City Development Group",
      description:
        "45+ years building luxury coastal homes in Ocean City, NJ. Meet Patrick Halliday and our partners at Halliday Architects.",
      path: "/about",
    }),
});
