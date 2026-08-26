"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, ShieldCheck } from "lucide-react";

export default function SwipeCardDeck({
  kitchens = [],
  activeIndex = 0,
  onCardOpen,
  onSwipeLeft,
  onSwipeRight,
  onNext,
  onPrevious,
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const current = kitchens[activeIndex] || null;

  if (!kitchens.length) {
    return (
      <div className="rounded-3xl border border-dashed border-homatri-border bg-white p-10 text-center text-sm text-homatri-muted">
        No kitchens match these filters in your cluster right now.
      </div>
    );
  }

  const finishDrag = (delta) => {
    setIsDragging(false);
    setDragX(0);
    if (delta > 80) {
      onSwipeRight?.(current?.chefId);
      onPrevious?.();
    } else if (delta < -80) {
      onSwipeLeft?.(current?.chefId);
      onNext?.();
    }
  };

  const onPointerDown = (event) => {
    startX.current = event.clientX;
    setIsDragging(true);
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    setDragX(event.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    finishDrag(dragX);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <div
        className="relative h-[520px] touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {kitchens.slice(activeIndex, activeIndex + 3).map((kitchen, stackIndex) => {
          const isTop = stackIndex === 0;
          const translate = isTop ? dragX : 0;
          const rotate = isTop ? dragX / 18 : 0;
          return (
            <article
              key={kitchen.chefId}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-homatri-border bg-white shadow-lg"
              style={{
                transform: `translateX(${translate}px) rotate(${rotate}deg) scale(${1 - stackIndex * 0.04}) translateY(${stackIndex * 12}px)`,
                zIndex: 10 - stackIndex,
                opacity: 1 - stackIndex * 0.08,
                transition: isDragging && isTop ? "none" : "transform 200ms ease",
              }}
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${kitchen.photoUrl || kitchen.profileImageUrl || "/logo.jpg"})`,
                }}
              />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-homatri-orange">
                      {kitchen.regionalIdentity}
                    </p>
                    <h3 className="font-display text-xl font-medium text-homatri-dark leading-tight">
                      {kitchen.kitchenName}
                    </h3>
                    <p className="text-sm text-homatri-muted">{kitchen.chefName}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {kitchen.rating ?? "—"}
                  </div>
                </div>
                <p className="text-sm text-homatri-dark">
                  <span className="text-homatri-muted">Today&apos;s special: </span>
                  <strong>{kitchen.signatureDish || "Chef&apos;s tiffin"}</strong>
                  {kitchen.pricePreview != null ? ` · ₹${kitchen.pricePreview}` : ""}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  {kitchen.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-homatri-green font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified kitchen
                    </span>
                  ) : null}
                  {kitchen.isCurrentlyServing ? (
                    <span className="bg-homatri-green-light text-homatri-green px-2 py-0.5 rounded-full font-semibold">
                      Serving now
                    </span>
                  ) : (
                    <span className="bg-homatri-cream text-homatri-muted px-2 py-0.5 rounded-full font-semibold">
                      Window closed
                    </span>
                  )}
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onCardOpen?.(kitchen.chefId)}
                    className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl text-sm"
                  >
                    Open profile & menu
                  </button>
                  <a
                    href={`/bulk?chef=${encodeURIComponent(kitchen.chefName || kitchen.kitchenName)}`}
                    className="block w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs text-center uppercase tracking-wider"
                  >
                    📦 Request Bulk Catering from {kitchen.chefName || "Chef"} ➔
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden md:flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="w-11 h-11 rounded-full border border-homatri-border bg-white flex items-center justify-center"
          aria-label="Previous kitchen"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-homatri-muted">
          {activeIndex + 1} / {kitchens.length}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="w-11 h-11 rounded-full border border-homatri-border bg-white flex items-center justify-center"
          aria-label="Next kitchen"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
