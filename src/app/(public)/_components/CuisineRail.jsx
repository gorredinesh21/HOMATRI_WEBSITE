"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { kitchenPhotos } from "@/lib/visuals";
import { ALL_REGIONS, CUISINE_TREE, cuisineRequestUrl } from "@/lib/cuisineTree";

// Circular cuisine cards get a real photo when kitchens in that cuisine are
// live; upcoming cuisines render dashed with a WhatsApp request instead of a
// dead filter link.
function cuisinePhoto(kitchens, liveValues) {
  const kitchen = kitchens.find((entry) => {
    const value = entry.regionalIdentity || entry.hometownRegion;
    return liveValues.includes(value);
  });
  return kitchen ? kitchenPhotos(kitchen)[0] || null : null;
}

export default function CuisineRail({ kitchens }) {
  const liveRegionValues = useMemo(
    () => [...new Set(kitchens.map((entry) => entry.regionalIdentity || entry.hometownRegion).filter(Boolean))],
    [kitchens]
  );
  const [region, setRegion] = useState("Maharashtra"); // launch region, pinned by default

  // /?region=South India#cuisines — deep-link from hero popular searches.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("region");
    if (requested && ALL_REGIONS.includes(requested)) setRegion(requested);
  }, []);

  const cuisines = CUISINE_TREE.find((entry) => entry.region === region)?.cuisines || [];

  return (
    <section id="cuisines" className="bg-homatri-sand scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
            Regional discovery
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
            One City. A Hundred Tastes of India.
          </h2>
          <p className="mt-4 text-base text-homatri-muted leading-relaxed">
            Navi Mumbai is built by people from everywhere — and so is its food. Pick your region,
            find its cuisines, and see what&apos;s cooking live. Green dot means a kitchen is
            serving it today.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 flex-wrap" aria-label="Regions of India">
          {ALL_REGIONS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setRegion(name)}
              className={`text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full border transition-colors ${
                region === name
                  ? "bg-homatri-forest text-white border-homatri-forest shadow-sm"
                  : "bg-white text-homatri-muted border-homatri-border hover:border-homatri-forest hover:text-homatri-forest"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-3">
          <ul className="flex items-stretch gap-5 sm:gap-6 w-max">
            {cuisines.map((cuisine) => {
              const live = cuisine.liveValues.some((value) => liveRegionValues.includes(value));
              const photo = live ? cuisinePhoto(kitchens, cuisine.liveValues) : null;

              if (live) {
                return (
                  <li key={cuisine.label} className="w-[104px] shrink-0">
                    <Link
                      href={`/order?cuisine=${encodeURIComponent(cuisine.liveValues.find((value) => liveRegionValues.includes(value)))}`}
                      className="group flex flex-col items-center text-center gap-2.5"
                    >
                      <span className="relative w-[92px] h-[92px] sm:w-24 sm:h-24 rounded-full overflow-hidden ring-[3px] ring-white shadow-md group-hover:ring-homatri-orange group-hover:scale-[1.04] transition-all">
                        {photo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={photo} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                        ) : (
                          <span className="w-full h-full inline-flex items-center justify-center bg-homatri-forest-mist font-display text-2xl text-homatri-forest">
                            {cuisine.label.slice(0, 1)}
                          </span>
                        )}
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-homatri-forest border-2 border-white" title="Serving now" />
                      </span>
                      <span className="block text-[13px] font-bold text-homatri-dark group-hover:text-homatri-orange leading-tight transition-colors">
                        {cuisine.label}
                      </span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={cuisine.label} className="w-[104px] shrink-0">
                  <a
                    href={cuisineRequestUrl(cuisine.label)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center text-center gap-2.5"
                    title="Coming soon — request it on WhatsApp"
                  >
                    <span className="w-[92px] h-[92px] sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-homatri-forest/30 bg-white/60 flex flex-col items-center justify-center text-homatri-forest/70 group-hover:border-homatri-forest group-hover:text-homatri-forest transition-colors">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-[9px] font-bold uppercase tracking-wide mt-1">soon</span>
                    </span>
                    <span className="block text-[13px] font-semibold text-homatri-muted group-hover:text-homatri-forest leading-tight transition-colors">
                      {cuisine.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-homatri-muted">
          <MessageCircle className="w-3.5 h-3.5" />
          Don&apos;t see your food? Tap any upcoming cuisine to ask us to bring it — the most
          requested regions get cooks first.
        </p>
      </div>
    </section>
  );
}
