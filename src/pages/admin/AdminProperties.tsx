import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import {
  Plus,
  Pencil,
  Search,
  Trash2,
  MoreVertical,
  Copy,
  ImageOff,
  LayoutGrid,
  List as ListIcon,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useProperties, type PropertyListItem } from "@/hooks/admin/useProperties";
import {
  useUpdatePropertyPublished,
  useUpdatePropertyStatus,
} from "@/hooks/admin/useUpdatePropertyStatus";
import { useDeleteProperty } from "@/hooks/admin/useDeleteProperty";
import {
  PROPERTY_STATUSES,
  STATUS_LABELS,
  isPropertyStatus,
  type PropertyStatus,
} from "@/lib/admin/status";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "table";
type StatusFilter = "all" | PropertyStatus;
type PublishFilter = "all" | "published" | "draft";
type PageFilter = "all" | "full" | "record_only";
type SortKey = "newest" | "title-asc" | "listed-desc";

const VIEW_STORAGE_KEY = "admin-properties-view";

function AdminPropertiesInner() {
  const { data, isLoading, error, refetch } = useProperties();
  const updateStatus = useUpdatePropertyStatus();
  const updatePublished = useUpdatePropertyPublished();
  const deleteProperty = useDeleteProperty();

  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [pageFilter, setPageFilter] = useState<PageFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "grid" || saved === "table") setView(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const rows = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (q && !`${r.title} ${r.slug}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (publishFilter === "published" && !r.published) return false;
      if (publishFilter === "draft" && r.published) return false;
      if (pageFilter === "full" && !r.has_page) return false;
      if (pageFilter === "record_only" && r.has_page) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "listed-desc":
          return (b.listed_date ?? "").localeCompare(a.listed_date ?? "");
        default:
          return b.updated_at.localeCompare(a.updated_at);
      }
    });
    return list;
  }, [rows, search, statusFilter, publishFilter, pageFilter, sort]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPublishFilter("all");
    setPageFilter("all");
  };

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/developments/${slug}`);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const onTogglePublished = (id: string, published: boolean) =>
    updatePublished.mutate({ id, published });

  const onChangeStatus = (id: string, status: string) =>
    updateStatus.mutate({ id, status });

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteProperty.mutate(toDelete.id, {
      onSettled: () => setToDelete(null),
    });
  };

  const handlers: RowHandlers = {
    onDelete: setToDelete,
    onCopy: copyLink,
    onTogglePublished,
    onChangeStatus,
  };

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "property" : "properties"} total
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/properties/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add new property</span>
          </Link>
        </Button>
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROPERTY_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={publishFilter} onValueChange={(v) => setPublishFilter(v as PublishFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pageFilter} onValueChange={(v) => setPageFilter(v as PageFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Pages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pages</SelectItem>
            <SelectItem value="full">Full page</SelectItem>
            <SelectItem value="record_only">Record only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Recently updated</SelectItem>
            <SelectItem value="title-asc">Title A–Z</SelectItem>
            <SelectItem value="listed-desc">Listed date ↓</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as ViewMode)}
          className="sm:ml-auto"
          variant="outline"
        >
          <ToggleGroupItem value="grid" aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="List view">
            <ListIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="w-full text-xs text-muted-foreground sm:w-auto sm:shrink-0">
          Showing {filtered.length} of {rows.length}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <p>Properties could not be loaded.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : view === "grid" ? (
        <GridView items={filtered} {...handlers} />
      ) : (
        <TableView items={filtered} {...handlers} />
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `“${toDelete.title}” and all of its images will be permanently removed.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PublishBadge({ published }: { published: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        published ? "bg-success-surface text-success-strong" : "bg-muted text-muted-foreground",
      )}
    >
      {published ? "Published" : "Draft"}
    </Badge>
  );
}

function RecordOnlyBadge() {
  return (
    <Badge variant="secondary" className="border-transparent bg-primary/10 text-foreground">
      Record only
    </Badge>
  );
}

function Thumb({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={cn("grid place-items-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={cn("object-cover", className)} loading="lazy" />;
}

type RowHandlers = {
  onDelete: (v: { id: string; title: string }) => void;
  onCopy: (slug: string) => void;
  onTogglePublished: (id: string, published: boolean) => void;
  onChangeStatus: (id: string, status: string) => void;
};

function RowActions({
  p,
  onDelete,
  onCopy,
}: { p: PropertyListItem } & Pick<RowHandlers, "onDelete" | "onCopy">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="More actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onCopy(p.slug)}>
          <Copy className="h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        {p.has_page && (
          <DropdownMenuItem asChild>
            <a href={`/developments/${p.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              View on site
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete({ id: p.id, title: p.title })}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GridView({
  items,
  onDelete,
  onCopy,
  onTogglePublished,
}: { items: PropertyListItem[] } & RowHandlers) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <Card key={p.id} className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
          <div className="relative">
            <Thumb src={p.card_image_url} alt={p.title} className="aspect-[4/3] w-full" />
            <div className="absolute left-3 top-3">
              <PublishBadge published={p.published} />
            </div>
            <div className="absolute right-3 top-3">
              {isPropertyStatus(p.status) && <StatusBadge status={p.status} />}
            </div>
          </div>
          <CardContent className="space-y-3 pt-4">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">{p.title}</h3>
              <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{p.price ?? "—"}</span>
              {p.listed_date ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {p.listed_date}
                </span>
              ) : null}
              {!p.has_page && <RecordOnlyBadge />}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={p.published}
                onCheckedChange={(c) => onTogglePublished(p.id, c)}
                aria-label="Published"
              />
              <span>{p.published ? "Visible on site" : "Hidden"}</span>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 border-t border-border pt-4">
            <Button asChild variant="secondary" size="sm" className="flex-1">
              <Link to={`/admin/properties/${p.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <RowActions p={p} onDelete={onDelete} onCopy={onCopy} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TableView({
  items,
  onDelete,
  onCopy,
  onTogglePublished,
  onChangeStatus,
}: { items: PropertyListItem[] } & RowHandlers) {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Listed</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Thumb
                    src={p.card_image_url}
                    alt={p.title}
                    className="h-10 w-10 shrink-0 rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{p.title}</div>
                    <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                      <span>/{p.slug}</span>
                      {!p.has_page && <RecordOnlyBadge />}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.price ?? "—"}</TableCell>
              <TableCell>
                <Select value={p.status} onValueChange={(v) => onChangeStatus(p.id, v)}>
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={p.published}
                  onCheckedChange={(c) => onTogglePublished(p.id, c)}
                  aria-label="Published"
                />
              </TableCell>
              <TableCell className="text-muted-foreground">{p.listed_date ?? "—"}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => navigate(`/admin/properties/${p.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <RowActions p={p} onDelete={onDelete} onCopy={onCopy} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
      <h3 className="text-lg font-semibold text-foreground">No properties yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Add your first property to get started.</p>
      <Button asChild className="mt-4">
        <Link to="/admin/properties/new">
          <Plus className="h-4 w-4" />
          Add new property
        </Link>
      </Button>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
      <h3 className="text-lg font-semibold text-foreground">No properties match your filters</h3>
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting the search or filters.</p>
      <Button variant="outline" className="mt-4" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

export default function AdminProperties() {
  return (
    <AdminProtected>
      <AdminPropertiesInner />
    </AdminProtected>
  );
}
