"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, Flame, MapPin, Plus, Soup, Star, Truck, Users, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { regionLabel } from "@/lib/visuals";
import { ALL_REGIONS, cuisinesForRegion, cuisineRequestUrl, defaultRegion } from "@/lib/cuisineTree";

const TABS = [
  { id: "LUNCH", label: "Lunch", hint: "11:30 AM cutoff" },
  { id: "DINNER", label: "Dinner", hint: "6:30 PM cutoff" },
  { id: "TIFFIN", label: "Tiffin Plans", hint: "monthly & bulk" },
];

const TIFFIN_PLANS = [
  {
    icon: Users,
    title: "Monthly Tiffin Plans",
    body: "Lock in daily lunch or dinner thalis for the whole month. One kitchen, one fixed time, zero re-ordering.",
    cta: "Plan my tiffin",
  },
  {
    icon: Soup,
    title: "Office & Team Lunches",
    body: "Bulk home-cooked lunches delivered together to your office — pooled delivery keeps it cheap and hot.",
    cta: "Get a bulk quote",
  },
  {
    icon: Flame,
    title: "Events & Small Parties",
    body: "Regional home cooks catering your function with real ghar-ka-khana, not banquet mush.",
    cta: "Plan my event",
  },
];

function VegDot({ dietaryTag }) {
  const isNonVeg = /NON/i.test(String(dietaryTag || ""));
  return (
    <span
      title={isNonVeg ? "Non-vegetarian" : "Vegetarian"}
      className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border-2 ${
        isNonVeg ? "border-red-700" : "border-green-700"
      } bg-white`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isNonVeg ? "bg-red-700" : "bg-green-700"}`} />
    </span>
  );
}

function FoodCard({ dish, onAdd }) {
  const { item, kitchen } = dish;
  const serving = Boolean(kitchen.isCurrentlyServing);
  const isNonVeg = /NON/i.test(String(item.dietaryTag || ""));

  return (
    <article
      className={`group relative bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all ${
        isNonVeg ? "border-red-100" : "border-green-100"
      }`}
    >
      <span
        className={`h-1.5 w-full ${isNonVeg ? "bg-red-500/80" : "bg-homatri-forest/80"}`}
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg sm:text-xl font-medium text-homatri-dark leading-snug">
            {item.itemName}
          </h3>
          <VegDot dietaryTag={item.dietaryTag} />
        </div>

        <p className="text-xs text-homatri-muted leading-relaxed">
          {kitchen.kitchenName} · {regionLabel(kitchen.regionalIdentity)}
        </p>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-homatri-dark">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {Number(kitchen.rating || 0).toFixed(1)}
          <span
            className={`ml-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              serving ? "bg-homatri-green-light text-homatri-forest" : "bg-homatri-sand text-homatri-muted"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${serving ? "bg-homatri-forest" : "bg-homatri-muted"}`} />
            {serving ? "Serving now" : "Pre-order"}
          </span>
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2 border-t border-homatri-border/60">
          <span className="font-display text-2xl font-medium text-homatri-dark">₹{Math.round(item.price)}</span>
          <span className="text-[11px] text-homatri-muted">/ plate</span>
          <button
            type="button"
            onClick={() => onAdd(dish)}
            className="ml-auto inline-flex items-center justify-center gap-1.5 bg-homatri-orange hover:bg-homatri-orange-dark text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WhatsCooking({ dishes, activeTab, onTabChange }) {
  const { addItem, openCart } = useCart();
  const { requireAuthentication } = useAuth();

  const liveRegionValues = useMemo(
    () => [...new Set(dishes.map((dish) => dish.kitchen.regionalIdentity || dish.kitchen.hometownRegion).filter(Boolean))],
    [dishes]
  );
  const [region, setRegion] = useState(defaultRegion(liveRegionValues));
  const [cuisine, setCuisine] = useState(null); // null = all cuisines in the region

  const regionCuisines = cuisinesForRegion(region);
  const liveValuesInRegion = useMemo(
    () => new Set(regionCuisines.flatMap((entry) => entry.liveValues)),
    [regionCuisines]
  );
  const regionHasLive = useMemo(
    () => liveRegionValues.some((value) => liveValuesInRegion.has(value)),
    [liveRegionValues, liveValuesInRegion]
  );

  const selectedCuisine = cuisine ? regionCuisines.find((entry) => entry.label === cuisine) : null;

  const windowDishes = useMemo(() => {
    if (activeTab !== "LUNCH" && activeTab !== "DINNER") return [];
    return dishes.filter((dish) => {
      const mealOk =
        activeTab === "LUNCH"
          ? ["LUNCH", "BOTH"].includes(dish.item.mealWindow)
          : ["DINNER", "BOTH"].includes(dish.item.mealWindow);
      const regionValue = dish.kitchen.regionalIdentity || dish.kitchen.hometownRegion;
      const regionOk = liveValuesInRegion.has(regionValue);
      const cuisineOk = !selectedCuisine || selectedCuisine.liveValues.includes(regionValue);
      return mealOk && regionOk && cuisineOk;
    });
  }, [dishes, activeTab, liveValuesInRegion, selectedCuisine]);

  const handleAdd = (dish) => {
    requireAuthentication(() => {
      addItem({
        menuItemId: dish.item.menuItemId,
        chefId: dish.kitchen.chefId,
        itemName: dish.item.itemName,
        quantity: 1,
        mealWindow: activeTab === "DINNER" ? "DINNER" : "LUNCH",
        unitPriceDisplay: dish.item.price,
        lineTotalDisplay: dish.item.price,
      });
      openCart();
    });
  };

  const showDishes = activeTab === "LUNCH" || activeTab === "DINNER";

  return (
    <section id="whats-cooking" className="bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
              Serving in Ghansoli today
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
              What&apos;s Cooking Near You Today?
            </h2>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-homatri-orange hover:text-homatri-orange-dark"
          >
            View all menus <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Meal window">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-colors ${
                  activeTab === tab.id
                    ? "bg-homatri-forest text-white border-homatri-forest shadow-sm"
                    : "bg-white text-homatri-muted border-homatri-border hover:border-homatri-forest hover:text-homatri-forest"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-medium ${activeTab === tab.id ? "text-white/70" : "text-homatri-muted/70"}`}>
                  {tab.hint}
                </span>
              </button>
            ))}
          </div>

          {showDishes ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-homatri-dark">
                <MapPin className="w-3.5 h-3.5 text-homatri-forest" />
                <span className="sr-only">Region</span>
                <select
                  value={region}
                  onChange={(event) => {
                    setRegion(event.target.value);
                    setCuisine(null);
                  }}
                  className="bg-homatri-cream border border-homatri-border rounded-full px-3.5 py-2 text-xs font-bold text-homatri-dark focus:outline-none focus:border-homatri-forest cursor-pointer"
                  aria-label="Select region"
                >
                  {ALL_REGIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-1.5 flex-wrap" aria-label="Cuisines in region">
                <button
                  type="button"
                  onClick={() => setCuisine(null)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    cuisine === null
                      ? "bg-homatri-dark text-white border-homatri-dark"
                      : "bg-white text-homatri-muted border-homatri-border hover:border-homatri-dark"
                  }`}
                >
                  All
                </button>
                {regionCuisines.map((entry) => {
                  const live = entry.liveValues.some((value) => liveRegionValues.includes(value));
                  const selected = cuisine === entry.label;
                  return (
                    <button
                      key={entry.label}
                      type="button"
                      onClick={() => setCuisine(selected ? null : entry.label)}
                      title={live ? "Serving now" : "Coming soon"}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        selected
                          ? "bg-homatri-dark text-white border-homatri-dark"
                          : live
                            ? "bg-white text-homatri-forest border-homatri-forest/40 hover:border-homatri-forest"
                            : "bg-homatri-sand/60 text-homatri-muted/80 border-dashed border-homatri-border hover:text-homatri-muted"
                      }`}
                    >
                      {entry.label}
                      {live ? <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-homatri-forest align-middle" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {activeTab === "TIFFIN" ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TIFFIN_PLANS.map(({ icon: Icon, title, body, cta }) => (
              <article
                key={title}
                className="bg-homatri-cream border border-homatri-border rounded-3xl p-6 flex flex-col hover:border-homatri-forest/40 transition-colors"
              >
                <span className="w-11 h-11 inline-flex items-center justify-center rounded-2xl bg-homatri-forest-mist text-homatri-forest">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium text-homatri-dark">{title}</h3>
                <p className="mt-2 text-sm text-homatri-muted leading-relaxed flex-1">{body}</p>
                <Link
                  href="/bulk"
                  className="mt-5 inline-flex items-center justify-center gap-1.5 bg-homatri-forest hover:bg-homatri-forest-deep text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        ) : showDishes && selectedCuisine && selectedCuisine.liveValues.length === 0 ? (
          <div className="mt-8 bg-homatri-cream border border-dashed border-homatri-border rounded-3xl p-10 text-center">
            <UtensilsCrossed className="w-8 h-8 text-homatri-forest mx-auto" />
            <p className="mt-3 font-display text-xl text-homatri-dark">
              {selectedCuisine.label} kitchens are coming soon.
            </p>
            <p className="mt-1 text-sm text-homatri-muted">
              We&apos;re onboarding cooks from this region right now — tell us you want it and we&apos;ll hurry.
            </p>
            <a
              href={cuisineRequestUrl(selectedCuisine.label)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 bg-homatri-forest hover:bg-homatri-forest-deep text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Request {selectedCuisine.label} food <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : showDishes && windowDishes.length === 0 && !regionHasLive ? (
          <div className="mt-8 bg-homatri-cream border border-dashed border-homatri-border rounded-3xl p-10 text-center">
            <UtensilsCrossed className="w-8 h-8 text-homatri-forest mx-auto" />
            <p className="mt-3 font-display text-xl text-homatri-dark">
              {region} kitchens are coming soon.
            </p>
            <p className="mt-1 text-sm text-homatri-muted">
              We&apos;re onboarding cooks from {region} right now — the most requested regions get
              cooks first.
            </p>
            <a
              href={cuisineRequestUrl(`${region} food`)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 bg-homatri-forest hover:bg-homatri-forest-deep text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Request {region} food <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : showDishes && windowDishes.length > 0 ? (
          <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {windowDishes.slice(0, 8).map((dish) => (
              <FoodCard key={`${dish.kitchen.chefId}-${dish.item.menuItemId}`} dish={dish} onAdd={handleAdd} />
            ))}
          </div>
        ) : showDishes ? (
          <div className="mt-8 bg-homatri-cream border border-dashed border-homatri-border rounded-3xl p-10 text-center">
            <Clock className="w-8 h-8 text-homatri-forest mx-auto" />
            <p className="mt-3 font-display text-xl text-homatri-dark">
              Nothing live in this window right now.
            </p>
            <p className="mt-1 text-sm text-homatri-muted">
              Kitchens refresh daily — lunch opens in the morning, dinner after 3 PM.
            </p>
            <Link
              href="/order"
              className="mt-5 inline-flex items-center gap-1.5 bg-homatri-orange hover:bg-homatri-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Browse all kitchens <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : null}

        <p className="mt-6 flex items-center gap-1.5 text-xs text-homatri-muted">
          <Truck className="w-3.5 h-3.5 text-homatri-forest" />
          Pooled delivery · sealed tiffins · fixed meal windows
        </p>
      </div>
    </section>
  );
}
