import { useMemo, useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import subpageHero from "@/assets/subpage-hero.jpg";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicGallery, type GalleryImage, type GalleryBlock } from "@/hooks/usePublicGallery";

const PROJECTS_PER_BATCH = 2;

const GalleryTile = ({
  image,
  className,
  aspectClass,
  onClick,
}: {
  image: GalleryImage;
  className?: string;
  aspectClass: string;
  onClick: () => void;
}) => (
  <div
    className={`cursor-pointer overflow-hidden group ${className || ""}`}
    onClick={onClick}
  >
    <div className="relative h-full">
      <img
        src={image.src}
        alt={`${image.project} — ${image.alt}`}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${aspectClass}`}
      />
      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-charcoal/70 to-transparent">
        <span className="text-white text-xs md:text-sm font-light tracking-wider uppercase">
          {image.project}
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-10 h-10 border border-white rounded-full flex items-center justify-center">
          <span className="text-white text-xl">+</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Full 6-exterior + 6-interior collage. Only rendered when the property has both.
 */
const ProjectCollage = ({
  block,
  globalOffset,
  onImageClick,
}: {
  block: GalleryBlock;
  globalOffset: number;
  onImageClick: (globalIndex: number) => void;
}) => {
  const ext = block.exterior;
  const int = block.interior;
  const gi = (localIndex: number) => globalOffset + localIndex;

  return (
    <div className="mb-16 last:mb-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 sm:gap-4">
        <div>
          <p className="label-uppercase mb-1">Exterior & Interior</p>
          <h2 className="heading-section text-charcoal text-xl">{block.name}</h2>
        </div>
        <Link to={block.link} className="btn-outline btn-compact flex-shrink-0">
          View Project
        </Link>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="col-span-2 md:col-span-2 md:row-span-2">
            <GalleryTile image={ext[0]!} aspectClass="aspect-[4/3]" onClick={() => onImageClick(gi(0))} />
          </div>
          <div>
            <GalleryTile image={ext[1]!} aspectClass="aspect-[4/3]" onClick={() => onImageClick(gi(1))} />
          </div>
          <div>
            <GalleryTile image={ext[2]!} aspectClass="aspect-[4/3]" onClick={() => onImageClick(gi(2))} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="col-span-2 md:col-span-1">
            <GalleryTile image={ext[3]!} aspectClass="aspect-[16/10] md:aspect-square" onClick={() => onImageClick(gi(3))} />
          </div>
          <GalleryTile image={ext[4]!} aspectClass="aspect-square" onClick={() => onImageClick(gi(4))} />
          <GalleryTile image={ext[5]!} aspectClass="aspect-square" onClick={() => onImageClick(gi(5))} />
        </div>

        <div>
          <GalleryTile image={int[0]!} aspectClass="aspect-[16/10] md:aspect-[21/9]" onClick={() => onImageClick(gi(ext.length))} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="col-span-2 md:col-span-1">
            <GalleryTile image={int[1]!} aspectClass="aspect-[4/3] md:aspect-[3/4]" onClick={() => onImageClick(gi(ext.length + 1))} />
          </div>
          <GalleryTile image={int[2]!} aspectClass="aspect-[3/4]" onClick={() => onImageClick(gi(ext.length + 2))} />
          <GalleryTile image={int[3]!} aspectClass="aspect-[3/4]" onClick={() => onImageClick(gi(ext.length + 3))} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <GalleryTile image={int[4]!} aspectClass="aspect-[4/3]" onClick={() => onImageClick(gi(ext.length + 4))} />
          <GalleryTile image={int[5]!} aspectClass="aspect-[4/3]" onClick={() => onImageClick(gi(ext.length + 5))} />
        </div>
      </div>
    </div>
  );
};

/**
 * Uniform grid fallback for properties without the full collage set.
 */
const PhotoGrid = ({
  block,
  globalOffset,
  onImageClick,
}: {
  block: GalleryBlock;
  globalOffset: number;
  onImageClick: (globalIndex: number) => void;
}) => (
  <div className="mb-16 last:mb-0">
    <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 sm:gap-4">
      <div>
        <p className="label-uppercase mb-1">Photography</p>
        <h2 className="heading-section text-charcoal text-xl">{block.name}</h2>
      </div>
      <Link to={block.link} className="btn-outline btn-compact flex-shrink-0">
        View Project
      </Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
      {block.all.map((image, idx) => {
        const isMobileFull = idx % 5 === 0;
        return (
          <div key={idx} className={isMobileFull ? "col-span-2 sm:col-span-1" : ""}>
            <GalleryTile
              image={image}
              aspectClass={isMobileFull ? "aspect-[16/10] sm:aspect-square" : "aspect-square"}
              onClick={() => onImageClick(globalOffset + idx)}
            />
          </div>
        );
      })}
    </div>
  </div>
);

const GalleryPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProjectCount, setVisibleProjectCount] = useState(PROJECTS_PER_BATCH);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: blocks = [], isLoading } = usePublicGallery();

  const { layoutBlocks, allImages } = useMemo(() => {
    type Layout = { kind: "render" | "photo"; block: GalleryBlock; offset: number };
    const layout: Layout[] = [];
    const flat: GalleryImage[] = [];
    for (const b of blocks) {
      const kind: "render" | "photo" = b.exterior.length >= 6 && b.interior.length >= 6 ? "render" : "photo";
      layout.push({ kind, block: b, offset: flat.length });
      flat.push(...b.all);
    }
    return { layoutBlocks: layout, allImages: flat };
  }, [blocks]);

  const visibleBlocks = layoutBlocks.slice(0, visibleProjectCount);
  const hasMore = visibleProjectCount < layoutBlocks.length;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const nextImage = () => setCurrentIndex((prev) => (allImages.length ? (prev + 1) % allImages.length : 0));
  const prevImage = () =>
    setCurrentIndex((prev) => (allImages.length ? (prev - 1 + allImages.length) % allImages.length : 0));

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, allImages.length]);

  const loadMore = () => {
    setVisibleProjectCount((prev) => Math.min(prev + PROJECTS_PER_BATCH, layoutBlocks.length));
  };

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={subpageHero}
          alt="Gallery — Ocean City Development Group"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
          fetchPriority="high"
          decoding="async"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-4">Our Work</p>
          <h1 className="heading-display text-white">Gallery</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
            </div>
          ) : layoutBlocks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-lg">No gallery images yet.</p>
            </div>
          ) : (
            visibleBlocks.map((lb) =>
              lb.kind === "render" ? (
                <ProjectCollage
                  key={`render-${lb.block.slug}`}
                  block={lb.block}
                  globalOffset={lb.offset}
                  onImageClick={openLightbox}
                />
              ) : (
                <PhotoGrid
                  key={`photo-${lb.block.slug}`}
                  block={lb.block}
                  globalOffset={lb.offset}
                  onImageClick={openLightbox}
                />
              ),
            )
          )}

          {hasMore && (
            <div className="text-center mt-4">
              <button onClick={loadMore} className="btn-outline btn-compact">
                See More Images
              </button>
            </div>
          )}
        </div>
      </section>

      {lightboxOpen && allImages.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button aria-label="Close gallery" className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10" onClick={closeLightbox}>
            <X className="w-8 h-8" />
          </button>
          <button aria-label="Previous image" className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button aria-label="Next image" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight className="w-10 h-10" />
          </button>
          <img src={allImages[currentIndex]!.src} alt={allImages[currentIndex]!.alt} className="max-w-[90vw] max-h-[85vh] object-contain" decoding="async" loading="lazy" onClick={(e) => e.stopPropagation()} />
          <img src={allImages[(currentIndex + 1) % allImages.length]!.src} alt="" className="hidden" aria-hidden="true" loading="lazy" decoding="async" />
          <img src={allImages[(currentIndex - 1 + allImages.length) % allImages.length]!.src} alt="" className="hidden" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/80 text-sm font-medium">{allImages[currentIndex]!.project}</p>
            <p className="text-white/50 text-xs mt-1">{currentIndex + 1} / {allImages.length}</p>
          </div>
        </div>
      )}

      <GlobalFooter />
    </main>
  );
};

export default GalleryPage;