import { createFileRoute } from "@tanstack/react-router";
import AdminPropertyForm from "@/pages/admin/AdminPropertyForm";

export const Route = createFileRoute("/admin/properties/new")({
  component: AdminPropertyForm,
});
