"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CARTOON_AVATARS } from "@/lib/authClient";
import { fetchSavedAddresses, fetchMyOrders, deleteCustomerAddress, normalizeAddress } from "@/lib/api";
import DeliveryAddressModal from "../_components/DeliveryAddressModal";
import { MapPin, Package, ShieldCheck, LogOut, ArrowLeft, Sparkles, Edit3, Trash2, Plus } from "lucide-react";

const DIETARY_PREFS = [
  { id: "PURE_VEG", label: "🌱 100% Pure Veg" },
  { id: "JAIN", label: "🙏 Jain (No Onion/Garlic)" },
  { id: "LOW_SPICE", label: "🌶️ Low Spice Level" },
  { id: "NON_VEG", label: "🍗 Non-Veg Allowed" },
  { id: "GLUTEN_FREE", label: "🌾 Gluten Free Roti" },
];

const TERMINAL_ORDER_STATUSES = ["DELIVERED", "CANCELLED"];

const STATUS_BADGE_STYLES = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800 border-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  BATCHED: "bg-amber-100 text-amber-800 border-amber-300",
  COOKING: "bg-amber-100 text-amber-800 border-amber-300",
  PACKED: "bg-amber-100 text-amber-800 border-amber-300",
  PICKED_UP: "bg-sky-100 text-sky-800 border-sky-300",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-800 border-sky-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
};

function orderItemsSummary(order) {
  const items = order?.items || [];
  if (!items.length) return null;
  return items
    .map((item) => `${item.quantity ?? 1}× ${item.dish_name || item.label || item.item_name || "item"}`)
    .join(", ");
}

export default function CustomerAccountPage() {
  const { token, user, customerPhone, logout, isAuthenticated } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(CARTOON_AVATARS[0].id);
  const [dietaryTags, setDietaryTags] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [ordersError, setOrdersError] = useState("");
  const [myPhone, setMyPhone] = useState("");
  const [isPhoneSaved, setIsPhoneSaved] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const currentAvatar = CARTOON_AVATARS.find((a) => a.id === selectedAvatar) || CARTOON_AVATARS[0];

  useEffect(() => {
    setMyPhone(user?.phone || customerPhone || "");
    try {
      const localPrefs = window.localStorage.getItem("homatri_dietary_prefs");
      if (localPrefs) {
        const parsed = JSON.parse(localPrefs);
        if (Array.isArray(parsed)) setDietaryTags(parsed);
      }
    } catch (e) {}
    try {
      const localAvatar = window.localStorage.getItem("homatri_selected_avatar");
      if (localAvatar && CARTOON_AVATARS.some((a) => a.id === localAvatar)) {
        setSelectedAvatar(localAvatar);
      } else if (user?.avatar_url && CARTOON_AVATARS.some((a) => a.id === user.avatar_url)) {
        setSelectedAvatar(user.avatar_url);
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phone, user?.avatar_url, customerPhone]);

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

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setActiveOrder(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const orders = await fetchMyOrders(token);
        const live = (Array.isArray(orders) ? orders : []).find(
          (order) => !TERMINAL_ORDER_STATUSES.includes(order?.status || order?.order_status || "")
        );
        if (!cancelled) {
          setActiveOrder(live || null);
          setOrdersError("");
        }
      } catch (e) {
        if (!cancelled) setOrdersError(e?.message || "Could not load your orders.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

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
    setDietaryTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      try {
        window.localStorage.setItem("homatri_dietary_prefs", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const selectAvatar = (avatarId) => {
    setSelectedAvatar(avatarId);
    try {
      window.localStorage.setItem("homatri_selected_avatar", avatarId);
    } catch (e) {}
  };

  const orderStatus = activeOrder?.status || activeOrder?.order_status || "";
  const orderBadgeStyle = STATUS_BADGE_STYLES[orderStatus] || "bg-slate-100 text-slate-700 border-slate-300";

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
                {isAuthenticated ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    VERIFIED
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-homatri-muted">+91</span>
                <input
                  type="tel"
                  value={myPhone}
                  onChange={(e) => setMyPhone(e.target.value)}
                  placeholder="Add your phone"
                  className="px-2 py-1 border border-homatri-border rounded-lg text-xs font-bold text-homatri-dark w-36 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSavePhone}
                  className="bg-homatri-orange text-white text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-homatri-orange-dark transition-colors"
                  title="Saved locally on this device only"
                >
                  {isPhoneSaved ? "Saved ✓" : "Save on device"}
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

          {ordersError ? (
            <p className="text-xs font-semibold text-red-600">{ordersError}</p>
          ) : !isAuthenticated ? (
            <div className="bg-homatri-cream/60 rounded-2xl p-4 border border-dashed border-homatri-border text-center">
              <p className="text-xs font-bold text-homatri-dark">Sign in to see your live orders here.</p>
              <Link
                href="/order"
                className="inline-block mt-2 text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Browse kitchens & sign in &rarr;
              </Link>
            </div>
          ) : activeOrder ? (
            <Link
              href={`/order/tracking?order_id=${encodeURIComponent(activeOrder.order_id)}`}
              className="block bg-homatri-cream/60 rounded-2xl p-4 border border-homatri-border flex items-center justify-between gap-3 hover:border-homatri-orange/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-homatri-dark truncate">
                  {activeOrder.meal_window ? `${activeOrder.meal_window} tiffin` : "Tiffin"}
                  {activeOrder.kitchen_name ? ` — ${activeOrder.kitchen_name}` : ""}
                </p>
                <p className="text-[11px] text-homatri-muted mt-0.5 truncate">
                  {orderItemsSummary(activeOrder) || `${activeOrder.order_id}`}
                </p>
              </div>
              <span className={`shrink-0 border px-3 py-1 rounded-full text-xs font-bold ${orderBadgeStyle}`}>
                {orderStatus.replace(/_/g, " ")}
              </span>
            </Link>
          ) : (
            <div className="bg-homatri-cream/60 rounded-2xl p-4 border border-dashed border-homatri-border text-center">
              <p className="text-xs font-bold text-homatri-dark">No active orders right now.</p>
              <Link
                href="/order"
                className="inline-block mt-2 text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Order your next home-cooked meal &rarr;
              </Link>
            </div>
          )}
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
                    {addr.phone ? (
                      <p className="text-[10px] font-semibold text-homatri-muted mt-1">
                        Phone: +91 {addr.phone}
                      </p>
                    ) : null}
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
          <p className="text-[10px] font-semibold text-homatri-muted bg-homatri-cream/60 border border-homatri-border rounded-xl px-3 py-2">
            Saved on this device only — these preferences are not yet synced to your Homatri account.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {DIETARY_PREFS.map((pref) => {
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
          <p className="text-[10px] font-semibold text-homatri-muted bg-homatri-cream/60 border border-homatri-border rounded-xl px-3 py-2">
            Preview is saved on this device — your account avatar is set when you sign in.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {CARTOON_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => selectAvatar(avatar.id)}
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
