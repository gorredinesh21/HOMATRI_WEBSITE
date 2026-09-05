"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Home,
  Search,
  Star,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";

const CARE_POINTS = [
  { icon: Home, label: "Home cooked with care" },
  { icon: UtensilsCrossed, label: "Regional cuisines" },
  { icon: BadgeCheck, label: "Verified home chefs" },
  { icon: Truck, label: "Affordable delivery" },
];

// Popular cuisine searches — live ones filter /order, others jump to the
// region inside the cuisine explorer.
const POPULAR_SEARCHES = [
  { label: "South Indian", href: "/?region=South%20India#cuisines" },
  { label: "Maharashtrian", href: "/order?cuisine=Maharashtrian%20Home%20Food" },
  { label: "Punjabi", href: "/?region=North%20India#cuisines" },
  { label: "Bengali", href: "/?region=East%20%26%20Northeast#cuisines" },
];

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
    <section className="relative overflow-hidden bg-homatri-cream">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-homatri-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-homatri-forest/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <h1 className="font-display text-[2.6rem] sm:text-5xl lg:text-6xl font-medium text-homatri-dark leading-[1.08]">
              Achha Khao. <br />
              <span className="text-homatri-orange italic font-normal">Ghar Ka Khao.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-homatri-muted leading-relaxed">
              Authentic home-cooked meals from
              <br />
              the diverse homes around you
            </p>

            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {CARE_POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-homatri-dark">
                  <Icon className="w-3.5 h-3.5 text-homatri-forest" />
                  {label}
                </li>
              ))}
            </ul>

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
              <span className="font-semibold">Popular searches:</span>
              {POPULAR_SEARCHES.map((search) => (
                <a
                  key={search.label}
                  href={search.href}
                  className="bg-white hover:bg-homatri-orange-light px-2.5 py-1 rounded-lg border border-homatri-border font-medium text-homatri-dark transition-colors"
                >
                  {search.label}
                </a>
              ))}
            </div>
          </div>

          <div className="relative lg:-mr-6 xl:-mr-14">
            {/* Edges of this art fade to transparent so it melts into the cream page. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-mothers.webp"
              alt="The homemakers of Homatri — real home cooks from across India"
              className="w-full h-auto"
            />
            <span className="absolute bottom-[12%] left-[14%] inline-flex items-center gap-1.5 bg-white text-homatri-dark text-xs font-bold px-3.5 py-2 rounded-full shadow-lg border border-homatri-border">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              4.8 loved by locals
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
