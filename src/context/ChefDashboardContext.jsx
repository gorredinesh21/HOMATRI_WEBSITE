"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  ASSIGNED_RIDER,
  CHEF_KITCHEN,
  INITIAL_DIETARY_REQUESTS,
  INITIAL_EARNINGS,
  INITIAL_MENU,
  INITIAL_ORDERS,
  INITIAL_REELS,
  buildCookSummary,
} from "@/lib/chefDashboard";
import { getActiveMealWindow } from "@/lib/mealWindow";

const ChefDashboardContext = createContext(null);

export function ChefDashboardProvider({ children }) {
  const windowInfo = getActiveMealWindow();
  const [kitchen, setKitchen] = useState(CHEF_KITCHEN);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [capacityPaused, setCapacityPaused] = useState(false);
  const [isPackedReady, setIsPackedReady] = useState(false);
  const [menuItems, setMenuItems] = useState(INITIAL_MENU);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [dietaryRequests, setDietaryRequests] = useState(INITIAL_DIETARY_REQUESTS);
  const [reels, setReels] = useState(INITIAL_REELS);
  const [notice, setNotice] = useState(null);

  const committedMeals = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + (order.items || []).reduce((line, item) => line + item.quantity, 0),
      0
    );
  }, [orders]);

  const remainingCapacity = Math.max(0, kitchen.dailyCapacity - committedMeals);
  const capacityReached = remainingCapacity <= 0;
  const kitchenState = capacityPaused
    ? "KITCHEN_PAUSED"
    : !acceptingOrders
      ? "KITCHEN_CLOSED"
      : capacityReached
        ? "CAPACITY_REACHED"
        : "ACCEPTING_ORDERS";

  const cook = useMemo(
    () => buildCookSummary(orders, windowInfo.mealWindow),
    [orders, windowInfo.mealWindow]
  );

  const toggleAccepting = useCallback(() => {
    setAcceptingOrders((open) => !open);
    setCapacityPaused(false);
  }, []);

  const pauseKitchen = useCallback(() => {
    setCapacityPaused(true);
    setAcceptingOrders(false);
  }, []);

  const markPacked = useCallback(async () => {
    setIsPackedReady(true);
    setOrders((prev) =>
      prev.map((order) =>
        order.status === "COOKING" ? { ...order, status: "PACKED_READY" } : order
      )
    );
    setNotice("Batch marked packed. Waiting for driver pickup.");
  }, []);

  const createMenuItem = useCallback(async (item) => {
    const next = {
      ...item,
      menuItemId: `menu-${Date.now()}`,
      unitPrice: Number(item.unitPrice),
    };
    setMenuItems((prev) => [...prev, next]);
  }, []);

  const updateMenuItem = useCallback(async (item) => {
    setMenuItems((prev) => prev.map((entry) => (entry.menuItemId === item.menuItemId ? item : entry)));
  }, []);

  const toggleAvailability = useCallback(async (menuItemId, availability) => {
    setMenuItems((prev) =>
      prev.map((entry) => (entry.menuItemId === menuItemId ? { ...entry, availability } : entry))
    );
  }, []);

  const acceptDietary = useCallback(async (requestId) => {
    setDietaryRequests((prev) =>
      prev.map((request) =>
        request.requestId === requestId ? { ...request, status: "CHEF_ACCEPTED" } : request
      )
    );
  }, []);

  const rejectDietary = useCallback(async (requestId) => {
    setDietaryRequests((prev) =>
      prev.map((request) =>
        request.requestId === requestId ? { ...request, status: "EXPIRED_DEFAULT" } : request
      )
    );
  }, []);

  const counterDietary = useCallback(async (requestId, message) => {
    setDietaryRequests((prev) =>
      prev.map((request) => {
        if (request.requestId !== requestId) return request;
        if (request.counterTurnCount >= 2 || request.status === "EXPIRED_DEFAULT") {
          return request;
        }
        const nextCount = request.counterTurnCount + 1;
        return {
          ...request,
          counterTurnCount: nextCount,
          status: nextCount === 1 ? "CHEF_COUNTERED_1" : "CHEF_COUNTERED_2",
          history: [...(request.history || []), { from: "chef", message }],
        };
      })
    );
  }, []);

  const addReel = useCallback((reel) => {
    setReels((prev) => [reel, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      kitchen,
      setKitchen,
      acceptingOrders,
      toggleAccepting,
      pauseKitchen,
      kitchenState,
      remainingCapacity,
      committedMeals,
      capacityReached,
      windowInfo,
      cook,
      isPackedReady,
      markPacked,
      menuItems,
      createMenuItem,
      updateMenuItem,
      toggleAvailability,
      orders,
      rider: ASSIGNED_RIDER,
      dietaryRequests,
      acceptDietary,
      rejectDietary,
      counterDietary,
      reels,
      addReel,
      earnings: INITIAL_EARNINGS,
      notice,
    }),
    [
      kitchen,
      acceptingOrders,
      toggleAccepting,
      pauseKitchen,
      kitchenState,
      remainingCapacity,
      committedMeals,
      capacityReached,
      windowInfo,
      cook,
      isPackedReady,
      markPacked,
      menuItems,
      createMenuItem,
      updateMenuItem,
      toggleAvailability,
      orders,
      dietaryRequests,
      acceptDietary,
      rejectDietary,
      counterDietary,
      reels,
      addReel,
      notice,
    ]
  );

  return <ChefDashboardContext.Provider value={value}>{children}</ChefDashboardContext.Provider>;
}

export function useChefDashboard() {
  const context = useContext(ChefDashboardContext);
  if (!context) {
    throw new Error("useChefDashboard must be used within ChefDashboardProvider");
  }
  return context;
}
