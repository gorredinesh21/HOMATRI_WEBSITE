"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-homatri-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-homatri-border">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                <Image src="/logo.jpg" alt="Homaatri Logo" fill className="object-cover" />
              </div>
              <span className="font-extrabold text-2xl text-homatri-orange tracking-tight">
                Homatri
              </span>
            </Link>
            <p className="text-sm font-semibold text-homatri-dark">
              Achha Khao. Ghar Ka Khao.
            </p>
            <p className="text-xs text-homatri-muted leading-relaxed max-w-sm">
              A managed tiffin and home-food network built around trusted homemakers. Delivering authentic, healthy home-cooked meals right to your doorstep.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-homatri-dark uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-medium text-homatri-muted">
              <li>
                <Link href="#kitchens" className="hover:text-homatri-orange transition-colors">
                  Explore Home Kitchens
                </Link>
              </li>
              <li>
                <Link href="#story" className="hover:text-homatri-orange transition-colors">
                  Our Regional Story
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-homatri-orange transition-colors">
                  How Tiffin Works
                </Link>
              </li>
              <li>
                <Link href="#trust" className="hover:text-homatri-orange transition-colors">
                  Hygiene & Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Active Locations & Portal Logins */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-homatri-dark uppercase tracking-wider">
              Active Service Clusters
            </h4>
            <p className="text-xs text-homatri-muted">
              Ghansoli (Navi Mumbai), Sector 4, 5, 6, 7, Indravati CHS.
            </p>

            <div className="pt-3">
              <h4 className="text-xs font-bold text-homatri-dark uppercase tracking-wider mb-2">
                Platform Portals
              </h4>
              <div className="flex items-center gap-3 text-xs font-bold text-homatri-orange">
                <Link href="/order" className="hover:underline">Customer Ordering</Link>
                <span>•</span>
                <Link href="/chef" className="hover:underline">Chef Portal</Link>
                <span>•</span>
                <Link href="/admin" className="hover:underline">Admin Portal</Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-homatri-muted font-medium">
          <p>© {new Date().getFullYear()} Homaatri Technologies. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-homatri-orange text-homatri-orange" />
            <span>for authentic home food lovers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
