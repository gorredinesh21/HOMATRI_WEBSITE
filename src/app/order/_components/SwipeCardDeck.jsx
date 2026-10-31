"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, UtensilsCrossed } from "lucide-react";

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
      className="relative h-44 bg-homatri-cream border-b border-homatri-border overflow-hidden select-none touch-pan-y"
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
  onOrderItem,
  cartItems = [],
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
      {/* Prev / Next — above the chef card, labelled */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => {
            setHasSwipedOnce(true);
            onPrevious?.();
          }}
          className="inline-flex items-center gap-1.5 bg-white border border-homatri-border rounded-full px-4 py-2 text-sm font-bold text-homatri-dark shadow-sm hover:border-homatri-orange hover:text-homatri-orange transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs font-bold text-homatri-muted tabular-nums">
          {activeIndex + 1} / {kitchens.length}
        </span>
        <button
          type="button"
          onClick={() => {
            setHasSwipedOnce(true);
            onNext?.();
          }}
          className="inline-flex items-center gap-1.5 bg-white border border-homatri-border rounded-full px-4 py-2 text-sm font-bold text-homatri-dark shadow-sm hover:border-homatri-orange hover:text-homatri-orange transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div
        className="relative h-[620px] touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {(() => {
          const kitchen = kitchens[activeIndex];
          if (!kitchen) return null;
          const stackIndex = 0;
          const isTop = true;
          const translate = dragX;
          const rotate = dragX / 18;
          return (
            <article
              key={kitchen.chefId}
              className={`absolute inset-0 rounded-3xl overflow-hidden border border-homatri-border bg-white shadow-2xl`}
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
              <div className="h-full flex flex-col">
                <div className="shrink-0">
                  <PhotoCarousel photos={kitchenPhotos(kitchen)} alt={kitchen.kitchenName} />
                </div>
                <div className="px-4 pb-2 shrink-0 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-homatri-orange truncate">
                      {kitchen.regionalIdentity}
                    </p>
                    <h3 className="font-display text-lg font-medium text-homatri-dark leading-tight truncate">
                      {kitchen.kitchenName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      {kitchen.isCurrentlyServing ? (
                        <span className="bg-homatri-green-light text-homatri-green px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Serving now
                        </span>
                      ) : (
                        <span className="bg-homatri-cream text-homatri-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Window closed
                        </span>
                      )}
                      {kitchen.distance_km != null ? (
                        <span className="inline-flex items-center gap-0.5 bg-homatri-forest-mist text-homatri-forest px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <MapPin className="w-2.5 h-2.5" />
                          {kitchen.distance_km} km
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onCardOpen?.(kitchen.chefId)}
                        className="text-[10px] font-bold text-homatri-orange hover:underline"
                      >
                        Full profile ↗
                      </button>
                    </div>
                  </div>
                  {kitchen.isVerified ? (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-homatri-green">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : null}
                </div>

                {/* Zomato-style compact menu — scrolls inside the card */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3" data-menu-scroll>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-homatri-muted mb-1.5 sticky top-0 bg-white pt-1">
                    Menu · tap + to add
                  </p>
                  <ul className="divide-y divide-homatri-border/70">
                    {(kitchen.menuItems || []).map((item) => {
                      const inCart = cartItems.find((line) => line.menuItemId === item.menuItemId);
                      const isNonVeg = /NON/i.test(String(item.dietaryTag || ""));
                      return (
                        <li key={item.menuItemId} className="py-2.5 flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                                  isNonVeg ? "border-red-700" : "border-green-700"
                                }`}
                              >
                                <span className={`w-1 h-1 rounded-full ${isNonVeg ? "bg-red-700" : "bg-green-700"}`} />
                              </span>
                              <p className="text-[13px] font-bold text-homatri-dark leading-snug truncate">
                                {item.itemName}
                              </p>
                            </div>
                            {item.description ? (
                              <p className="text-[10px] text-homatri-muted leading-snug mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                            ) : null}
                            <p className="text-[13px] font-bold text-homatri-dark mt-1">₹{Math.round(item.price)}</p>
                          </div>
                          <div className="shrink-0 flex flex-col items-center gap-1.5">
                            <span className="w-12 h-12 rounded-xl border border-dashed border-homatri-forest/30 bg-homatri-forest-mist flex items-center justify-center overflow-hidden">
                              {item.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <UtensilsCrossed className="w-4 h-4 text-homatri-forest/40" />
                              )}
                            </span>
                            {inCart ? (
                              <span className="text-[10px] font-bold text-homatri-forest">{inCart.quantity} in cart</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onOrderItem?.(item.menuItemId, 1, null, { item, chef: kitchen })}
                                disabled={item.is_available === false}
                                className="bg-homatri-orange hover:bg-homatri-orange-dark text-white text-[11px] font-bold py-1 px-3.5 rounded-lg border border-homatri-orange-dark/20 disabled:opacity-40"
                              >
                                ADD +
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <a
                    href={`/bulk?chef=${encodeURIComponent(kitchen.chefName || kitchen.kitchenName)}`}
                    className="mt-3 block text-center text-[10px] font-bold text-homatri-muted hover:text-homatri-orange"
                  >
                    Need bulk catering from this kitchen? ➔
                  </a>
                </div>
              </div>
            </article>
          );
        })()}
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

    </div>
  );
}
