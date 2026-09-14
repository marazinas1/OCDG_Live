import { useState } from "react";
import {
  usePastDevelopments,
  type PublicPropertyCard,
} from "@/hooks/usePublicProperties";

const PAGE_SIZE = 8;

const PastDevelopmentsSection = ({ items }: { items?: PublicPropertyCard[] | undefined }) => {
  const { data, isLoading } = usePastDevelopments(items);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const list = data ?? [];
  const visible = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  if (!isLoading && list.length === 0) return null;

  return (
    <section className="section-padding border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <div className="text-center mb-12">
          <p className="label-uppercase text-muted-slate mb-3">Our Track Record</p>
          <h2 className="heading-section text-charcoal mb-3">Past Developments</h2>
          <p className="text-body max-w-2xl mx-auto">
            A selection of additional homes previously built and sold by Ocean City Development Group.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden border border-border/50 bg-card flex flex-col"
              style={{ borderRadius: "4px" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-accent">
                {p.card_image_url ? (
                  <img
                    src={p.card_image_url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent">
                    <p className="text-xs text-muted-slate">Photo Coming Soon</p>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white bg-charcoal/85 backdrop-blur-sm"
                    style={{ borderRadius: "3px" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    Sold {p.listed_date ? new Date(p.listed_date).getFullYear() : ""}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-display text-lg text-charcoal leading-snug mb-1">
                  {p.title}
                </h3>
                {p.description && (
                  <p className="text-xs text-muted-slate">{p.description}</p>
                )}
                {p.price && (
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-slate mt-3">
                    Sold {p.price}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="btn-outline btn-compact"
            >
              Show More Past Developments
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PastDevelopmentsSection;