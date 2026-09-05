"use client";

import { BadgeIndianRupee, Clock, ShieldCheck, Star, Truck, Package, Search } from "lucide-react";

const DELIVERY_POINTS = [
  {
    icon: Truck,
    title: "One rider, one round",
    body: "Orders from the same kitchen to the same society ride together. You pay for a seat in the van, not the whole van.",
  },
  {
    icon: Clock,
    title: "Fixed meal windows",
    body: "Lunch lands before 1:30 PM (order by 11:30 AM), dinner before 8:30 PM (order by 6:30 PM). Fresh, not fast-food fast.",
  },
  {
    icon: BadgeIndianRupee,
    title: "₹11, always",
    body: "A flat ₹11 convenience fee on every order. No surge, no rain charge, no distance games.",
  },
];

function TrustPoint({ icon: Icon, title, body }) {
  return (
    <li className="flex gap-3.5">
      <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-homatri-forest-mist text-homatri-forest">
        <Icon className="w-4.5 h-4.5" />
      </span>
      <div>
        <h4 className="text-sm font-bold text-homatri-dark">{title}</h4>
        <p className="mt-1 text-xs text-homatri-muted leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

export default function TrustPanel({ kitchens }) {
  const fssaiCount = kitchens.filter((kitchen) =>
    (kitchen.hygieneBadges || []).some((badge) => /FSSAI/i.test(badge))
  ).length;

  return (
    <section id="trust" className="bg-homatri-sand scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
            Value + trust
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
            A Home Kitchen You Can Trust
          </h2>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          <article className="bg-white rounded-3xl border border-homatri-border p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl font-medium text-homatri-dark">
              Why is the fee only ₹11?
            </h3>
            <p className="mt-2 text-sm text-homatri-muted leading-relaxed">
              Because your neighbour&apos;s order rides with yours. Pooled delivery is how home
              food stays affordable:
            </p>
            <ul className="mt-6 space-y-5">
              {DELIVERY_POINTS.map((point) => (
                <TrustPoint key={point.title} {...point} />
              ))}
            </ul>
          </article>

          <article className="bg-homatri-forest text-white rounded-3xl p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl font-medium">
              Every kitchen, checked before it cooks
            </h3>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Behind every thali is a person with a name, a home and an inspection report.
            </p>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-3.5">
                <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-white/10 text-white">
                  <Search className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold">Kitchen verification visit</h4>
                  <p className="mt-1 text-xs text-white/70 leading-relaxed">
                    {kitchens.filter((kitchen) => kitchen.isVerified).length} of {kitchens.length}{" "}
                    live kitchens personally inspected by the Homatri team.
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5">
                <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-white/10 text-white">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold">FSSAI registered cooking</h4>
                  <p className="mt-1 text-xs text-white/70 leading-relaxed">
                    {fssaiCount > 0
                      ? `${fssaiCount} kitchen${fssaiCount > 1 ? "s" : ""} carry a valid FSSAI licence — the rest are in registration.`
                      : "Kitchens are onboarded with FSSAI registration as part of verification."}
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5">
                <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-white/10 text-white">
                  <Package className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold">Sealed tiffin packaging</h4>
                  <p className="mt-1 text-xs text-white/70 leading-relaxed">
                    Food leaves the kitchen sealed. It reaches you the way it left the stove.
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5">
                <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-white/10 text-white">
                  <Star className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold">Reviews from real orders</h4>
                  <p className="mt-1 text-xs text-white/70 leading-relaxed">
                    Ratings come only from delivered, paid orders — no anonymous stars.
                  </p>
                </div>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
