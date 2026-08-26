"use client";

import { useMemo, useState } from "react";
import { Instagram, Youtube, ShieldCheck, X } from "lucide-react";

export default function ExpandedHingeProfile({ chef, onClose, onOrderItem, onFollow }) {
  const [activeMealWindow, setActiveMealWindow] = useState("LUNCH");
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [dietaryNotes, setDietaryNotes] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeReel, setActiveReel] = useState(chef?.reels?.[0] || null);

  const menu = useMemo(
    () => (activeMealWindow === "DINNER" ? chef?.dinnerMenu || [] : chef?.lunchMenu || []),
    [activeMealWindow, chef]
  );

  if (!chef) return null;

  const setQty = (menuItemId, delta) => {
    setSelectedQuantities((prev) => {
      const next = Math.max(0, (prev[menuItemId] || 0) + delta);
      return { ...prev, [menuItemId]: next };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-homatri-cream overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-24">
        <div
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${chef.profileImageUrl || chef.photoUrl || "/logo.jpg"})` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 -mt-8 relative space-y-6">
          <section className="bg-white rounded-3xl border border-homatri-border p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-homatri-orange">
              {chef.hometownRegion || chef.regionalIdentity}
            </p>
            <h2 className="font-display text-2xl font-medium text-homatri-dark">{chef.kitchenName}</h2>
            <p className="text-sm text-homatri-muted">{chef.chefName}</p>
            <p className="mt-3 text-sm leading-relaxed text-homatri-dark">{chef.bio}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onFollow?.();
                  setIsFollowing(true);
                }}
                className="flex-1 bg-homatri-orange text-white font-bold py-2.5 rounded-xl text-sm"
              >
                {isFollowing ? "Following" : "Follow homemaker"}
              </button>
              {chef.instagramUrl ? (
                <a
                  href={chef.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl border border-homatri-border flex items-center justify-center"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              ) : null}
              {chef.youtubeUrl ? (
                <a
                  href={chef.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl border border-homatri-border flex items-center justify-center"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              ) : null}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-homatri-border p-5">
            <h3 className="font-display font-medium text-homatri-dark flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-homatri-green" />
              Hygiene & verification
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(chef.hygieneBadges || []).map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-semibold bg-homatri-green-light text-homatri-green px-3 py-1.5 rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href={`/bulk?chef=${encodeURIComponent(chef.chefName || chef.kitchenName)}`}
                className="block w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 px-4 rounded-2xl text-center shadow-sm uppercase tracking-wider"
              >
                📦 Request Bulk Catering from {chef.chefName} ➔
              </a>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-display font-medium text-homatri-dark">Chef&apos;s video gallery</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {(chef.reels || []).map((reel) => (
                <button
                  key={reel.reelId}
                  type="button"
                  onClick={() => setActiveReel(reel)}
                  className="shrink-0 w-28"
                >
                  <div
                    className="h-44 rounded-2xl bg-cover bg-center border border-homatri-border"
                    style={{ backgroundImage: `url(${reel.thumbnailUrl || chef.photoUrl})` }}
                  />
                </button>
              ))}
            </div>
            {activeReel?.videoUrl ? (
              <video
                key={activeReel.reelId}
                src={activeReel.videoUrl}
                poster={activeReel.thumbnailUrl}
                controls
                playsInline
                className="w-full rounded-2xl bg-black aspect-[9/16] max-h-[420px] object-cover"
              />
            ) : null}
          </section>

          <section className="bg-white rounded-3xl border border-homatri-border p-5 space-y-4">
            <div className="flex gap-2">
              {["LUNCH", "DINNER"].map((window) => (
                <button
                  key={window}
                  type="button"
                  onClick={() => setActiveMealWindow(window)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold ${
                    activeMealWindow === window
                      ? "bg-homatri-orange text-white"
                      : "bg-homatri-cream text-homatri-muted"
                  }`}
                >
                  {window === "LUNCH" ? "Lunch" : "Dinner"}
                </button>
              ))}
            </div>

            {menu.length === 0 ? (
              <p className="text-sm text-homatri-muted">No items listed for this meal window.</p>
            ) : (
              menu.map((item) => {
                const qty = selectedQuantities[item.menuItemId] || 0;
                const soldOut = item.availability === "SOLD_OUT";
                return (
                  <div key={item.menuItemId} className="border border-homatri-border rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-homatri-dark">{item.itemName}</h4>
                        <p className="text-sm text-homatri-orange font-semibold">₹{item.price}</p>
                        {soldOut ? (
                          <p className="text-xs font-semibold text-red-600 mt-1">Sold out</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={soldOut}
                          onClick={() => setQty(item.menuItemId, -1)}
                          className="w-8 h-8 rounded-lg border border-homatri-border"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                        <button
                          type="button"
                          disabled={soldOut}
                          onClick={() => setQty(item.menuItemId, 1)}
                          className="w-8 h-8 rounded-lg border border-homatri-border"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {item.supportsCustomization ? (
                      <input
                        type="text"
                        value={dietaryNotes[item.menuItemId] || ""}
                        onChange={(event) =>
                          setDietaryNotes((prev) => ({ ...prev, [item.menuItemId]: event.target.value }))
                        }
                        placeholder="Dietary note — e.g. no garlic, medium spice"
                        className="mt-3 w-full text-xs border border-homatri-border rounded-xl px-3 py-2"
                      />
                    ) : null}
                    <button
                      type="button"
                      disabled={soldOut || qty < 1}
                      onClick={() =>
                        onOrderItem?.(item.menuItemId, qty || 1, dietaryNotes[item.menuItemId], {
                          mealWindow: activeMealWindow,
                          item,
                          chef,
                        })
                      }
                      className="mt-3 w-full bg-homatri-dark text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-40"
                    >
                      Add to cart
                    </button>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
