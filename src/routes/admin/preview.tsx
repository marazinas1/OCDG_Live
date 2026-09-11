import { createFileRoute } from "@tanstack/react-router";
import PropertyPage from "@/pages/PropertyPage";

// Admin-only preview of unsaved property form data (cross-tab, localStorage).
export const Route = createFileRoute("/admin/preview")({
  component: PropertyPage,
});
