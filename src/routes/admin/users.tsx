import { createFileRoute } from "@tanstack/react-router";
import AdminUsers from "@/pages/admin/AdminUsers";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
  head: () => adminHead("Users"),
});
