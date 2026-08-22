"use client";

import { ShieldCheck, Truck, Package, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function TrustBanner() {
  return (
    <section id="trust" className="py-20 bg-white border-b border-homatri-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-homatri-dark to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-homatri-orange/20 rounded-full blur-3xl" />

          <div className="max-w-3xl relative z-10">
            <span className="inline-flex items-center gap-2 bg-homatri-orange/20 border border-homatri-orange/40 text-homatri-orange px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Quality & Hygiene Standard</span>
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
              Home Food You Can Trust, <br />
              <span className="text-homatri-orange italic font-normal">Every Single Day.</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              We know that home-cooked food must be authentic, but never uncertain. Homaatri takes full responsibility for hygiene standards, kitchen verification, and seamless doorstep delivery.
            </p>

            {/* 3 Trust Elements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-homatri-green shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Kitchen Inspection</h4>
                  <p className="text-xs text-slate-400 mt-1">Identity & kitchen hygiene verified before going live.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Package className="w-6 h-6 text-homatri-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Sealed Packaging</h4>
                  <p className="text-xs text-slate-400 mt-1">Hygienic, spill-proof tiffin containers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Truck className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Managed Delivery</h4>
                  <p className="text-xs text-slate-400 mt-1">Dedicated rider routes for lunch & dinner windows.</p>
                </div>
              </div>

            </div>

            {/* CTA */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/order"
                className="w-full sm:w-auto bg-homatri-orange hover:bg-homatri-orange-dark text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Explore Today's Menu</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
