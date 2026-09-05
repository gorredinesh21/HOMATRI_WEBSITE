"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import { WHATSAPP_ORDER_URL } from "@/lib/visuals";

export default function CuisineRail({ regions }) {
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
            Navi Mumbai is built by people from everywhere — and so is its food. Every Homatri
            kitchen carries the recipes of a real home region. Pick a taste to see what&apos;s
            cooking in it right now.
          </p>
        </div>

        <div className="mt-9 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-3">
          <ul className="flex items-stretch gap-5 sm:gap-7 w-max">
            {regions.map((region) => (
              <li key={region.value} className="w-[104px] shrink-0">
                <Link
                  href={`/order?cuisine=${encodeURIComponent(region.value)}`}
                  className="group flex flex-col items-center text-center gap-2.5"
                >
                  <span className="relative w-[92px] h-[92px] sm:w-24 sm:h-24 rounded-full overflow-hidden ring-[3px] ring-white shadow-md group-hover:ring-homatri-orange group-hover:scale-[1.04] transition-all">
                    {region.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={region.photo}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-full h-full inline-flex items-center justify-center bg-homatri-forest-mist font-display text-2xl text-homatri-forest">
                        {region.label.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold text-homatri-dark group-hover:text-homatri-orange leading-tight transition-colors">
                      {region.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-homatri-muted">
                      {region.kitchenCount} kitchen{region.kitchenCount > 1 ? "s" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}

            <li className="w-[164px] shrink-0">
              <a
                href={WHATSAPP_ORDER_URL}
                target="_blank"
                rel="noreferrer"
                className="h-full flex flex-col items-center justify-center text-center gap-2 rounded-3xl border-2 border-dashed border-homatri-forest/30 text-homatri-forest px-4 py-4 hover:border-homatri-forest hover:bg-white/60 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-bold leading-snug">
                  Don&apos;t see your region? Ask us to bring it
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-2 hidden sm:flex items-center gap-1 text-[11px] text-homatri-muted">
          <ChevronRight className="w-3.5 h-3.5" /> scroll for more regions
        </p>
      </div>
    </section>
  );
}
