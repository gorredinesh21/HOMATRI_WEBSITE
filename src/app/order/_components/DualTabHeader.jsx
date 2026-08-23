"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShoppingBag, UserRound } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import UserProfileModal from "./UserProfileModal";

const CLUSTERS = ["Ghansoli", "Vashi", "Airoli"];

export default function DualTabHeader({
  activeTab,
  onTabChange,
  cartItemCount,
  onOpenCart,
  locationLabel,
  isAuthenticated,
  onAuthClick,
}) {
  const { setCluster } = useLocation();
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-homatri-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <Image src="/logo.jpg" alt="Homatri" fill className="object-cover" />
          </div>
          <span className="font-display italic font-medium text-lg text-homatri-orange hidden sm:block">
            Homatri
          </span>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLocationMenuOpen((open) => !open)}
            className="flex items-center gap-1.5 max-w-[160px] sm:max-w-xs bg-homatri-cream border border-homatri-border rounded-full px-3 py-1.5 text-xs font-medium text-homatri-dark"
          >
            <MapPin className="w-3.5 h-3.5 text-homatri-orange shrink-0" />
            <span className="truncate">{locationLabel || "Select locality"}</span>
          </button>
          {isLocationMenuOpen ? (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-homatri-border rounded-2xl shadow-lg p-2">
              {CLUSTERS.map((cluster) => (
                <button
                  key={cluster}
                  type="button"
                  onClick={() => {
                    setCluster(cluster);
                    setIsLocationMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-homatri-orange-light"
                >
                  {cluster}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                setIsProfileModalOpen(true);
              } else {
                onAuthClick();
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-homatri-dark border border-homatri-border rounded-full px-3 py-1.5 hover:bg-homatri-cream transition-colors"
          >
            <UserRound className="w-3.5 h-3.5 text-homatri-orange" />
            {isAuthenticated ? "Account" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-homatri-border bg-white"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-4 h-4 text-homatri-dark" />
            {cartItemCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-homatri-orange text-white text-[10px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-3">
        <div className="grid grid-cols-2 bg-homatri-cream rounded-2xl p-1 border border-homatri-border">
          <button
            type="button"
            onClick={() => onTabChange("KITCHENS")}
            className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
              activeTab === "KITCHENS"
                ? "bg-white text-homatri-orange shadow-sm"
                : "text-homatri-muted"
            }`}
          >
            🎴 Kitchens
          </button>
          <button
            type="button"
            onClick={() => onTabChange("STORIES")}
            className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
              activeTab === "STORIES"
                ? "bg-white text-homatri-orange shadow-sm"
                : "text-homatri-muted"
            }`}
          >
            🎥 Community Stories
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}
