"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [mealWindow, setMealWindow] = useState("LUNCH"); // LUNCH or DINNER
  const [deliveryFee] = useState(30.0);

  const addToCart = (item) => {
    setCartItems((prev) => [...prev, item]);
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.item_id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((acc, i) => acc + (i.unit_price * (i.quantity || 1)), 0);
  const totalAmount = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        mealWindow,
        setMealWindow,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
