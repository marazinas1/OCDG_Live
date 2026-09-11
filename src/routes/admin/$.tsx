import { createFileRoute, redirect } from "@tanstack/react-router";

// Unknown /admin/* paths collapse to the dashboard (legacy behavior).
export const Route = createFileRoute("/admin/$")({
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
});
