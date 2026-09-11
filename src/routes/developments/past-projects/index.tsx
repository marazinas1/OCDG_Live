import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy category URL → /developments/sold.
export const Route = createFileRoute("/developments/past-projects/")({
  beforeLoad: () => {
    throw redirect({ to: "/developments/sold", replace: true });
  },
});
