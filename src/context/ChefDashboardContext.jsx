"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  chefCreateMenu,
  chefLockBatch,
  chefMarkPacked,
  chefPatchKitchen,
  chefPauseKitchen,
  chefSetAccepting,
  chefToggleStock,
  fetchChefDashboard,
  respondDietaryRequest,
} from "@/lib/api";
import { getActiveMealWindow } from "@/lib/mealWindow";
import { buildCookSummary } from "@/lib/chefDashboard";

const ChefDashboardContext = createContext(null);

const EMPTY_KITCHEN = {
  kitchenName: "",
  chefName: "",
  address: "",
  hometownRegion: "",
  dailyCapacity: 0,
  fssaiLicenseNumber: "",
};

export function ChefDashboardProvider({ children }) {
  const { token } = useAuth();
  const fallbackWindow = getActiveMealWindow();
  const [snapshot, setSnapshot] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setSnapshot(null);
      return;
    }
    const data = await fetchChefDashboard(token);
    setSnapshot(data);
  }, [token]);

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
    const id = setInterval(() => refresh().catch(() => {}), 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const kitchen = snapshot?.kitchen || EMPTY_KITCHEN;
  const windowInfo = snapshot?.windowInfo
    ? {
        mealWindow: snapshot.windowInfo.mealWindow,
        cutoffTime: snapshot.windowInfo.cutoffTime,
        label: snapshot.windowInfo.label,
      }
    : fallbackWindow;
  const orders = snapshot?.orders || [];
  const menuItems = snapshot?.menuItems || [];
  const reels = snapshot?.reels || [];
  const dietaryRequests = snapshot?.dietaryRequests || [];
  const cook = snapshot?.cook || buildCookSummary(orders, windowInfo.mealWindow);
  const remainingCapacity = snapshot?.remainingCapacity ?? 0;
  const committedMeals = snapshot?.committedMeals ?? 0;
  const kitchenState = snapshot?.kitchenState || "KITCHEN_CLOSED";
  const isPackedReady = Boolean(snapshot?.isPackedReady);
  const earnings = snapshot?.earnings || {
    todayIncome: 0,
    weeklyPayout: 0,
    completedOrders: 0,
    repeatRetentionPct: 0,
  };
  const rider = snapshot?.rider || { riderName: "Unassigned", vehicleNumber: "—" };

  const run = useCallback(
    async (fn, okMessage) => {
      setError(null);
      try {
        await fn();
        await refresh();
        if (okMessage) setNotice(okMessage);
      } catch (err) {
        setError(err.message);
        setNotice(err.message);
      }
    },
    [refresh]
  );

  const toggleAccepting = useCallback(() => {
    const next = kitchenState !== "ACCEPTING_ORDERS";
    return run(() => chefSetAccepting(next, token));
  }, [kitchenState, run, token]);

  const pauseKitchen = useCallback(() => run(() => chefPauseKitchen(token), "Kitchen paused."), [run, token]);
  const markPacked = useCallback(
    () => run(() => chefMarkPacked(token), "Batch marked packed."),
    [run, token]
  );
  const lockBatch = useCallback(
    () => run(() => chefLockBatch(token), "Cutoff batch locked."),
    [run, token]
  );
  const createMenuItem = useCallback(
    async (item) => {
      await run(() =>
        chefCreateMenu(
          {
            dish_name: item.itemName,
            description: item.description,
            unit_price: Number(item.unitPrice),
            meal_type: item.mealWindow || "LUNCH",
            is_available: true,
          },
          token
        )
      );
    },
    [run, token]
  );
  const updateMenuItem = useCallback(async () => {}, []);
  const toggleAvailability = useCallback(
    (menuItemId) => run(() => chefToggleStock(menuItemId, token)),
    [run, token]
  );
  const setKitchen = useCallback(
    (next) =>
      run(() =>
        chefPatchKitchen(
          {
            kitchen_name: next.kitchenName,
            chef_name: next.chefName,
            address: next.address,
            hometown_region: next.hometownRegion,
            daily_capacity: Number(next.dailyCapacity),
          },
          token
        )
      ),
    [run, token]
  );
  const acceptDietary = useCallback(
    (requestId) =>
      run(() => respondDietaryRequest(requestId, "accept", null, token), "Dietary request accepted."),
    [run, token]
  );
  const rejectDietary = useCallback(
    (requestId) =>
      run(() => respondDietaryRequest(requestId, "reject", null, token), "Dietary request rejected."),
    [run, token]
  );
  const counterDietary = useCallback(
    (requestId, counterOffer) =>
      run(
        () => respondDietaryRequest(requestId, "counter", counterOffer, token),
        "Counter-offer sent to customer."
      ),
    [run, token]
  );
  const addReel = useCallback(() => refresh(), [refresh]);

  const value = useMemo(
    () => ({
      kitchen,
      setKitchen,
      acceptingOrders: kitchenState === "ACCEPTING_ORDERS",
      toggleAccepting,
      pauseKitchen,
      kitchenState,
      remainingCapacity,
      committedMeals,
      capacityReached: remainingCapacity <= 0,
      windowInfo,
      cook,
      isPackedReady,
      markPacked,
      lockBatch,
      menuItems,
      createMenuItem,
      updateMenuItem,
      toggleAvailability,
      orders,
      rider,
      dietaryRequests,
      acceptDietary,
      rejectDietary,
      counterDietary,
      reels,
      addReel,
      earnings,
      notice: notice || error,
      refresh,
    }),
    [
      kitchen,
      setKitchen,
      kitchenState,
      toggleAccepting,
      pauseKitchen,
      remainingCapacity,
      committedMeals,
      windowInfo,
      cook,
      isPackedReady,
      markPacked,
      lockBatch,
      menuItems,
      createMenuItem,
      updateMenuItem,
      toggleAvailability,
      orders,
      rider,
      dietaryRequests,
      acceptDietary,
      rejectDietary,
      counterDietary,
      reels,
      addReel,
      earnings,
      notice,
      error,
      refresh,
    ]
  );

  return <ChefDashboardContext.Provider value={value}>{children}</ChefDashboardContext.Provider>;
}

export function useChefDashboard() {
  const context = useContext(ChefDashboardContext);
  if (!context) throw new Error("useChefDashboard must be used within ChefDashboardProvider");
  return context;
}
