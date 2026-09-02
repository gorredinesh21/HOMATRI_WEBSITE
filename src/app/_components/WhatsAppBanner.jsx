"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/918369384157?text=Hi%20Homatri,%20I%20would%20like%20to%20place%20a%20tiffin%20order!",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="sticky top-0 z-[60] bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
        
        {/* Left Side Pill & Text */}
        <div
          onClick={handleWhatsAppClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity flex-1 min-w-0"
        >
          <span className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shrink-0 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            Live Support
          </span>

          <MessageCircle className="w-4 h-4 text-emerald-100 shrink-0 hidden sm:block" />

          <p className="truncate">
            We also accept orders on WhatsApp! To order, please message us on{" "}
            <strong className="underline underline-offset-2 font-black text-amber-200">
              8369384157
            </strong>{" "}
            <span className="hidden md:inline">➔ Tap to chat instantly</span>
          </p>
        </div>

        {/* Action Button & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1 rounded-lg text-xs font-black shadow-xs transition"
          >
            Order on WhatsApp
          </button>
          
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 text-emerald-100 hover:text-white rounded-md hover:bg-white/10 transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
