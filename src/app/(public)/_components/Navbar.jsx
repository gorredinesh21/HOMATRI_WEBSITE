"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/#whats-cooking", label: "Menus" },
  { href: "/#cuisines", label: "Cuisines" },
  { href: "/#chefs", label: "Our Chefs" },
  { href: "/#trust", label: "Trust" },
  { href: "/bulk", label: "Tiffin & Bulk" },
];

export default function Navbar() {
  const { locationLabel } = useLocation();
  const { items, openCart } = useCart();
  const cartCount = items.reduce((total, entry) => total + (Number(entry.quantity) || 0), 0);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-homatri-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            <Image src="/logo.jpg" alt="Homatri logo" fill className="object-cover" priority />
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

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-homatri-muted">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-homatri-orange transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-2 bg-homatri-cream border border-homatri-border px-3 py-1.5 rounded-full text-xs font-medium text-homatri-dark">
            <MapPin className="w-3.5 h-3.5 text-homatri-orange" />
            {locationLabel}
          </span>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart with ${cartCount} items`}
            className="relative w-10 h-10 inline-flex items-center justify-center rounded-xl border border-homatri-border bg-white text-homatri-dark hover:border-homatri-orange hover:text-homatri-orange transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-homatri-orange text-white text-[10px] font-bold inline-flex items-center justify-center">
                {cartCount}
              </span>
            ) : null}
          </button>

          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-homatri-orange hover:bg-homatri-orange-dark text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span className="hidden sm:inline">Order Now</span>
            <span className="sm:hidden">Order</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
