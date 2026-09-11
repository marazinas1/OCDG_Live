import { createFileRoute } from "@tanstack/react-router";
import Sold from "@/pages/Sold";

export const Route = createFileRoute("/sold")({
  component: Sold,
});
