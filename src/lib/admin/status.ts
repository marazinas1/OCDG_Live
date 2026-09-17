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
  coming_soon: "bg-status-coming-soon text-status-coming-soon-foreground",
  active: "bg-status-active text-status-active-foreground",
  under_contract: "bg-status-under-contract text-status-under-contract-foreground",
  sold: "bg-status-sold text-status-sold-foreground",
};

export function isPropertyStatus(v: string): v is PropertyStatus {
  return (PROPERTY_STATUSES as string[]).includes(v);
}