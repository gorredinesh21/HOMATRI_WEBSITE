"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { checkoutOrder, DELIVERY_FEE_DISPLAY } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay is browser-only"));
      return;
    }
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export function CartProvider({ children }) {
  const { token, customerPhone, requireAuthentication, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [mealWindow, setMealWindowState] = useState(null);
  const [customNotes, setCustomNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const pendingCheckout = useRef(false);

  const deliveryFee = items.length > 0 ? DELIVERY_FEE_DISPLAY : 0;
  const subtotal = items.reduce((sum, item) => sum + (item.lineTotalDisplay || 0), 0);
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  const addItem = useCallback((item) => {
    if (!item?.menuItemId || !item?.chefId) return;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unit = Number(item.unitPriceDisplay) || 0;

    setError(null);
    setItems((prev) => {
      if (prev.length > 0) {
        if (prev[0].chefId !== item.chefId) {
          setError("Cart can hold items from one kitchen at a time. Clear the cart to switch kitchens.");
          return prev;
        }
        if (prev[0].mealWindow !== item.mealWindow) {
          setError(`Cart is set to ${prev[0].mealWindow}. Clear it to order ${item.mealWindow}.`);
          return prev;
        }
      }

      setMealWindowState(item.mealWindow || null);
      const existing = prev.find((entry) => entry.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((entry) => {
          if (entry.menuItemId !== item.menuItemId) return entry;
          const nextQty = entry.quantity + quantity;
          return {
            ...entry,
            quantity: nextQty,
            lineTotalDisplay: nextQty * entry.unitPriceDisplay,
            customNote: item.customNote ?? entry.customNote,
          };
        });
      }

      return [
        ...prev,
        {
          menuItemId: item.menuItemId,
          chefId: item.chefId,
          itemName: item.itemName,
          quantity,
          mealWindow: item.mealWindow,
          unitPriceDisplay: unit,
          lineTotalDisplay: unit * quantity,
          customNote: item.customNote || "",
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.menuItemId !== menuItemId);
      if (next.length === 0) setMealWindowState(null);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    const nextQty = Number(quantity);
    if (!Number.isInteger(nextQty) || nextQty < 1) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: nextQty, lineTotalDisplay: nextQty * item.unitPriceDisplay }
          : item
      )
    );
  }, [removeItem]);

  const updateItemNote = useCallback((menuItemId, note) => {
    setItems((prev) =>
      prev.map((item) => (item.menuItemId === menuItemId ? { ...item, customNote: note } : item))
    );
  }, []);

  const setMealWindow = useCallback((window) => {
    setMealWindowState(window);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const clearCart = useCallback(() => {
    setItems([]);
    setMealWindowState(null);
    setCustomNotes("");
    setError(null);
  }, []);

  const beginCheckout = useCallback(async () => {
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!isAuthenticated) {
      pendingCheckout.current = true;
      requireAuthentication(() => {
        pendingCheckout.current = false;
        beginCheckout();
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      meal_window: mealWindow,
      dietary_notes: customNotes || null,
      items: items.map((item) => ({
        menu_item_id: item.menuItemId,
        chef_id: item.chefId,
        quantity: item.quantity,
        customer_note: item.customNote || null,
      })),
    };

    try {
      const result = await checkoutOrder(payload, token);
      const orderId = result?.order_id || result?.id || `ORD-${Date.now()}`;
      const amountPaise = result?.amount || total * 100;
      const amountRupees = (amountPaise / 100).toFixed(2);

      clearCart();
      closeCart();

      // Full page navigation to dedicated Payment Page (Zero Popup Blockers!)
      window.location.href = `/order/payment?order_id=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amountRupees)}`;
      return result;

      setError("Checkout started, but the payment session was incomplete. Please retry.");
      return result;
    } catch (err) {
      setError(err?.message || "Checkout failed. The server recalculates totals — please retry.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    items,
    isAuthenticated,
    requireAuthentication,
    mealWindow,
    customNotes,
    token,
    customerPhone,
    clearCart,
    closeCart,
  ]);

  const value = useMemo(
    () => ({
      items,
      cartItems: items,
      mealWindow,
      subtotal,
      deliveryFee,
      total,
      totalAmount: total,
      customNotes,
      isOpen,
      isSubmitting,
      error,
      addItem,
      addToCart: addItem,
      removeItem,
      removeFromCart: removeItem,
      updateQuantity,
      updateItemNote,
      setMealWindow,
      setCustomNotes,
      openCart,
      closeCart,
      clearCart,
      beginCheckout,
    }),
    [
      items,
      mealWindow,
      subtotal,
      deliveryFee,
      total,
      customNotes,
      isOpen,
      isSubmitting,
      error,
      addItem,
      removeItem,
      updateQuantity,
      updateItemNote,
      setMealWindow,
      openCart,
      closeCart,
      clearCart,
      beginCheckout,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
