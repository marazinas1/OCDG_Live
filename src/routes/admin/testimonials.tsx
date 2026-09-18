import { createFileRoute } from "@tanstack/react-router";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonials,
  head: () => adminHead("Testimonials"),
});
