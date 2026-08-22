"use client";

import { Search, CalendarCheck, Bike } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-homatri-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-homatri-orange tracking-wider uppercase bg-homatri-orange-light px-3.5 py-1 rounded-full">
            Simple 3-Step Routine
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-homatri-dark tracking-tight">
            How Homaatri Works For You
          </h2>
          <p className="mt-3 text-base text-homatri-muted font-medium">
            Enjoying fresh, authentic home food every day is effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative bg-homatri-cream p-8 rounded-3xl border border-homatri-border text-center group hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-homatri-orange text-white flex items-center justify-center font-black text-xl mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform">
              1
            </div>
            <Search className="w-8 h-8 text-homatri-orange mx-auto mb-4" />
            <h3 className="text-lg font-extrabold text-homatri-dark mb-2">
              Discover Local Homemakers
            </h3>
            <p className="text-sm text-homatri-muted leading-relaxed">
              Enter your area to explore verified home kitchens in your neighborhood, view their stories, and check daily menus.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-homatri-cream p-8 rounded-3xl border border-homatri-border text-center group hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-homatri-orange text-white flex items-center justify-center font-black text-xl mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform">
              2
            </div>
            <CalendarCheck className="w-8 h-8 text-homatri-orange mx-auto mb-4" />
            <h3 className="text-lg font-extrabold text-homatri-dark mb-2">
              Pick Your Meal Window
            </h3>
            <p className="text-sm text-homatri-muted leading-relaxed">
              Select single orders or recurring tiffin plans for <strong>Lunch (11:30 AM Cutoff)</strong> or <strong>Dinner (6:30 PM Cutoff)</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-homatri-cream p-8 rounded-3xl border border-homatri-border text-center group hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-homatri-orange text-white flex items-center justify-center font-black text-xl mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform">
              3
            </div>
            <Bike className="w-8 h-8 text-homatri-orange mx-auto mb-4" />
            <h3 className="text-lg font-extrabold text-homatri-dark mb-2">
              Enjoy Scheduled Delivery
            </h3>
            <p className="text-sm text-homatri-muted leading-relaxed">
              Our managed delivery network picks up freshly packed meals directly from the homemaker and delivers them right to your door.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
