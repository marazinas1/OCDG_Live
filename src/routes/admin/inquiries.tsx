import { createFileRoute } from "@tanstack/react-router";
import AdminInquiries from "@/pages/admin/AdminInquiries";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiries,
  head: () => adminHead("Inquiries"),
});
