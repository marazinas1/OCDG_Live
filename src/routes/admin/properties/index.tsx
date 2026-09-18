import { createFileRoute } from "@tanstack/react-router";
import AdminProperties from "@/pages/admin/AdminProperties";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/properties/")({
  component: AdminProperties,
  head: () => adminHead("Properties"),
});
