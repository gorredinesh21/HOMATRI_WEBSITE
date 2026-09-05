"use client";

import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Star, UtensilsCrossed } from "lucide-react";
import { kitchenPhotos, regionLabel } from "@/lib/visuals";

export default function ChefSection({ kitchens }) {
  return (
    <section id="chefs" className="bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
              Real homes, real cooks
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
              Meet the People Behind Your Meal
            </h2>
            <p className="mt-3 text-sm sm:text-base text-homatri-muted leading-relaxed">
              Not cloud kitchens. Not restaurants. Verified homemakers cooking their own
              family&apos;s food in their own kitchens.
            </p>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-homatri-orange hover:text-homatri-orange-dark"
          >
            View all chefs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-9 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {kitchens.slice(0, 4).map((kitchen) => {
            const photo = kitchenPhotos(kitchen)[0];
            return (
              <article
                key={kitchen.chefId}
                className="group bg-homatri-cream rounded-3xl border border-homatri-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="relative h-52 bg-homatri-sand">
                  {photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photo}
                      alt={`${kitchen.chefName} of ${kitchen.kitchenName}`}
                      className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform"
                      loading="lazy"
                    />
                  ) : null}
                  {kitchen.isVerified ? (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/95 text-homatri-forest text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Verified cook
                    </span>
                  ) : null}
                </div>

                <div className="p-4">
                  <h3 className="font-display text-lg font-medium text-homatri-dark leading-snug">
                    {kitchen.chefName}
                  </h3>
                  <p className="text-xs font-semibold text-homatri-orange mt-0.5">{kitchen.kitchenName}</p>

                  <span className="mt-3 inline-flex items-center gap-1 bg-homatri-forest-mist text-homatri-forest text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {regionLabel(kitchen.regionalIdentity)}
                  </span>

                  <p className="mt-3 text-xs text-homatri-muted leading-relaxed line-clamp-2">
                    {kitchen.bio || `Speciality of the house: ${kitchen.signatureDish}`}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-homatri-border pt-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-homatri-dark">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {Number(kitchen.rating || 0).toFixed(1)}
                    </span>
                    <Link
                      href="/order"
                      className="inline-flex items-center gap-1 text-xs font-bold text-homatri-forest hover:text-homatri-orange transition-colors"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" /> View kitchen
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
