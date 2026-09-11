import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy category URL → /developments/active-listings.
export const Route = createFileRoute("/developments/current-projects/")({
  beforeLoad: () => {
    throw redirect({ to: "/developments/active-listings", replace: true });
  },
});
