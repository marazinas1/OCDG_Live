import { createFileRoute } from "@tanstack/react-router";
import AdminPropertyForm from "@/pages/admin/AdminPropertyForm";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/properties/$id/edit")({
  component: AdminPropertyForm,
  head: () => adminHead("Edit property"),
});
