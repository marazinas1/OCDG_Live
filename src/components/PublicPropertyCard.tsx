import { Link } from "@/lib/router-compat";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/lib/admin/status";
import type { PublicPropertyCard as PublicPropertyCardData } from "@/hooks/usePublicProperties";

/**
 * Uniform card used across Index, category pages, and Developments.
 * Reads badge color/label from the admin status map so public and admin
 * are guaranteed to stay in sync.
 */
const PublicPropertyCard = ({
  card,
  showCTA = true,
  eager = false,
}: {
  card: PublicPropertyCardData;
  showCTA?: boolean;
  eager?: boolean;
}) => {
  const href = `/developments/${card.slug}`;
  const badgeClass = STATUS_BADGE_CLASSES[card.status];
  const badgeLabel = STATUS_LABELS[card.status];

  const body = (
    <div className="card-elegant overflow-hidden group h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
        {card.card_image_url ? (
          <img
            src={card.card_image_url}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent">
            <p className="text-small">Photo Coming Soon</p>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${badgeClass} backdrop-blur-sm`}
            style={{ borderRadius: "4px" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {badgeLabel}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        {card.location && <p className="text-small mb-1">{card.location}</p>}
        <h3 className="heading-card text-charcoal mb-2">{card.title}</h3>
        {card.price && <p className="text-sm font-serif text-charcoal mb-1">{card.price}</p>}
        {(card.tagline || card.description) && (
          <p className="text-body text-sm mb-5 flex-grow line-clamp-3">
            {card.tagline ?? card.description}
          </p>
        )}
        {showCTA && (
          <span className="btn-primary btn-compact btn-block mt-auto">View Project</span>
        )}
      </div>
    </div>
  );

  return (
    <Link to={href} className="block h-full">
      {body}
    </Link>
  );
};

export default PublicPropertyCard;