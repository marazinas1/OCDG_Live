import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * The single tab treatment used across the admin panel: a visible bordered
 * container, a stable height, and an active trigger that changes its whole
 * surface instead of only an underline. No pills, no arbitrary radius —
 * the radius comes from the brand token.
 */
export const adminTabsListClass =
  "flex w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-muted p-1 " +
  "h-auto justify-start [scrollbar-width:thin]";

export const adminTabsTriggerClass =
  "shrink-0 whitespace-nowrap rounded-[calc(var(--radius)-0.05rem)] px-4 py-2 text-xs font-medium " +
  "uppercase tracking-wider text-muted-foreground transition-colors " +
  "hover:text-foreground data-[state=active]:border data-[state=active]:border-border " +
  "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none";

export function AdminTabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <TabsList className={cn(adminTabsListClass, className)}>{children}</TabsList>;
}

export function AdminTabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger value={value} className={cn(adminTabsTriggerClass, className)}>
      {children}
    </TabsTrigger>
  );
}

export { Tabs as AdminTabs, TabsContent as AdminTabsContent };
