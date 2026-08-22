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
      { root, threshold: 0.65 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [reels, onActiveChange]);

  return (
    <div ref={containerRef} className="h-[calc(100dvh-8.5rem)] overflow-y-scroll snap-y snap-mandatory">
      {reels.map((reel, index) => (
        <section key={reel.reelId} data-reel-index={index} className="h-full snap-start">
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
