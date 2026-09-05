"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, ShieldCheck } from "lucide-react";

const isPhotoUrl = (url) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(String(url || ""));

function kitchenPhotos(kitchen) {
  const urls = [kitchen.photoUrl || kitchen.profileImageUrl];
  for (const reel of kitchen.reels || []) {
    const url = reel.videoUrl || reel.thumbnailUrl;
    if (url && isPhotoUrl(url)) urls.push(url);
  }
  return [...new Set(urls.filter(Boolean))];
}

// Instagram-style multi-photo carousel with horizontal swipe, dots and chevrons.
// Own pointer handling (stopPropagation) so photo swipes don't swipe the card.
function PhotoCarousel({ photos, alt }) {
  const [index, setIndex] = useState(0);
  const startX = useRef(null);
  const count = photos.length;

  const go = (next) => setIndex(((next % count) + count) % count);

  const onPointerDown = (e) => {
    e.stopPropagation();
    startX.current = e.clientX;
  };
  const onPointerUp = (e) => {
    e.stopPropagation();
    if (startX.current == null) return;
    const delta = e.clientX - startX.current;
    startX.current = null;
    if (delta < -40) go(index + 1);
    else if (delta > 40) go(index - 1);
  };

  useEffect(() => {
    setIndex(0);
  }, [photos.join("|")]);

  return (
    <div
      data-photo-carousel={count > 1 ? "multi" : undefined}
      className="relative h-72 bg-homatri-cream border-b border-homatri-border overflow-hidden select-none touch-pan-y"
      onPointerDown={count > 1 ? onPointerDown : undefined}
      onPointerUp={count > 1 ? onPointerUp : undefined}
    >
      {count > 1 ? (
        <div
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`${alt} — photo ${i + 1}`}
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full shrink-0 object-contain"
            />
          ))}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photos[0] || "/logo.jpg"}
          alt={alt}
          draggable={false}
          className="h-full w-full object-contain"
        />
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(index - 1); }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(index + 1); }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 rounded-full px-2 py-1">
            {photos.map((url, i) => (
              <span
                key={url}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/45 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {index + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}

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
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);
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
    setHasSwipedOnce(true);
    if (delta > 80) {
      onSwipeRight?.(current?.chefId);
      onNext?.();
    } else if (delta < -80) {
      onSwipeLeft?.(current?.chefId);
      onPrevious?.();
    }
  };

  const onPointerDown = (event) => {
    // Only a MULTI-photo carousel owns horizontal swipes (photo paging).
    // Single-photo cards let the swipe through to move the deck — otherwise
    // swiping the photo (the most natural gesture) does nothing.
    if (event.target.closest?.('[data-photo-carousel="multi"]')) return;
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
        className="relative h-[560px] touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {kitchens.slice(activeIndex, activeIndex + 3).map((kitchen, stackIndex) => {
          const isTop = stackIndex === 0;
          const translate = isTop ? dragX : 0;
          const rotate = isTop ? dragX / 18 : 0;
          // Tinder-style floating stack: the next cards peek out on BOTH sides,
          // slightly rotated — so it's obvious there are more cards to swipe.
          const stackFloat =
            stackIndex === 1
              ? "rotate-[3deg] translate-x-5 translate-y-3"
              : stackIndex === 2
              ? "-rotate-[2.5deg] -translate-x-5 translate-y-6"
              : "";
          return (
            <article
              key={kitchen.chefId}
              className={`absolute inset-0 rounded-3xl overflow-hidden border border-homatri-border bg-white shadow-2xl ${stackFloat} ${
                isTop && !hasSwipedOnce ? "reel-card-wiggle" : ""
              }`}
              style={{
                transform: isTop ? `translateX(${translate}px) rotate(${rotate}deg)` : undefined,
                zIndex: 10 - stackIndex,
                opacity: 1 - stackIndex * 0.12,
                transition: isDragging && isTop ? "none" : "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Drag direction feedback — Tinder-style labels */}
              {isTop && dragX > 40 ? (
                <span className="absolute top-4 left-4 z-20 rotate-[-8deg] bg-homatri-green text-white font-black text-lg px-3 py-1 rounded-xl border-2 border-white/60 shadow-lg tracking-wider">
                  NEXT →
                </span>
              ) : null}
              {isTop && dragX < -40 ? (
                <span className="absolute top-4 right-4 z-20 rotate-[8deg] bg-homatri-orange text-white font-black text-lg px-3 py-1 rounded-xl border-2 border-white/60 shadow-lg tracking-wider">
                  ← PREVIOUS
                </span>
              ) : null}
              <PhotoCarousel photos={kitchenPhotos(kitchen)} alt={kitchen.kitchenName} />
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

      {/* Swipe teacher — always visible until the user swipes once */}
      {!hasSwipedOnce ? (
        <div className="flex items-center justify-center gap-2 mt-3 animate-pulse">
          <ChevronLeft className="w-4 h-4 text-homatri-muted" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-homatri-muted">
            Swipe the card — right for next, left for previous
          </span>
          <ChevronRight className="w-4 h-4 text-homatri-muted" />
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={() => {
            setHasSwipedOnce(true);
            onPrevious?.();
          }}
          className="w-11 h-11 rounded-full border border-homatri-border bg-white flex items-center justify-center shadow-sm hover:shadow"
          aria-label="Previous kitchen"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-homatri-muted">
          {activeIndex + 1} / {kitchens.length}
        </span>
        <button
          type="button"
          onClick={() => {
            setHasSwipedOnce(true);
            onNext?.();
          }}
          className="w-11 h-11 rounded-full border border-homatri-border bg-white flex items-center justify-center shadow-sm hover:shadow"
          aria-label="Next kitchen"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
