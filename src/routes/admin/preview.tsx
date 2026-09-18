import { createFileRoute } from "@tanstack/react-router";
import PropertyPage from "@/pages/PropertyPage";
import { adminHead } from "@/lib/admin/head";

// Admin-only preview of unsaved property form data (cross-tab, localStorage).
export const Route = createFileRoute("/admin/preview")({
  component: PropertyPage,
  head: () => adminHead("Property preview"),
});
