import { createFileRoute } from "@tanstack/react-router";
import AdminLogin from "@/pages/admin/AdminLogin";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => adminHead("Sign in"),
});
