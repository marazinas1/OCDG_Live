import { createFileRoute } from "@tanstack/react-router";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonials,
});
