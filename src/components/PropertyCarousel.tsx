import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

export interface PropertyCarouselItem {
  title: string;
  image: string;
  link: string;
  location: string;
  description: string;
  price?: string | undefined;
  badgeLabel: string;
  badgeColor: string;
}

interface PropertyCarouselProps {
  items: PropertyCarouselItem[];
}

const LOOP_SETS = 3;

const mod = (value: number, length: number) => ((value % length) + length) % length;

const PropertyCarousel = ({ items }: PropertyCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: false,
  });

  const loopItems = useMemo(
    () =>
      Array.from({ length: LOOP_SETS }, (_, setIndex) =>
        items.map((item, itemIndex) => ({
          ...item,
          originalIndex: itemIndex,
          loopKey: `${setIndex}-${item.title}-${itemIndex}`,
        })),
      ).flat(),
    [items],
  );

  const middleStartIndex = items.length;

  const syncSelectedIndex = useCallback(() => {
    if (!emblaApi || items.length === 0) return;
    setSelectedIndex(mod(emblaApi.selectedScrollSnap(), items.length));
  }, [emblaApi, items.length]);

  useEffect(() => {
    if (!emblaApi || items.length === 0) return;

    emblaApi.scrollTo(middleStartIndex, true);
    syncSelectedIndex();

    const handleReInit = () => {
      emblaApi.scrollTo(middleStartIndex, true);
      syncSelectedIndex();
    };

    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", handleReInit);

    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", handleReInit);
    };
  }, [emblaApi, items.length, middleStartIndex, syncSelectedIndex]);

  if (items.length === 0) return null;

  return (
    <div className="relative group/carousel">
      <button
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous property"
        className="btn-icon absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next property"
        className="btn-icon absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>


      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex -ml-8">
          {loopItems.map((item) => (
            <div key={item.loopKey} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/3 pl-8">
              <Link to={item.link} className="card-elegant overflow-hidden group h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-on-dark ${item.badgeColor} backdrop-blur-sm`}
                      style={{ borderRadius: "4px" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-on-dark/80" />
                      {item.badgeLabel}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-small mb-1">{item.location}</p>
                  <h3 className="heading-card text-charcoal mb-2">{item.title}</h3>
                  {item.price && <p className="text-sm font-serif text-charcoal mb-1">{item.price}</p>}
                  <p className="text-body text-sm mb-5 flex-grow">{item.description}</p>
                  <span className="btn-primary btn-compact btn-block">View Project</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(middleStartIndex + index)}
            aria-label={`Go to property ${index + 1}`}
            className={`btn-dot ${index === selectedIndex ? "is-active" : ""}`}
          />

        ))}
      </div>
    </div>
  );
};

export default PropertyCarousel;
