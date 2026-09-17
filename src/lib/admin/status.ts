export type PropertyStatus = "coming_soon" | "active" | "under_contract" | "sold";

export const PROPERTY_STATUSES: PropertyStatus[] = [
  "coming_soon",
  "active",
  "under_contract",
  "sold",
];

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  coming_soon: "Coming Soon",
  active: "Active Listing",
  under_contract: "Under Contract",
  sold: "Sold",
};

export const STATUS_BADGE_CLASSES: Record<PropertyStatus, string> = {
  coming_soon: "bg-muted text-foreground",
  active: "bg-emerald-500 text-on-dark",
  under_contract: "bg-amber-600 text-on-dark",
  sold: "bg-primary text-on-dark",
};

export function isPropertyStatus(v: string): v is PropertyStatus {
  return (PROPERTY_STATUSES as string[]).includes(v);
}