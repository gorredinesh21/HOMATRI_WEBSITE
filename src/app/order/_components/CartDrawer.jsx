"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

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
  const { isAuthenticated } = useAuth();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
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

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onAuthenticate?.();
      return;
    }
    setIsCheckoutLoading(true);
    try {
      await onCheckout?.();
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-homatri-dark/40" onClick={onClose} aria-label="Close cart" />
      <aside
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-homatri-border flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-homatri-border">
          <div>
            <h2 className="font-display text-xl font-medium italic text-homatri-dark">Your tiffin cart</h2>
            <p className="text-xs text-homatri-muted">
              Meal window: <strong>{mealWindow || "Not set"}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-homatri-muted">Your cart is empty. Swipe kitchens or watch a reel to add a tiffin.</p>
          ) : (
            items.map((item) => (
              <div key={item.menuItemId} className="border border-homatri-border rounded-2xl p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-homatri-dark">{item.itemName}</p>
                    <p className="text-xs text-homatri-muted">
                      ₹{item.unitPriceDisplay} · {item.mealWindow}
                    </p>
                  </div>
                  <p className="text-sm font-bold">₹{item.lineTotalDisplay}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border"
                  >
                    +
                  </button>
                </div>
                <input
                  type="text"
                  value={item.customNote || ""}
                  onChange={(event) => updateItemNote(item.menuItemId, event.target.value)}
                  placeholder="less oil, no garlic"
                  className="mt-3 w-full text-xs border border-homatri-border rounded-xl px-3 py-2"
                />
              </div>
            ))
          )}

          <label className="block text-xs font-semibold text-homatri-dark">
            Order-level dietary notes
            <textarea
              value={customNotes}
              onChange={(event) => setCustomNotes(event.target.value)}
              rows={3}
              placeholder="Shared notes for the kitchen"
              className="mt-2 w-full text-sm border border-homatri-border rounded-xl px-3 py-2 font-normal"
            />
          </label>
        </div>

        <div className="border-t border-homatri-border p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-homatri-muted">Subtotal (display)</span>
            <span className="font-semibold">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-homatri-muted">Delivery fee</span>
            <span className="font-semibold">₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-homatri-dark">
            <span>Total ({currency})</span>
            <span>₹{total}</span>
          </div>
          <p className="text-[11px] text-homatri-muted">
            Display totals only. FastAPI recalculates price, stock, capacity, and the ₹30 delivery fee at checkout.
          </p>
          {checkoutError ? (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{checkoutError}</p>
          ) : null}
          <button
            type="button"
            disabled={!canCheckout || isSubmitting || isCheckoutLoading || items.length === 0}
            onClick={handleCheckout}
            className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {isAuthenticated ? "Pay with Razorpay" : "Sign in to checkout"}
          </button>
        </div>
      </aside>
    </div>
  );
}
