import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBlocker } from "@tanstack/react-router";

import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAdminTestimonials,
  useDeleteTestimonial,
  useReorderTestimonials,
  useSaveTestimonial,
  useUpdateTestimonialPublished,
  type AdminTestimonial,
} from "@/hooks/admin/useAdminTestimonials";

const summarize = (quote: string) => {
  const flat = quote.replace(/\s+/g, " ").trim();
  return flat.length > 110 ? `${flat.slice(0, 110)}…` : flat;
};

/**
 * Client testimonials as expandable records: collapsed rows show name,
 * published state, order and a summary; editing opens inline.
 */
function AdminTestimonialsInner() {
  const { data: items = [], isLoading, error, refetch } = useAdminTestimonials();
  const save = useSaveTestimonial();
  const setPublished = useUpdateTestimonialPublished();
  const reorder = useReorderTestimonials();
  const remove = useDeleteTestimonial();

  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [detail, setDetail] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [edits, setEdits] = useState<Record<string, Partial<AdminTestimonial>>>({});
  const [openIds, setOpenIds] = useState<string[]>([]);

  const allOpen = useMemo(
    () => items.length > 0 && openIds.length === items.length,
    [items.length, openIds.length],
  );
  const hasUnsavedChanges = useMemo(
    () =>
      Boolean(quote.trim() || author.trim() || detail.trim()) ||
      items.some((item) => {
        const edit = edits[item.id];
        if (!edit) return false;
        return (
          (edit.quote ?? item.quote) !== item.quote ||
          (edit.author_name ?? item.author_name) !== item.author_name ||
          (edit.author_detail ?? item.author_detail ?? "") !== (item.author_detail ?? "")
        );
      }),
    [author, detail, edits, items, quote],
  );

  useBlocker({
    shouldBlockFn: () =>
      hasUnsavedChanges && !window.confirm("You have unsaved testimonial changes. Leave without saving?"),
    enableBeforeUnload: hasUnsavedChanges,
  });

  const toggle = (id: string) =>
    setOpenIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    reorder.mutate(
      { a: items[index]!, b: items[target]! },
      { onError: (e) => toast.error(e.message) },
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      {
        quote,
        author_name: author,
        author_detail: detail,
        sort_order: (items[items.length - 1]?.sort_order ?? 0) + 1,
        published: false,
      },
      {
        onSuccess: () => {
          setQuote("");
          setAuthor("");
          setDetail("");
          setShowAddForm(false);
          toast.success("Testimonial added. Publish it when you are ready.");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Words from clients. Nothing shows on the website until a quote is switched on.
          </p>
        </div>
        <Button type="button" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add testimonial
        </Button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="space-y-4 rounded-lg border border-border bg-card p-5"
        >
          <p className="text-sm font-medium text-foreground">Add a testimonial</p>
          <div>
            <Label htmlFor="quote" className="text-sm">
              Quote
            </Label>
            <Textarea
              id="quote"
              rows={6}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="What the client wrote or said, in their own words."
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Separate paragraphs with a blank line.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="author" className="text-sm">
                Name
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Client name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="detail" className="text-sm">
                Sign-off (optional)
              </Label>
              <Input
                id="detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Warm regards, Jane & John"
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Button type="submit" disabled={!quote.trim() || !author.trim() || save.isPending}>
              {save.isPending ? "Saving…" : "Add"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {items.length > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {items.length} testimonials · {items.filter((i) => i.published).length} shown on site
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpenIds(allOpen ? [] : items.map((i) => i.id))}
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <ul className="space-y-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[72px] animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </ul>
      ) : error ? (
        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <p>The testimonials could not be loaded.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No testimonials yet. Add the first client quote and switch it on when you are ready.
          </p>
          <Button type="button" className="mt-4" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add testimonial
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const edit = edits[item.id] ?? {};
            const quoteValue = edit.quote ?? item.quote;
            const nameValue = edit.author_name ?? item.author_name;
            const detailValue = edit.author_detail ?? item.author_detail ?? "";
            const dirty =
              quoteValue !== item.quote ||
              nameValue !== item.author_name ||
              detailValue !== (item.author_detail ?? "");
            const open = openIds.includes(item.id);

            return (
              <li key={item.id} className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 p-4">
                   <Button
                    type="button"
                     variant="ghost"
                    aria-expanded={open}
                    onClick={() => toggle(item.id)}
                     className="h-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal p-0 text-left hover:bg-transparent"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{nameValue}</span>
                        <Badge
                          variant="secondary"
                          className={
                            item.published
                              ? "border-transparent bg-success-surface text-success-strong"
                              : "border-transparent bg-muted text-muted-foreground"
                          }
                        >
                          {item.published ? "Shown on site" : "Hidden"}
                        </Badge>
                        {dirty && (
                          <Badge
                            variant="secondary"
                            className="border-transparent bg-warning-surface text-warning-strong"
                          >
                            Unsaved
                          </Badge>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        #{index + 1} · {summarize(quoteValue)}
                      </span>
                    </span>
                   </Button>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${nameValue} up`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${nameValue} down`}
                      disabled={index === items.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="space-y-4 border-t border-border p-5">
                    <div>
                      <Label htmlFor={`quote-${item.id}`}>Quote</Label>
                      <Textarea
                        id={`quote-${item.id}`}
                        rows={6}
                        className="mt-2"
                        value={quoteValue}
                        onChange={(e) =>
                          setEdits((s) => ({ ...s, [item.id]: { ...edit, quote: e.target.value } }))
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`name-${item.id}`}>Name</Label>
                        <Input
                          id={`name-${item.id}`}
                          className="mt-2"
                          value={nameValue}
                          onChange={(e) =>
                            setEdits((s) => ({
                              ...s,
                              [item.id]: { ...edit, author_name: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`detail-${item.id}`}>Sign-off (optional)</Label>
                        <Input
                          id={`detail-${item.id}`}
                          className="mt-2"
                          value={detailValue}
                          placeholder="Warm regards, Jane & John"
                          onChange={(e) =>
                            setEdits((s) => ({
                              ...s,
                              [item.id]: { ...edit, author_detail: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`published-${item.id}`}
                          checked={item.published}
                          onCheckedChange={(published) =>
                            setPublished.mutate(
                              { id: item.id, published },
                              { onError: (e) => toast.error(e.message) },
                            )
                          }
                        />
                        <Label htmlFor={`published-${item.id}`} className="text-sm font-normal">
                          Shown on site
                        </Label>
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={!dirty || save.isPending}
                          onClick={() =>
                            save.mutate(
                              {
                                id: item.id,
                                quote: quoteValue,
                                author_name: nameValue,
                                author_detail: detailValue,
                                anchor: item.anchor,
                                published: item.published,
                                sort_order: item.sort_order,
                              },
                              {
                                onSuccess: () => {
                                  setEdits((s) => {
                                    const next = { ...s };
                                    delete next[item.id];
                                    return next;
                                  });
                                  toast.success("Saved.");
                                },
                                onError: (e) => toast.error(e.message),
                              },
                            )
                          }
                        >
                          {save.isPending ? "Saving…" : dirty ? "Save" : "Saved"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete testimonial from ${nameValue}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete the testimonial from {item.author_name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This quote will be removed permanently and will disappear from the
                                public testimonials page. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() =>
                                  remove.mutate(item.id, {
                                    onError: (e) => toast.error(e.message),
                                  })
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminTestimonials() {
  return (
    <AdminProtected>
      <AdminTestimonialsInner />
    </AdminProtected>
  );
}
