"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, UtensilsCrossed } from "lucide-react";
import { useLocation } from "@/context/LocationContext";

export default function Navbar() {
  const { locationLabel } = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-homatri-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/logo.jpg"
              alt="Homaatri Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-display italic font-medium text-2xl text-homatri-orange block leading-none">
              Homatri
            </span>
            <span className="text-[11px] font-medium text-homatri-muted block mt-1 tracking-wide">
              Achha Khao. Ghar Ka Khao.
            </span>
          </div>
        </Link>

        {/* Location Selector Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-homatri-cream border border-homatri-border px-3 py-1.5 rounded-full text-xs font-medium text-homatri-dark">
          <MapPin className="w-3.5 h-3.5 text-homatri-orange" />
          <span>Active Cluster: <strong className="text-homatri-dark font-semibold">{locationLabel}</strong></span>
        </div>

        {/* Navigation Links & Action Button */}
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-homatri-muted">
            <Link href="#kitchens" className="hover:text-homatri-orange transition-colors">
              Explore Kitchens
            </Link>
            <Link href="#story" className="hover:text-homatri-orange transition-colors">
              Our Story
            </Link>
            <Link href="#how-it-works" className="hover:text-homatri-orange transition-colors">
              How It Works
            </Link>
            <Link href="#trust" className="hover:text-homatri-orange transition-colors">
              Hygiene & Trust
            </Link>
            <Link href="/bulk" className="hover:text-homatri-orange transition-colors">
              Bulk Catering
            </Link>
          </nav>

          {/* Primary Action Button */}
          <Link
            href="/order"
            className="flex items-center gap-2 bg-homatri-orange hover:bg-homatri-orange-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Explore Menus</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
