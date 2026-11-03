"use client";

import { useMemo, useState } from "react";
import { Instagram, Youtube, ShieldCheck, UtensilsCrossed, X } from "lucide-react";
import { getActiveMealWindow } from "@/lib/mealWindow";
import { toBackendMediaUrl } from "@/lib/api";

function ComboPairPicker({ combo, dishes, mealWindow, onOrderItem, chef }) {
  const [meal1, setMeal1] = useState("");
  const [meal2, setMeal2] = useState("");
  const [error, setError] = useState(null);

  if (!combo) return null;
  const d1 = dishes.find((d) => d.menuItemId === meal1);
  const d2 = dishes.find((d) => d.menuItemId === meal2);
  const pairTotal = d1 && d2 ? d1.price + d2.price : 0;
  const finalPrice = pairTotal ? pairTotal - (combo.comboDiscount || 0) : 0;

  const addPair = () => {
    if (!d1 || !d2) {
      setError("Pick both meals first.");
      return;
    }
    if (d1.menuItemId === d2.menuItemId) {
      setError("Pick two different dishes for the combo price.");
      return;
    }
    setError(null);
    for (const dish of [d1, d2]) {
      onOrderItem?.(dish.menuItemId, 1, null, {
        mealWindow,
        item: dish,
        chef,
        combo: { comboId: combo.categoryId, name: combo.name, discount: combo.comboDiscount },
      });
    }
    setMeal1("");
    setMeal2("");
  };

  return (
    <div className="bg-homatri-orange-light/50 border border-homatri-orange/30 rounded-2xl p-4 space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-homatri-dark">🍱 {combo.name}</p>
          <p className="text-[11px] text-homatri-muted">
            {combo.comboServes ? `Serves ${combo.comboServes} · ` : ""}Pick any two dishes — ₹
            {Math.round(combo.comboDiscount || 0)} off the pair
          </p>
        </div>
        {finalPrice ? (
          <p className="text-sm font-bold text-homatri-dark shrink-0">
            <span className="line-through text-homatri-muted font-normal">₹{Math.round(pairTotal)}</span> ₹
            {Math.round(finalPrice)}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { label: "Meal 1", value: meal1, set: setMeal1, exclude: meal2 },
          { label: "Meal 2", value: meal2, set: setMeal2, exclude: meal1 },
        ].map(({ label, value, set, exclude }) => (
          <select
            key={label}
            value={value}
            onChange={(e) => set(e.target.value)}
            className="w-full border border-homatri-border rounded-xl px-3 py-2 text-xs bg-white"
            aria-label={label}
          >
            <option value="">{label} — choose a dish…</option>
            {dishes
              .filter((d) => d.menuItemId !== exclude)
              .map((d) => (
                <option key={d.menuItemId} value={d.menuItemId}>
                  {d.itemName} · ₹{Math.round(d.price)}
                </option>
              ))}
          </select>
        ))}
      </div>
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={!d1 || !d2 || d1.menuItemId === d2.menuItemId}
        onClick={addPair}
        className="w-full bg-homatri-orange text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50"
      >
        {finalPrice ? `Add pair — ₹${Math.round(finalPrice)} (save ₹${Math.round(combo.comboDiscount || 0)})` : "Add the pair"}
      </button>
    </div>
  );
}

export default function ExpandedHingeProfile({ chef, onClose, onOrderItem, onFollow }) {
  // Default to the window that can still be ordered right now (after the 11:30
  // lunch cutoff the customer lands on DINNER instead of a dead LUNCH cart).
  const [activeMealWindow, setActiveMealWindow] = useState(
    getActiveMealWindow().isPastCutoff ? "LUNCH" : getActiveMealWindow().mealWindow
  );
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [dietaryNotes, setDietaryNotes] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeReel, setActiveReel] = useState(chef?.reels?.[0] || null);

  const menu = useMemo(
    () => (activeMealWindow === "DINNER" ? chef?.dinnerMenu || [] : chef?.lunchMenu || []),
    [activeMealWindow, chef]
  );

  // Category sections (backend orders dishes by category already — this keeps
  // the headers stable if the flat list is ever re-sorted).
  const menuByCategory = useMemo(() => {
    const groups = [];
    const index = new Map();
    for (const item of menu) {
      const key = item.categoryName || "More dishes";
      if (!index.has(key)) {
        const group = { name: key, items: [] };
        index.set(key, group);
        groups.push(group);
      }
      index.get(key).items.push(item);
    }
    return groups;
  }, [menu]);

  const comboCategories = useMemo(
    () => (chef?.categories || []).filter((c) => c.pricingType === "PAIR_COMBO"),
    [chef]
  );
  const comboEligible = useMemo(() => menu.filter((i) => i.availability !== "SOLD_OUT"), [menu]);

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
              comboCategories.map((combo) => (
                <ComboPairPicker
                  key={combo.categoryId}
                  combo={combo}
                  dishes={comboEligible}
                  mealWindow={activeMealWindow}
                  onOrderItem={onOrderItem}
                  chef={chef}
                />
              ))
            )}
            {menu.length === 0 ? null : menuByCategory.map((group) => (
              <div key={group.name} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-homatri-muted pt-2">
                  {group.name} · {group.items.length}
                </p>
                <ul className="divide-y divide-homatri-border/70">
                {group.items.map((item) => {
                  const qty = selectedQuantities[item.menuItemId] || 0;
                  const soldOut = item.availability === "SOLD_OUT";
                  const isNonVeg = /NON/i.test(String(item.dietaryTag || ""));
                  return (
                    <li key={item.menuItemId} className="py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                              isNonVeg ? "border-red-700" : "border-green-700"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${isNonVeg ? "bg-red-700" : "bg-green-700"}`} />
                          </span>
                          <h4 className="text-sm font-bold text-homatri-dark leading-snug">{item.itemName}</h4>
                        </div>
                        {item.description ? (
                          <p className="text-[11px] text-homatri-muted leading-snug mt-0.5">{item.description}</p>
                        ) : null}
                        <p className="text-sm font-bold text-homatri-dark mt-1">₹{item.price}</p>
                        {soldOut ? (
                          <p className="text-[10px] font-semibold text-red-600 mt-0.5">Sold out</p>
                        ) : null}
                        <input
                          type="text"
                          value={dietaryNotes[item.menuItemId] || ""}
                          onChange={(event) =>
                            setDietaryNotes((prev) => ({ ...prev, [item.menuItemId]: event.target.value }))
                          }
                          placeholder="Note — no garlic, medium spice…"
                          className="mt-1.5 w-full max-w-xs text-[11px] border border-homatri-border rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div className="shrink-0 flex flex-col items-center gap-1.5">
                        <span className="w-14 h-14 rounded-xl border border-dashed border-homatri-forest/30 bg-homatri-forest-mist flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={toBackendMediaUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <UtensilsCrossed className="w-4 h-4 text-homatri-forest/40" />
                          )}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={soldOut || qty < 1}
                            onClick={() => setQty(item.menuItemId, -1)}
                            className="w-7 h-7 rounded-lg border border-homatri-border text-sm font-bold disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{qty}</span>
                          <button
                            type="button"
                            disabled={soldOut}
                            onClick={() => setQty(item.menuItemId, 1)}
                            className="w-7 h-7 rounded-lg border border-homatri-border text-sm font-bold disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
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
                          className="bg-homatri-orange hover:bg-homatri-orange-dark text-white text-[11px] font-bold py-1 px-3.5 rounded-lg disabled:opacity-40"
                        >
                          ADD +
                        </button>
                      </div>
                    </li>
                  );
                })}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
