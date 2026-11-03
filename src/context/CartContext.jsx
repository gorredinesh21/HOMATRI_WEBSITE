"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { checkoutOrder, verifyOrderPayment, DELIVERY_FEE_DISPLAY } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { resolveCheckoutMealWindow } from "@/lib/mealWindow";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "homatri_cart_v2";

function loadPersistedCart() {
  if (typeof window === "undefined") return { items: [], mealWindow: null, paymentMethod: null, deliveryAddress: null };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "{}");
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      mealWindow: parsed.mealWindow || null,
      paymentMethod: parsed.paymentMethod === "COD" ? "COD" : parsed.paymentMethod === "RAZORPAY" ? "RAZORPAY" : null,
      deliveryAddress: parsed.deliveryAddress || null,
    };
  } catch {
    return { items: [], mealWindow: null, paymentMethod: null, deliveryAddress: null };
  }
}

export function CartProvider({ children }) {
  const { token, customerPhone, requireAuthentication, isAuthenticated, user } = useAuth();
  const [persisted] = useState(loadPersistedCart);
  const [items, setItems] = useState(persisted.items);
  const [mealWindow, setMealWindowState] = useState(persisted.mealWindow);
  const [deliveryAddress, setDeliveryAddress] = useState(persisted.deliveryAddress);
  const [customNotes, setCustomNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethodState] = useState(persisted.paymentMethod || "RAZORPAY");
  const [pendingPayment, setPendingPayment] = useState(null);

  // Cart survives refreshes: items, window, payment method and chosen address.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, mealWindow, paymentMethod, deliveryAddress })
      );
    } catch {
      // Private mode / storage full — cart just won't persist.
    }
  }, [items, mealWindow, paymentMethod, deliveryAddress]);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const pendingCheckout = useRef(false);

  const deliveryFee = items.length > 0 ? DELIVERY_FEE_DISPLAY : 0;
  const subtotal = items.reduce((sum, item) => sum + (item.lineTotalDisplay || 0), 0);
  // A combo discount applies per COMPLETE pair (two distinct dishes, one portion
  // each) — an incomplete pair earns nothing and blocks checkout with a message.
  const comboGroups = useMemo(() => {
    const groups = new Map();
    for (const item of items) {
      if (!item.comboId) continue;
      if (!groups.has(item.comboId)) {
        groups.set(item.comboId, { comboId: item.comboId, name: item.comboName, discount: item.comboDiscount || 0, lines: [] });
      }
      groups.get(item.comboId).lines.push(item);
    }
    return [...groups.values()];
  }, [items]);
  const comboDiscount = comboGroups.reduce((sum, g) => {
    const complete = g.lines.length === 2 && g.lines.every((l) => l.quantity === 1) && g.lines[0].menuItemId !== g.lines[1].menuItemId;
    return sum + (complete ? g.discount : 0);
  }, 0);
  const incompleteCombos = comboGroups.filter(
    (g) => !(g.lines.length === 2 && g.lines.every((l) => l.quantity === 1) && g.lines[0].menuItemId !== g.lines[1].menuItemId)
  );
  const total = subtotal > 0 ? subtotal + deliveryFee - comboDiscount : 0;

  // Combo lines (Bhookh Buddies / Pocket Friendly Feast) are their own cart row —
  // a dish inside a pair never merges with a plain order of the same dish, and the
  // pair price only lands when the backend validates the two-meal selection.
  const addItem = useCallback((item) => {
    if (!item?.menuItemId || !item?.chefId) return;
    const comboId = item.comboId || null;
    const quantity = comboId ? 1 : Math.max(1, Number(item.quantity) || 1);
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
      const sameLine = (entry) => entry.menuItemId === item.menuItemId && (entry.comboId || null) === comboId;
      const existing = prev.find(sameLine);
      if (existing) {
        if (comboId) {
          setError(`You already picked ${item.itemName} for this combo — choose a different second dish.`);
          return prev;
        }
        return prev.map((entry) => {
          if (!sameLine(entry)) return entry;
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
          comboId,
          comboName: item.comboName || null,
          comboDiscount: Number(item.comboDiscount) || 0,
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
      prev.map((item) => {
        if (item.menuItemId !== menuItemId) return item;
        // Combo meals are exactly one portion each — that's what the pair price validates.
        const qty = item.comboId ? 1 : nextQty;
        return { ...item, quantity: qty, lineTotalDisplay: qty * item.unitPriceDisplay };
      })
    );
  }, [removeItem]);

  const updateItemNote = useCallback((menuItemId, note) => {
    setItems((prev) =>
      prev.map((item) => (item.menuItemId === menuItemId ? { ...item, customNote: note } : item))
    );
  }, []);

  const setMealWindow = useCallback((window) => {
    setMealWindowState(window);
    // Keep line items aligned with the cart window (checkout sends the cart window).
    setItems((prev) => prev.map((entry) => ({ ...entry, mealWindow: window })));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const clearCart = useCallback(() => {
    setItems([]);
    setMealWindowState(null);
    setCustomNotes("");
    setError(null);
  }, []);

  const setPaymentMethod = useCallback((method) => {
    if (method === "COD" || method === "RAZORPAY") setPaymentMethodState(method);
  }, []);

  const routeToTracking = (orderId) => {
    window.location.href = `/order/tracking?order_id=${encodeURIComponent(orderId)}`;
  };

  // Real Razorpay Checkout modal. On success the handler posts the gateway ids +
  // signature to verify-payment; on dismissal the order stays PENDING_PAYMENT and
  // the customer lands on tracking where they can retry.
  const openRealCheckout = async (payment, orderId) => {
    await openRazorpayCheckout({
      payment,
      orderId,
      customerPhone,
      name: user?.name,
      verify: (response) =>
        verifyOrderPayment(orderId, token, {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      onDone: () => routeToTracking(orderId),
    });
  };

  const beginCheckout = useCallback(async (checkoutAddress = null) => {
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!isAuthenticated) {
      pendingCheckout.current = true;
      requireAuthentication(() => {
        pendingCheckout.current = false;
        beginCheckout(checkoutAddress);
      });
      return;
    }

    if (incompleteCombos.length > 0) {
      const g = incompleteCombos[0];
      setError(
        g.lines.length === 1
          ? `Your ${g.name || "combo"} pair needs a second dish — pick one more meal or remove the lone item.`
          : `${g.name || "Combo"} pairs need two different dishes, one portion each.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Resolve against the live meal clock: a LUNCH cart after the 11:30
    // cutoff checks out as the orderable window instead of being rejected.
    const checkoutWindow = resolveCheckoutMealWindow(items).mealWindow;
    const payload = {
      meal_window: checkoutWindow,
      dietary_notes: customNotes || null,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        menu_item_id: item.menuItemId,
        chef_id: item.chefId,
        quantity: item.quantity,
        customer_note: item.customNote || null,
        combo_category_id: item.comboId || null,
      })),
    };
    // The cart drawer passes the selected delivery address through — without it
    // the backend falls back to the (often empty) customer profile and rejects.
    const addressToSend = checkoutAddress || deliveryAddress;
    if (addressToSend?.fullAddress || addressToSend?.id) {
      payload.delivery_address = {
        address_id: addressToSend.id || null,
        full_address: addressToSend.fullAddress || addressToSend.full_address || null,
        phone: addressToSend.phone || customerPhone || null,
        latitude: addressToSend.latitude ?? null,
        longitude: addressToSend.longitude ?? null,
      };
    }

    try {
      const result = await checkoutOrder(payload, token);
      const orderId = result?.order_id;
      if (!orderId) throw new Error("Checkout did not return an order id.");

      if (result?.order_status === "PENDING_PAYMENT" || result?.payment_method === "RAZORPAY") {
        clearCart();
        closeCart();
        const payment = result?.payment;
        if (payment?.mode === "REAL" && payment?.razorpay_order_id) {
          await openRealCheckout(payment, orderId);
          return result;
        }
        // Mock / token-mode simulator sheet.
        setPendingPayment({
          orderId,
          orderTotal: payment?.order_total_rupees ?? total,
          tokenAmount: payment?.amount_rupees ?? 1,
          paymentLinkUrl: payment?.payment_link_url || null,
        });
        return result;
      }

      clearCart();
      closeCart();
      routeToTracking(orderId);
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
    paymentMethod,
    token,
    customerPhone,
    user,
    total,
    incompleteCombos,
    clearCart,
    closeCart,
  ]);

  const confirmPayment = useCallback(async () => {
    if (!pendingPayment?.orderId) return;
    setIsVerifyingPayment(true);
    setError(null);
    try {
      await verifyOrderPayment(pendingPayment.orderId, token);
      const orderId = pendingPayment.orderId;
      setPendingPayment(null);
      closeCart();
      routeToTracking(orderId);
    } catch (err) {
      setError(err?.message || "Payment verification failed. Please try again.");
    } finally {
      setIsVerifyingPayment(false);
    }
  }, [pendingPayment, token, closeCart]);

  const dismissPendingPayment = useCallback(() => setPendingPayment(null), []);

  const value = useMemo(
    () => ({
      items,
      cartItems: items,
      mealWindow,
      subtotal,
      deliveryFee,
      comboDiscount,
      comboGroups,
      total,
      totalAmount: total,
      customNotes,
      isOpen,
      isSubmitting,
      error,
      paymentMethod,
      setPaymentMethod,
      deliveryAddress,
      setDeliveryAddress,
      pendingPayment,
      isVerifyingPayment,
      confirmPayment,
      dismissPendingPayment,
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
      comboDiscount,
      comboGroups,
      total,
      customNotes,
      isOpen,
      isSubmitting,
      error,
      paymentMethod,
      setPaymentMethod,
      deliveryAddress,
      setDeliveryAddress,
      pendingPayment,
      isVerifyingPayment,
      confirmPayment,
      dismissPendingPayment,
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
