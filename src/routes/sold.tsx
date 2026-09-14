import { createFileRoute, redirect } from "@tanstack/react-router";

// Standalone legacy /sold page → canonical sold portfolio.
export const Route = createFileRoute("/sold")({
  beforeLoad: () => {
    throw redirect({ to: "/developments/sold", replace: true });
  },
});
