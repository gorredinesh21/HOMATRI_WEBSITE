"use client";

import { Star, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

const FEATURED_KITCHENS = [
  {
    id: "indravati",
    name: "Indravati Pure Veg Tiffins",
    chef: "Chef Sunita Sharma",
    locality: "Sector 6, Ghansoli",
    rating: 4.9,
    reviews: 128,
    diet: "100% PURE VEG",
    dietColor: "bg-homatri-green-light text-homatri-green border-homatri-green/30",
    signatureDish: "Jain Paneer Tikka Tiffin",
    lunchPrice: 180,
    dinnerPrice: 140,
    cuisine: "North Indian & Jain Special",
  },
  {
    id: "konkan",
    name: "Konkan Coastal Flavors",
    chef: "Chef Ananya Naik",
    locality: "Sector 5, Ghansoli",
    rating: 4.8,
    reviews: 94,
    diet: "NON-VEG & COASTAL",
    dietColor: "bg-amber-50 text-amber-700 border-amber-200",
    signatureDish: "Surmai Fish Curry Tiffin",
    lunchPrice: 280,
    dinnerPrice: 240,
    cuisine: "Malvani & Konkani Coastal",
  },
  {
    id: "punjabi",
    name: "Desi Punjabi Dhaba Tiffins",
    chef: "Chef Rajesh Grewal",
    locality: "Sector 4, Ghansoli",
    rating: 4.9,
    reviews: 156,
    diet: "VEG & NON-VEG",
    dietColor: "bg-orange-50 text-orange-700 border-orange-200",
    signatureDish: "Amritsari Chole Bhature Tiffin",
    lunchPrice: 170,
    dinnerPrice: 260,
    cuisine: "Authentic Punjabi Home Style",
  },
  {
    id: "dakshin",
    name: "Dakshin Annapoorna Tiffins",
    chef: "Chef Meenakshi Iyer",
    locality: "Sector 7, Ghansoli",
    rating: 4.9,
    reviews: 112,
    diet: "100% PURE VEG",
    dietColor: "bg-homatri-green-light text-homatri-green border-homatri-green/30",
    signatureDish: "Special Chettinad Veg Meals",
    lunchPrice: 190,
    dinnerPrice: 140,
    cuisine: "South Indian & Chettinad",
  },
];

export default function KitchenSpotlight() {
  return (
    <section id="kitchens" className="py-20 bg-homatri-cream border-b border-homatri-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold text-homatri-orange tracking-wider uppercase bg-white border border-homatri-orange/20 px-3.5 py-1 rounded-full shadow-xs">
              Local Home Kitchens
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-homatri-dark tracking-tight leading-snug">
              Featured Homemakers In Ghansoli
            </h2>
            <p className="mt-1 text-sm text-homatri-muted font-normal">
              Verified kitchens prepared with authentic regional recipes and fresh ingredients.
            </p>
          </div>

          <Link
            href="/order"
            className="inline-flex items-center gap-1 text-sm font-semibold text-homatri-orange hover:text-homatri-orange-dark transition-colors"
          >
            <span>View All Kitchens</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Kitchen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_KITCHENS.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-3xl border border-homatri-border shadow-xs hover:shadow transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${k.dietColor}`}>
                    {k.diet}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{k.rating}</span>
                  </div>
                </div>

                {/* Kitchen Name & Chef */}
                <h3 className="font-display text-base font-bold text-homatri-dark leading-snug">
                  {k.name}
                </h3>
                <p className="text-xs font-semibold text-homatri-orange mt-0.5">
                  {k.chef}
                </p>

                <div className="flex items-center gap-1 text-xs text-homatri-muted mt-2">
                  <MapPin className="w-3.5 h-3.5 text-homatri-muted" />
                  <span>{k.locality}</span>
                </div>

                {/* Signature Dish */}
                <div className="mt-4 pt-4 border-t border-homatri-border/60">
                  <span className="text-[11px] font-medium text-homatri-muted uppercase tracking-wider block">
                    Signature Dish:
                  </span>
                  <p className="text-xs font-bold text-homatri-dark mt-0.5">
                    {k.signatureDish}
                  </p>
                </div>

                {/* Price Preview */}
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-homatri-dark bg-homatri-cream p-2.5 rounded-xl border border-homatri-border">
                  <span>Lunch: <strong>₹{k.lunchPrice}</strong></span>
                  <span className="text-homatri-border">|</span>
                  <span>Dinner: <strong>₹{k.dinnerPrice}</strong></span>
                </div>

              </div>

              {/* Card Action Footer */}
              <div className="p-4 bg-homatri-cream/50 border-t border-homatri-border">
                <Link
                  href="/order"
                  className="w-full bg-white hover:bg-homatri-orange hover:text-white text-homatri-dark border border-homatri-border font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 transition-all text-center shadow-xs"
                >
                  <span>View Menu & Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
