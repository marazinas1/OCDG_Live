import { createFileRoute } from "@tanstack/react-router";
import AdminSettings from "@/pages/admin/AdminSettings";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
  head: () => adminHead("Settings"),
});
