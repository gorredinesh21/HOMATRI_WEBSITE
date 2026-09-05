"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChefHat, UtensilsCrossed, Sparkles, Star } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { kitchenPhotos } from "@/lib/visuals";

const POPULAR_CLUSTERS = ["Ghansoli", "Vashi", "Airoli"];

export default function Hero({ kitchens, dishes, regions }) {
  const router = useRouter();
  const { activeCluster, setCluster } = useLocation();
  const [searchArea, setSearchArea] = useState(activeCluster || "");

  useEffect(() => {
    if (activeCluster) setSearchArea(activeCluster);
  }, [activeCluster]);

  const collage = useMemo(() => {
    const photos = kitchens.flatMap((kitchen) => kitchenPhotos(kitchen).slice(0, 2));
    return photos.slice(0, 3);
  }, [kitchens]);

  const goToOrder = (cluster) => {
    const next = (cluster || searchArea || "Ghansoli").trim();
    setCluster(next);
    router.push(`/order?location=${encodeURIComponent(next)}`);
  };

  return (
    <section className="relative overflow-hidden bg-homatri-cream">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-homatri-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-homatri-forest/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white border border-homatri-orange/20 px-4 py-1.5 rounded-full shadow-xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-homatri-orange" />
              <span className="text-[11px] font-semibold text-homatri-orange tracking-widest uppercase">
                Managed home-kitchen network · Ghansoli, Navi Mumbai
              </span>
            </span>

            <h1 className="font-display text-[2.6rem] sm:text-5xl lg:text-6xl font-medium text-homatri-dark leading-[1.08]">
              Achha Khao. <br />
              <span className="text-homatri-orange italic font-normal">Ghar Ka Khao.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-homatri-muted leading-relaxed">
              Real homemakers from across India cook in their own kitchens — Aagri, Malvani,
              Maharashtrian and more — and we pooled-deliver their fresh thalis straight to your
              door.
            </p>

            <div className="mt-8 bg-white p-2.5 rounded-2xl shadow-md border border-homatri-border max-w-xl flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex items-center gap-3 w-full px-3 py-2">
                <Search className="w-5 h-5 text-homatri-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your locality (e.g. Ghansoli, Sector 6)…"
                  value={searchArea}
                  onChange={(event) => setSearchArea(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") goToOrder(searchArea);
                  }}
                  className="w-full text-sm font-medium focus:outline-none text-homatri-dark placeholder:text-homatri-muted"
                  aria-label="Your locality"
                />
              </div>
              <button
                type="button"
                onClick={() => goToOrder(searchArea)}
                className="w-full sm:w-auto bg-homatri-orange hover:bg-homatri-orange-dark text-white px-7 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm transition-all"
              >
                Find Food Near Me
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-homatri-muted">
              <span className="font-semibold">Popular:</span>
              {POPULAR_CLUSTERS.map((cluster) => (
                <button
                  key={cluster}
                  type="button"
                  onClick={() => goToOrder(cluster)}
                  className="bg-white hover:bg-homatri-orange-light px-2.5 py-1 rounded-lg border border-homatri-border font-medium transition-colors"
                >
                  📍 {cluster}
                </button>
              ))}
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: ChefHat, value: kitchens.length, label: "home kitchens" },
                { icon: UtensilsCrossed, value: dishes.length, label: "dishes today" },
                { icon: MapPin, value: regions.length, label: "food regions" },
                { icon: Star, value: "4.8★", label: "loved rating" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/80 border border-homatri-border rounded-2xl px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-[11px] font-medium text-homatri-muted uppercase tracking-wide">
                    <Icon className="w-3.5 h-3.5 text-homatri-forest" />
                    {label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-medium text-homatri-dark">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {collage.length > 0 ? (
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="relative h-[460px]">
                {collage.map((photo, index) => {
                  const layout = [
                    { className: "left-2 top-6 w-64 rotate-[-6deg]", z: "z-10" },
                    { className: "right-4 top-0 w-60 rotate-[5deg]", z: "z-20" },
                    { className: "right-16 bottom-4 w-72 rotate-[-3deg]", z: "z-30" },
                  ][index % 3];
                  return (
                    <div
                      key={`${photo}-${index}`}
                      className={`absolute ${layout.className} ${layout.z} bg-white p-2.5 pb-8 rounded-2xl shadow-xl border border-homatri-border`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt=""
                        className="w-full h-52 object-cover object-top rounded-xl"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  );
                })}
                <span className="absolute left-6 bottom-10 z-40 inline-flex items-center gap-1.5 bg-white text-homatri-dark text-xs font-bold px-3.5 py-2 rounded-full shadow-lg border border-homatri-border">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.8 loved by locals
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
