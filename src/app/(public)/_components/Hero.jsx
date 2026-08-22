"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Clock, Heart, Sparkles } from "lucide-react";
import { useLocation } from "@/context/LocationContext";

export default function Hero() {
  const router = useRouter();
  const { activeCluster, setCluster } = useLocation();
  const [searchArea, setSearchArea] = useState(activeCluster || "");

  useEffect(() => {
    if (activeCluster) setSearchArea(activeCluster);
  }, [activeCluster]);

  const goToOrder = (cluster) => {
    const next = (cluster || searchArea || "Ghansoli").trim();
    setCluster(next);
    router.push(`/order?location=${encodeURIComponent(next)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-homatri-orange-light/40 via-homatri-cream to-white py-16 lg:py-24">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-homatri-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-homatri-green/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-homatri-orange/20 px-4 py-1.5 rounded-full shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-homatri-orange" />
            <span className="text-[11px] font-medium text-homatri-orange tracking-widest uppercase">
              Managed Home Tiffin Network
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-[2.75rem] sm:text-5xl lg:text-6xl font-medium text-homatri-dark">
            Achha Khao. <br />
            <span className="text-homatri-orange italic font-normal">Ghar Ka Khao.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-homatri-muted font-normal leading-relaxed">
            Discover authentic, healthy home-cooked meals prepared with maternal love by verified homemakers right in your neighborhood.
          </p>

          {/* Location Search Container */}
          <div className="mt-10 bg-white p-3 rounded-2xl shadow-md border border-homatri-border max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 w-full px-3 py-2">
              <Search className="w-5 h-5 text-homatri-muted" />
              <input
                type="text"
                placeholder="Enter your locality (e.g. Ghansoli, Sector 6)..."
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full text-sm font-medium focus:outline-none text-homatri-dark placeholder:text-homatri-muted"
              />
            </div>
            <button
              type="button"
              onClick={() => goToOrder(searchArea)}
              className="w-full sm:w-auto bg-homatri-orange hover:bg-homatri-orange-dark text-white px-8 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm transition-all text-center"
            >
              Find Menus
            </button>
          </div>

          {/* Quick Area Chips */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-homatri-muted">
            <span className="font-medium">Popular Clusters:</span>
            <button type="button" onClick={() => { setSearchArea("Ghansoli"); setCluster("Ghansoli"); }} className="bg-white hover:bg-homatri-orange-light px-2.5 py-1 rounded-lg border border-homatri-border font-medium transition-colors">
              📍 Ghansoli
            </button>
            <button type="button" onClick={() => { setSearchArea("Vashi"); setCluster("Vashi"); }} className="bg-white hover:bg-homatri-orange-light px-2.5 py-1 rounded-lg border border-homatri-border font-medium transition-colors">
              📍 Vashi
            </button>
            <button type="button" onClick={() => { setSearchArea("Airoli"); setCluster("Airoli"); }} className="bg-white hover:bg-homatri-orange-light px-2.5 py-1 rounded-lg border border-homatri-border font-medium transition-colors">
              📍 Airoli
            </button>
          </div>

          {/* Value Badges Grid */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-homatri-border/60">
            <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border border-homatri-border shadow-xs">
              <Heart className="w-5 h-5 text-homatri-orange shrink-0" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-homatri-dark">100% Home Cooked</h4>
                <p className="text-xs text-homatri-muted">Low oil, zero preservatives</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border border-homatri-border shadow-xs">
              <Clock className="w-5 h-5 text-homatri-orange shrink-0" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-homatri-dark">Scheduled Tiffins</h4>
                <p className="text-xs text-homatri-muted">Lunch (11:30) & Dinner (6:30)</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border border-homatri-border shadow-xs">
              <ShieldCheck className="w-5 h-5 text-homatri-green shrink-0" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-homatri-dark">Verified Hygiene</h4>
                <p className="text-xs text-homatri-muted">Strict kitchen inspection</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
