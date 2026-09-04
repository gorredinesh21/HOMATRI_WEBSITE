"use client";

import { useEffect, useRef } from "react";
import VerticalReelPlayer from "./VerticalReelPlayer";

export default function ReelFeed({ reels, activeIndex, onActiveChange, onLike, onComment, onFollow, onOrderDish }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;
    const sections = Array.from(root.querySelectorAll("[data-reel-index]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number(visible.target.getAttribute("data-reel-index"));
        if (!Number.isNaN(index)) onActiveChange?.(index);
      },
      { root, threshold: 0.6 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [reels, onActiveChange]);

  // Preload the neighbouring reel photos so the snap transition doesn't
  // flash a blank frame mid-scroll.
  useEffect(() => {
    if (typeof window === "undefined" || activeIndex == null) return;
    [activeIndex - 1, activeIndex + 1].forEach((i) => {
      const reel = reels[i];
      const url = reel?.videoUrl || reel?.thumbnailUrl;
      if (url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = url;
      }
    });
  }, [reels, activeIndex]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100dvh-8.5rem)] overflow-y-scroll snap-y snap-mandatory overscroll-contain scroll-smooth"
    >
      {reels.length === 0 ? (
        <div className="h-full flex items-center justify-center px-4">
          <div className="rounded-3xl border border-dashed border-homatri-border bg-white p-10 text-center max-w-sm">
            <p className="text-sm font-bold text-homatri-dark">No reels yet</p>
            <p className="text-xs text-homatri-muted mt-1">
              Kitchens are still filming — check back soon for fresh kitchen stories.
            </p>
          </div>
        </div>
      ) : null}
      {reels.map((reel, index) => (
        <section key={reel.reelId} data-reel-index={index} className="h-full snap-start snap-always">
          <VerticalReelPlayer
            reel={reel}
            isActive={index === activeIndex}
            onView={() => onActiveChange?.(index)}
            onLike={onLike}
            onComment={onComment}
            onFollow={onFollow}
            onOrderDish={onOrderDish}
          />
        </section>
      ))}
    </div>
  );
}
