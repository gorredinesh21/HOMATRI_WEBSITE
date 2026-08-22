"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, User, UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-homatri-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
            <Image
              src="/logo.jpg"
              alt="Homaatri Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-extrabold text-2xl text-homatri-orange tracking-tight block leading-none">
              Homatri
            </span>
            <span className="text-[11px] font-semibold text-homatri-muted block mt-1">
              Achha Khao. Ghar Ka Khao.
            </span>
          </div>
        </Link>

        {/* Location Selector Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-homatri-cream border border-homatri-border px-3 py-1.5 rounded-full text-xs font-medium text-homatri-dark">
          <MapPin className="w-4 h-4 text-homatri-orange" />
          <span>Active Cluster: <strong className="text-homatri-dark">Ghansoli, Navi Mumbai</strong></span>
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
          </nav>

          {/* Primary Action Button */}
          <Link
            href="/order"
            className="flex items-center gap-2 bg-homatri-orange hover:bg-homatri-orange-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Explore Menus</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
