"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export default function ConversionBanner() {
  return (
    <section className="bg-homatri-forest">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
          Ghar ka khana is <span className="italic text-homatri-orange-light">one tap</span> away.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed max-w-xl mx-auto">
          Today&apos;s thalis are live right now. Fresh, sealed, and on a rider before you&apos;re
          hungry.
        </p>
        <Link
          href="/order"
          className="mt-8 inline-flex items-center gap-2 bg-homatri-orange hover:bg-homatri-orange-dark text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg transition-colors"
        >
          See What&apos;s Cooking Today <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-white/60">
          <Clock className="w-3.5 h-3.5" /> Lunch by 11:30 AM · Dinner by 6:30 PM · ₹11 flat
          convenience fee
        </p>
      </div>
    </section>
  );
}
