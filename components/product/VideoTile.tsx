"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icons";
import { playMuted } from "@/lib/media/autoplay";
import type { CatalogVideo } from "@/lib/product";

/**
 * Click-to-play video: only the poster loads until the visitor asks for the
 * video (preload="none"), so video never competes with LCP. Native controls.
 *
 * The frame letterboxes instead of cropping (`object-contain`): the shots are
 * vertical (9:16) and the gallery stage is not, so covering the frame would cut
 * the top and bottom off the picture.
 */
export function VideoTile({
  video,
  alt,
  className,
  active,
}: {
  video: CatalogVideo;
  alt: string;
  className?: string;
  /** Whether this slide is the one on stage: it autoplays (muted) on arrival and pauses on leaving. */
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const mounted = useRef(false);

  // Only react to the visitor moving to or away from the slide — never
  // autoplay on first paint, so the video stays out of the LCP path.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const first = !mounted.current;
    mounted.current = true;
    if (!active) {
      if (!first) el.pause();
      return;
    }
    if (first) return;
    let wanted = true;
    const stop = playMuted(el, () => wanted);
    return () => {
      wanted = false;
      stop();
    };
  }, [active]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <video
        ref={ref}
        className="absolute inset-0 size-full bg-ink object-contain"
        poster={video.poster}
        preload="none"
        playsInline
        controls={playing}
        aria-label={alt}
        onPlay={() => setPlaying(true)}
      >
        {video.sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
      {!playing && (
        <button
          type="button"
          onClick={() => {
            void ref.current?.play();
          }}
          className="group absolute inset-0 grid place-items-center bg-linear-to-t from-ink/35 via-transparent to-transparent"
          aria-label={`Play video: ${alt}`}
        >
          <span className="glass grid size-18 place-items-center rounded-full text-ink transition-transform duration-300 group-hover:scale-105">
            <Icon name="play" className="size-6 translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  );
}
