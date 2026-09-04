"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { fetchPublicChefs } from "@/lib/api";

const BADGE_STYLES = [
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
];

export default function KitchenSpotlight() {
  const [kitchens, setKitchens] = useState([]);
  const [status, setStatus] = useState("LOADING");
  const [error, setError] = useState("");

  const loadKitchens = useCallback(async () => {
    setStatus("LOADING");
    setError("");
    try {
      const remote = await fetchPublicChefs();
      const list = Array.isArray(remote) ? remote : remote?.chefs || remote?.data;
      setKitchens(Array.isArray(list) ? list.slice(0, 4) : []);
      setStatus("READY");
    } catch (err) {
      setKitchens([]);
      setError(err?.message || "Could not load kitchens.");
      setStatus("ERROR");
    }
  }, []);

  useEffect(() => {
    loadKitchens();
  }, [loadKitchens]);

  return (
    <section id="kitchens" className="py-20 bg-homatri-cream border-b border-homatri-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold text-homatri-orange tracking-wider uppercase bg-white border border-homatri-orange/20 px-3.5 py-1 rounded-full shadow-xs">
              Local Home Kitchens
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-medium text-homatri-dark leading-snug">
              Featured Homemakers In Ghansoli
            </h2>
            <p className="mt-1 text-sm text-homatri-muted font-normal">
              Verified kitchens prepared with authentic regional recipes and fresh ingredients.
            </p>
          </div>

          <Link
            href="/order"
            className="inline-flex items-center gap-1 text-sm font-semibold text-homatri-orange hover:text-homatri-orange-dark transition-colors"
          >
            <span>View All Kitchens</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Kitchen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {status === "LOADING"
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-homatri-border p-6 h-72 animate-pulse"
                />
              ))
            : null}

          {status === "ERROR" ? (
            <div className="lg:col-span-4 bg-white rounded-3xl border border-dashed border-red-200 p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                type="button"
                onClick={loadKitchens}
                className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Try again
              </button>
            </div>
          ) : null}

          {status === "READY" && kitchens.length === 0 ? (
            <div className="lg:col-span-4 bg-white rounded-3xl border border-dashed border-homatri-border p-10 text-center">
              <p className="text-sm font-bold text-homatri-dark">Kitchens are joining soon.</p>
              <p className="text-xs text-homatri-muted mt-1">
                New homemakers are being verified — check back shortly.
              </p>
            </div>
          ) : null}

          {status === "READY"
            ? kitchens.map((k, index) => (
                <div
                  key={k.chefId || k.kitchenName}
                  className="bg-white rounded-3xl border border-homatri-border shadow-xs hover:shadow transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6">

                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${BADGE_STYLES[index % BADGE_STYLES.length]}`}>
                        {(k.regionalIdentity || "Home Kitchen").toUpperCase()}
                      </span>
                      {k.rating > 0 ? (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{Number(k.rating).toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="bg-homatri-green-light text-homatri-green px-2 py-0.5 rounded-md text-[10px] font-bold">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Kitchen Name & Chef */}
                    <h3 className="font-display text-xl font-medium text-homatri-dark leading-snug">
                      {k.kitchenName}
                    </h3>
                    <p className="text-xs font-semibold text-homatri-orange mt-0.5">
                      {k.chefName}
                    </p>

                    {k.locality ? (
                      <div className="flex items-center gap-1 text-xs text-homatri-muted mt-2">
                        <MapPin className="w-3.5 h-3.5 text-homatri-muted" />
                        <span>{k.locality}</span>
                      </div>
                    ) : null}

                    {/* Signature Dish */}
                    {k.signatureDish ? (
                      <div className="mt-4 pt-4 border-t border-homatri-border/60">
                        <span className="text-[11px] font-medium text-homatri-muted uppercase tracking-wider block">
                          Signature Dish:
                        </span>
                        <p className="text-xs font-bold text-homatri-dark mt-0.5">
                          {k.signatureDish}
                        </p>
                      </div>
                    ) : null}

                    {/* Price Preview */}
                    {k.pricePreview > 0 ? (
                      <div className="mt-4 flex items-center justify-between text-xs font-medium text-homatri-dark bg-homatri-cream p-2.5 rounded-xl border border-homatri-border">
                        <span>Thalis from <strong>₹{k.pricePreview}</strong></span>
                        {k.isCurrentlyServing ? (
                          <span className="text-homatri-green font-bold">Serving today</span>
                        ) : null}
                      </div>
                    ) : null}

                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-homatri-cream/50 border-t border-homatri-border">
                    <Link
                      href="/order"
                      className="w-full bg-white hover:bg-homatri-orange hover:text-white text-homatri-dark border border-homatri-border font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 transition-all text-center shadow-xs"
                    >
                      <span>View Menu & Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              ))
            : null}
        </div>

      </div>
    </section>
  );
}
