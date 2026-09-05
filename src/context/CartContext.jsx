"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { checkoutOrder, verifyOrderPayment, DELIVERY_FEE_DISPLAY } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, customerPhone, requireAuthentication, isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [mealWindow, setMealWindowState] = useState(null);
  const [customNotes, setCustomNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethodState] = useState("COD");
  const [pendingPayment, setPendingPayment] = useState(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
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

  const beginCheckout = useCallback(async (deliveryAddress = null) => {
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!isAuthenticated) {
      pendingCheckout.current = true;
      requireAuthentication(() => {
        pendingCheckout.current = false;
        beginCheckout(deliveryAddress);
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      meal_window: mealWindow,
      dietary_notes: customNotes || null,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        menu_item_id: item.menuItemId,
        chef_id: item.chefId,
        quantity: item.quantity,
        customer_note: item.customNote || null,
      })),
    };
    // The cart drawer passes the selected delivery address through — without it
    // the backend falls back to the (often empty) customer profile and rejects.
    if (deliveryAddress?.fullAddress || deliveryAddress?.id) {
      payload.delivery_address = {
        address_id: deliveryAddress.id || null,
        full_address: deliveryAddress.fullAddress || deliveryAddress.full_address || null,
        phone: deliveryAddress.phone || customerPhone || null,
        latitude: deliveryAddress.latitude ?? null,
        longitude: deliveryAddress.longitude ?? null,
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
      total,
      totalAmount: total,
      customNotes,
      isOpen,
      isSubmitting,
      error,
      paymentMethod,
      setPaymentMethod,
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
      total,
      customNotes,
      isOpen,
      isSubmitting,
      error,
      paymentMethod,
      setPaymentMethod,
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
