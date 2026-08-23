"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin, Plus, CheckCircle, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import DeliveryAddressModal from "./DeliveryAddressModal";

export default function CartDrawer({
  isOpen,
  onClose,
  onCheckout,
  onAuthenticate,
  deliveryFee,
  currency = "INR",
  canCheckout,
  checkoutError,
}) {
  const { items, mealWindow, subtotal, total, customNotes, setCustomNotes, updateQuantity, updateItemNote, isSubmitting } =
    useCart();
  const { isAuthenticated, customerPhone, user } = useAuth();
  
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Selected Delivery Address State
  const [savedAddress, setSavedAddress] = useState(
    user?.delivery_address
      ? { fullAddress: user.delivery_address, phone: customerPhone || "7416767453" }
      : null
  );

  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckoutClick = async () => {
    // Check 1: User Authentication
    if (!isAuthenticated) {
      onAuthenticate?.();
      return;
    }

    // Check 2: Delivery Address Pre-Check (Zomato/Swiggy style)
    if (!savedAddress || !savedAddress.fullAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    // Pre-Checks complete -> Proceed to Payment Engine
    setIsCheckoutLoading(true);
    try {
      await onCheckout?.(savedAddress);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70]">
        <button type="button" className="absolute inset-0 bg-homatri-dark/40" onClick={onClose} aria-label="Close cart" />
        <aside
          ref={panelRef}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-homatri-border flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-homatri-border">
            <div>
              <h2 className="font-display text-xl font-medium italic text-homatri-dark">Your Tiffin Cart</h2>
              <p className="text-xs text-homatri-muted mt-0.5">
                Meal Window: <strong>{mealWindow || "Not set"}</strong>
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5 text-homatri-muted hover:text-homatri-dark" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🍱</p>
                <p className="text-sm font-bold text-homatri-dark">Your cart is empty</p>
                <p className="text-xs text-homatri-muted mt-1">Explore Ghansoli kitchens to add your daily tiffin.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.menuItemId} className="border border-homatri-border rounded-2xl p-4 bg-white shadow-2xs">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-homatri-dark">{item.itemName}</p>
                      <p className="text-xs text-homatri-muted mt-0.5">
                        ₹{item.unitPriceDisplay} · {item.mealWindow}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-homatri-orange">₹{item.lineTotalDisplay}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-homatri-border text-sm font-bold flex items-center justify-center hover:bg-homatri-cream"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-homatri-border text-sm font-bold flex items-center justify-center hover:bg-homatri-cream"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.customNote || ""}
                    onChange={(event) => updateItemNote(item.menuItemId, event.target.value)}
                    placeholder="e.g. less oil, no garlic"
                    className="mt-3 w-full text-xs border border-homatri-border rounded-xl px-3 py-2 text-homatri-dark focus:outline-none"
                  />
                </div>
              ))
            )}

            {items.length > 0 && (
              <label className="block text-xs font-bold text-homatri-dark pt-2">
                Special Kitchen Instructions
                <textarea
                  value={customNotes}
                  onChange={(event) => setCustomNotes(event.target.value)}
                  rows={2}
                  placeholder="e.g. Please send extra chutney / separate roti wrapper"
                  className="mt-1.5 w-full text-xs border border-homatri-border rounded-xl px-3 py-2 font-normal focus:outline-none"
                />
              </label>
            )}

            {/* Zomato/Swiggy-Style Address Pre-Check Box */}
            {items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-homatri-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-homatri-orange" />
                    <span className="text-xs font-extrabold text-homatri-dark">Delivery Address</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark flex items-center gap-0.5"
                  >
                    {savedAddress ? "Change" : "+ Add"}
                  </button>
                </div>

                {savedAddress ? (
                  <div className="p-3 bg-homatri-cream border border-homatri-border rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="bg-homatri-orange text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        {savedAddress.addressType || "DELIVERY"}
                      </span>
                      <p className="text-xs font-bold text-homatri-dark mt-1 line-clamp-1">
                        {savedAddress.fullAddress}
                      </p>
                      <p className="text-[10px] text-homatri-muted">
                        Phone: +91 {savedAddress.phone || customerPhone || "7416767453"}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="w-full p-3 border border-dashed border-homatri-orange/50 bg-homatri-orange-light rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-homatri-orange hover:bg-homatri-orange/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Select Delivery Address & Location</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="border-t border-homatri-border p-5 space-y-2.5 bg-white">
              <div className="flex justify-between text-xs text-homatri-muted">
                <span>Items Subtotal</span>
                <span className="font-semibold text-homatri-dark">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-homatri-muted">
                <span>Delivery Fee</span>
                <span className="font-semibold text-homatri-dark">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-homatri-dark pt-1 border-t border-homatri-border">
                <span>Total Amount ({currency})</span>
                <span className="text-base text-homatri-orange">₹{total}</span>
              </div>

              {checkoutError ? (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center font-medium">
                  {checkoutError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!canCheckout || isSubmitting || isCheckoutLoading || items.length === 0}
                onClick={handleCheckoutClick}
                className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {!isAuthenticated
                  ? "Sign In to Checkout"
                  : !savedAddress
                  ? "Add Address & Pay"
                  : `Proceed to Pay (₹${total})`}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Address Selection Drawer */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaveAddress={(addressData) => setSavedAddress(addressData)}
      />
    </>
  );
}
