"use client";

import Image from "@/components/ui/Image";
import { useState } from "react";

type ImageComparisonProps = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
};

export default function ImageComparison({
  before,
  after,
}: ImageComparisonProps) {
  const [position, setPosition] = useState(50);

  return (
    <div
      className="relative overflow-hidden rounded-(--radius-card) border border-line bg-void"
      style={{ aspectRatio: "2000 / 1116" }}
    >
      <Image
        src={before.src}
        alt={before.alt}
        fill
        sizes="(max-width: 1023px) 92vw, 900px"
        className="object-cover"
        priority
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(max-width: 1023px) 92vw, 900px"
          className="object-cover"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-chalk shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-chalk/80 bg-void/80 text-[0.65rem] tracking-[0.12em] text-chalk">
          ↔
        </span>
      </div>
      <label className="sr-only" htmlFor="image-comparison-position">
        Compare the bracelet before and after wearing it
      </label>
      <input
        id="image-comparison-position"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between p-5 text-[0.62rem] tracking-[0.2em] text-chalk uppercase">
        <span>Cut</span>
        <span>Worn</span>
      </div>
    </div>
  );
}
