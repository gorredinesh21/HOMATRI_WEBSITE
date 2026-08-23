"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CARTOON_AVATARS } from "@/lib/authClient";
import { fetchSavedAddresses, deleteCustomerAddress, normalizeAddress } from "@/lib/api";
import DeliveryAddressModal from "../_components/DeliveryAddressModal";
import { MapPin, Package, ShieldCheck, LogOut, ArrowLeft, Sparkles, Edit3, Trash2, Plus } from "lucide-react";

export default function CustomerAccountPage() {
  const { token, user, customerPhone, logout } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || CARTOON_AVATARS[0].id);
  const [dietaryTags, setDietaryTags] = useState(["PURE_VEG", "LOW_SPICE"]);
  const [myPhone, setMyPhone] = useState(user?.phone || customerPhone || "7416767453");
  const [isPhoneSaved, setIsPhoneSaved] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const currentAvatar = CARTOON_AVATARS.find((a) => a.id === selectedAvatar) || CARTOON_AVATARS[0];

  useEffect(() => {
    let cancelled = false;
    // Load from localStorage first
    try {
      const local = window.localStorage.getItem("homatri_saved_addresses");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length) {
          setSavedAddresses(parsed.map(normalizeAddress));
        }
      }
    } catch (e) {}

    // Fetch from backend PostgreSQL DB
    (async () => {
      try {
        const remote = await fetchSavedAddresses(token);
        if (!cancelled && Array.isArray(remote) && remote.length) {
          setSavedAddresses(remote);
          window.localStorage.setItem("homatri_saved_addresses", JSON.stringify(remote));
        }
      } catch (e) {}
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSavePhone = () => {
    const clean = myPhone.replace(/\D/g, "").slice(-10);
    if (clean.length === 10) {
      window.localStorage.setItem("homatri_user_phone", clean);
      setIsPhoneSaved(true);
      setTimeout(() => setIsPhoneSaved(false), 3000);
    }
  };

  const handleDeleteAddress = async (id) => {
    const next = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(next);
    window.localStorage.setItem("homatri_saved_addresses", JSON.stringify(next));
    try {
      await deleteCustomerAddress(id, token);
    } catch (e) {}
  };

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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-homatri-muted">+91</span>
                <input
                  type="tel"
                  value={myPhone}
                  onChange={(e) => setMyPhone(e.target.value)}
                  className="px-2 py-1 border border-homatri-border rounded-lg text-xs font-bold text-homatri-dark w-36 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSavePhone}
                  className="bg-homatri-orange text-white text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-homatri-orange-dark transition-colors"
                >
                  {isPhoneSaved ? "Saved ✓" : "Save Phone"}
                </button>
              </div>
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

        {/* Section 2: Saved Delivery Addresses (Zomato/Swiggy Style) */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-homatri-orange" />
              <h2 className="font-display font-medium text-lg text-homatri-dark">Saved Delivery Addresses</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {savedAddresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-homatri-border bg-homatri-cream/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="bg-homatri-orange text-white text-[9px] font-extrabold px-2 py-0.5 rounded">
                        {addr.addressType || "HOME"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="text-homatri-muted hover:text-homatri-orange text-xs font-bold"
                          title="Edit Address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-homatri-muted hover:text-red-600 text-xs font-bold"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-homatri-dark mt-2">
                      {addr.fullAddress || `${addr.flatNo}, ${addr.streetAddress}`}
                    </p>
                    <p className="text-[10px] font-semibold text-homatri-muted mt-1">
                      Phone: +91 {addr.phone || "7416767453"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="w-full p-4 border border-dashed border-homatri-orange/60 bg-homatri-orange-light/30 rounded-2xl text-xs font-bold text-homatri-orange hover:bg-homatri-orange/10 transition-colors text-center"
            >
              + Click to add your first delivery address (Flat No, Street, Sector)
            </button>
          )}
        </div>

        {/* Section 3: Dietary Preferences */}
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

        {/* Section 4: Cartoon Avatar Selection */}
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

      </main>

      {/* Address Selection / Creation Drawer */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaveAddress={(newAddr) => {
          const next = [normalizeAddress(newAddr), ...savedAddresses.filter((a) => a.id !== newAddr.id)];
          setSavedAddresses(next);
          window.localStorage.setItem("homatri_saved_addresses", JSON.stringify(next));
        }}
      />
    </div>
  );
}
