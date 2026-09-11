import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy slugged URL → canonical /developments/:slug.
export const Route = createFileRoute("/developments/past-projects/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/developments/$slug", params: { slug: params.slug }, replace: true });
  },
});
