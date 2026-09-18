import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** The single underline-style tab treatment used across the admin panel. */
export const adminTabsListClass =
  "flex h-auto w-full items-center justify-start gap-5 overflow-x-auto border-b border-border " +
  "bg-transparent p-0 [scrollbar-width:thin]";

export const adminTabsTriggerClass =
  "relative -mb-px h-10 shrink-0 whitespace-nowrap rounded-none border-0 border-b-2 " +
  "border-transparent bg-transparent px-1 py-2 text-sm font-medium text-muted-foreground shadow-none " +
  "transition-colors hover:text-foreground data-[state=active]:border-primary " +
  "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

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
