"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CARTOON_AVATARS } from "@/lib/authClient";
import { MapPin, Package, ShieldCheck, LogOut, ArrowLeft, Heart, Sparkles } from "lucide-react";

export default function CustomerAccountPage() {
  const { user, customerPhone, logout, isAuthenticated } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || CARTOON_AVATARS[0].id);
  const [dietaryTags, setDietaryTags] = useState(["PURE_VEG", "LOW_SPICE"]);

  const currentAvatar = CARTOON_AVATARS.find((a) => a.id === selectedAvatar) || CARTOON_AVATARS[0];

  const toggleDietary = (tag) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-homatri-cream pb-12">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-homatri-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/order" className="flex items-center gap-2 text-sm font-bold text-homatri-dark hover:text-homatri-orange">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Ordering</span>
          </Link>
          <span className="font-display italic font-medium text-lg text-homatri-orange">
            Homatri Account
          </span>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-homatri-orange-light border border-homatri-orange/30 flex items-center justify-center text-4xl shadow-sm">
              {currentAvatar.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-medium text-2xl text-homatri-dark">
                  {user?.full_name || user?.name || "Homaatri Member"}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  VERIFIED
                </span>
              </div>
              <p className="text-sm font-semibold text-homatri-muted mt-1">
                +91 {user?.phone || customerPhone || "7416767453"}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-homatri-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>30-Day Persistent Session Active</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Section 1: Active Orders & Subscriptions */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-homatri-orange" />
              <h2 className="font-display font-medium text-lg text-homatri-dark">My Active Orders & Subscriptions</h2>
            </div>
            <Link
              href="/order/tracking"
              className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
            >
              Track Live Orders &rarr;
            </Link>
          </div>

          <div className="bg-homatri-cream/60 rounded-2xl p-4 border border-homatri-border flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-homatri-dark">Lunch Tiffin — Surmai Konkan Kitchen</p>
              <p className="text-[11px] text-homatri-muted mt-0.5">Meal Window: 12:00 PM – 1:30 PM | 1 Item (Surmai Fish Thali)</p>
            </div>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">
              BATCHED & COOKING
            </span>
          </div>
        </div>

        {/* Section 2: Dietary Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-homatri-orange" />
            <h2 className="font-display font-medium text-lg text-homatri-dark">Dietary Preferences</h2>
          </div>
          <p className="text-xs text-homatri-muted">
            Homemakers will automatically adapt your tiffins according to your dietary rules.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: "PURE_VEG", label: "🌱 100% Pure Veg" },
              { id: "JAIN", label: "🙏 Jain (No Onion/Garlic)" },
              { id: "LOW_SPICE", label: "🌶️ Low Spice Level" },
              { id: "NON_VEG", label: "🍗 Non-Veg Allowed" },
              { id: "GLUTEN_FREE", label: "🌾 Gluten Free Roti" },
            ].map((pref) => {
              const isSelected = dietaryTags.includes(pref.id);
              return (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => toggleDietary(pref.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? "bg-homatri-orange text-white border-homatri-orange shadow-xs"
                      : "bg-homatri-cream text-homatri-dark border-homatri-border hover:border-homatri-orange"
                  }`}
                >
                  {pref.label} {isSelected ? "✓" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Cartoon Avatar Selection */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xs space-y-4">
          <h2 className="font-display font-medium text-lg text-homatri-dark">Pick Your Cartoon Avatar</h2>
          <p className="text-xs text-homatri-muted">Choose how your avatar appears across Homatri community stories.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {CARTOON_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedAvatar === avatar.id
                    ? "border-homatri-orange bg-homatri-orange-light shadow-sm"
                    : "border-homatri-border hover:border-homatri-orange"
                }`}
              >
                <span className="block text-3xl">{avatar.emoji}</span>
                <span className="mt-2 block text-xs font-bold text-homatri-dark">{avatar.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Saved Delivery Addresses */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-homatri-orange" />
              <h2 className="font-display font-medium text-lg text-homatri-dark">Saved Delivery Addresses</h2>
            </div>
            <button type="button" className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark">
              + Add New Address
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-homatri-border bg-homatri-cream/40 flex items-start justify-between">
            <div>
              <span className="bg-homatri-orange text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">HOME</span>
              <p className="text-xs font-bold text-homatri-dark mt-2">Flat 402, Sector 8, Ghansoli</p>
              <p className="text-[11px] text-homatri-muted mt-0.5">Navi Mumbai, Maharashtra — 400701</p>
            </div>
            <button type="button" className="text-xs font-bold text-homatri-muted hover:text-homatri-dark">
              Edit
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
