"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icons";

/**
 * Carousel — the shadcn/ui Carousel, built on Embla Carousel, adapted to
 * HimVolt's primitives (project `Icon` component instead of lucide, plain
 * arrow buttons instead of the CTA Button, and a `gap`-based slide layout
 * instead of shadcn's negative-margin pattern since `cn` here has no
 * tailwind-merge).
 *
 * Embla scrolls slides with transforms inside an `overflow-hidden` viewport,
 * so the carousel can never widen the page or leak scroll to it.
 */
type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
type CarouselPlugins = Parameters<typeof useEmblaCarousel>[1];
type CarouselRef = ReturnType<typeof useEmblaCarousel>[0];

type CarouselProps = HTMLAttributes<HTMLDivElement> & {
  opts?: CarouselOptions;
  plugins?: CarouselPlugins;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextValue = {
  carouselRef: CarouselRef;
  api: CarouselApi;
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within a <Carousel />");
  return ctx;
}

function Carousel({
  orientation = "horizontal",
  opts,
  plugins,
  setApi,
  className,
  children,
  ...props
}: CarouselProps) {
  // Changing `opts` (e.g. axis on breakpoint flip) auto-reinits Embla.
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setCanScrollPrev(embla.canScrollPrev());
    setCanScrollNext(embla.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    setApi?.(api);
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect, setApi]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  viewportClassName,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { viewportClassName?: string }) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className={cn("overflow-hidden", viewportClassName)}>
      <div
        className={cn(
          "flex",
          orientation === "vertical" && "flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-auto", className)}
      {...props}
    />
  );
}

function CarouselArrowButton({
  direction,
  className,
  ...props
}: { direction: "prev" | "next" } & HTMLAttributes<HTMLButtonElement>) {
  const { orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();
  const isPrev = direction === "prev";
  const disabled = isPrev ? !canScrollPrev : !canScrollNext;
  const onClick = isPrev ? scrollPrev : scrollNext;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={isPrev ? "Previous slide" : "Next slide"}
      className={cn(
        "grid size-8 place-items-center rounded-full border border-line bg-ivory/90 text-ink shadow-(--shadow-e1) backdrop-blur-sm transition-all duration-300",
        "hover:border-ink/30 hover:text-volt disabled:cursor-default disabled:opacity-35",
        orientation === "horizontal"
          ? isPrev
            ? "absolute top-1/2 left-2 -translate-y-1/2"
            : "absolute top-1/2 right-2 -translate-y-1/2"
          : isPrev
            ? "absolute top-1/2 -left-10 -translate-y-1/2 rotate-90"
            : "absolute top-1/2 -right-10 -translate-y-1/2 rotate-90",
        className,
      )}
      {...props}
    >
      <Icon
        name={isPrev ? "chevron-left" : "chevron-right"}
        className="size-4"
      />
    </button>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselArrowButton,
  type CarouselApi,
};
