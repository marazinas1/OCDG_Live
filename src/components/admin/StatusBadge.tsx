import { PropertyStatus, STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/lib/admin/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        STATUS_BADGE_CLASSES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}