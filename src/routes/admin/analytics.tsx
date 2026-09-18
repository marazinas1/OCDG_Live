import { createFileRoute } from "@tanstack/react-router";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
  head: () => adminHead("Analytics"),
});
