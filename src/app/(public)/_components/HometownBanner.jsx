"use client";

import { ArrowDown, Heart } from "lucide-react";

export default function HometownBanner({ photos }) {
  if (photos.length === 0) return null;

  return (
    <section className="bg-homatri-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
              Nostalgia, delivered
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark leading-tight">
              Missing the Food You Grew Up With?
            </h2>
            <p className="mt-4 text-base text-homatri-muted leading-relaxed">
              The dal your mother simmered on Sundays. The fish curry from your native place. The
              sabzi you only get back home. Somewhere in this city, a home cook from your region
              is still making it the old way — on a real stove, with real patience.
            </p>
            <p className="mt-3 text-base text-homatri-muted leading-relaxed">
              Tell us where you&apos;re from. We&apos;ll find your kitchen.
            </p>
            <a
              href="#cuisines"
              className="mt-7 inline-flex items-center gap-2 bg-homatri-forest hover:bg-homatri-forest-deep text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              <Heart className="w-4 h-4" /> Find My Hometown Food
            </a>
          </div>

          <div className="relative h-[300px] sm:h-[360px]" aria-hidden="true">
            {photos.slice(0, 4).map((photo, index) => {
              const layout = [
                { className: "left-0 top-4 w-44 sm:w-52 rotate-[-7deg]", z: "z-10" },
                { className: "right-6 top-0 w-40 sm:w-48 rotate-[6deg]", z: "z-20" },
                { className: "left-10 bottom-0 w-48 sm:w-56 rotate-[4deg]", z: "z-30" },
                { className: "right-0 bottom-6 w-36 sm:w-44 rotate-[-5deg]", z: "z-40" },
              ][index % 4];
              return (
                <div
                  key={`${photo}-${index}`}
                  className={`absolute ${layout.className} ${layout.z} bg-white p-2 pb-7 rounded-2xl shadow-lg border border-homatri-border`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="w-full h-32 sm:h-40 object-cover rounded-xl" loading="lazy" />
                </div>
              );
            })}
            <a
              href="#cuisines"
              aria-label="Find my hometown food"
              className="absolute left-1/2 -translate-x-1/2 bottom-2 z-50 lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-homatri-orange text-white shadow-lg"
            >
              <ArrowDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
