import { createFileRoute } from "@tanstack/react-router";
import AdminSetPassword from "@/pages/admin/AdminSetPassword";

// Invited users have no role yet — this must stay unprotected.
export const Route = createFileRoute("/admin/set-password")({
  component: AdminSetPassword,
});
