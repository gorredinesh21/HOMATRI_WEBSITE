"use client";

import Link from "next/link";
import { ArrowRight, Clock, Flame, Leaf, Plus, Soup, Star, Truck, Users } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { kitchenPhotos, regionLabel } from "@/lib/visuals";

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
  const { item, kitchen, photo } = dish;
  const serving = Boolean(kitchen.isCurrentlyServing);

  return (
    <article className="group bg-white rounded-3xl border border-homatri-border shadow-xs overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="relative h-44 bg-homatri-sand">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={`${item.itemName} from ${kitchen.kitchenName}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            serving ? "bg-homatri-forest text-white" : "bg-white/90 text-homatri-muted"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${serving ? "bg-green-300" : "bg-homatri-muted"}`} />
          {serving ? "Serving now" : "Pre-order"}
        </span>
        <span className="absolute top-3 right-3 bg-white/90 text-homatri-dark text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
          ₹{Math.round(item.price)}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-medium text-homatri-dark leading-snug">{item.itemName}</h3>
          <VegDot dietaryTag={item.dietaryTag} />
        </div>

        <p className="text-xs text-homatri-muted leading-relaxed">
          {kitchen.kitchenName} · {regionLabel(kitchen.regionalIdentity)}
        </p>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-homatri-dark">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {Number(kitchen.rating || 0).toFixed(1)}
          {kitchen.isVerified ? (
            <span className="ml-1 inline-flex items-center gap-1 text-homatri-forest font-medium">
              <Leaf className="w-3 h-3" /> Verified kitchen
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdd(dish)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-homatri-orange hover:bg-homatri-orange-dark text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
          <Link
            href="/order"
            className="inline-flex items-center justify-center border border-homatri-border hover:border-homatri-orange text-homatri-dark hover:text-homatri-orange text-sm font-semibold px-3.5 py-2.5 rounded-xl transition-colors"
          >
            Kitchen
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function WhatsCooking({ dishes, activeTab, onTabChange }) {
  const { addItem, openCart } = useCart();
  const { requireAuthentication } = useAuth();

  const windowDishes =
    activeTab === "LUNCH" || activeTab === "DINNER"
      ? dishes.filter((dish) =>
          activeTab === "LUNCH"
            ? ["LUNCH", "BOTH"].includes(dish.item.mealWindow)
            : ["DINNER", "BOTH"].includes(dish.item.mealWindow)
        )
      : [];

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

        <div className="mt-7 flex flex-wrap items-center gap-2" role="tablist" aria-label="Meal window">
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
        ) : windowDishes.length > 0 ? (
          <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {windowDishes.slice(0, 8).map((dish) => (
              <FoodCard key={`${dish.kitchen.chefId}-${dish.item.menuItemId}`} dish={dish} onAdd={handleAdd} />
            ))}
          </div>
        ) : (
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
        )}

        <p className="mt-6 flex items-center gap-1.5 text-xs text-homatri-muted">
          <Truck className="w-3.5 h-3.5 text-homatri-forest" />
          Pooled delivery · flat ₹11 convenience fee · sealed tiffins
        </p>
      </div>
    </section>
  );
}
