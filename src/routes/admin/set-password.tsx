import { createFileRoute } from "@tanstack/react-router";
import AdminSetPassword from "@/pages/admin/AdminSetPassword";
import { adminHead } from "@/lib/admin/head";

// Invited users have no role yet — this must stay unprotected.
export const Route = createFileRoute("/admin/set-password")({
  component: AdminSetPassword,
  head: () => adminHead("Set password"),
});
