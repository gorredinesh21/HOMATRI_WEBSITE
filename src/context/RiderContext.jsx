"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchRiderTrip,
  fetchRiderWsUrl,
  riderConfirmGate,
  riderConfirmPickup,
  riderDeliver,
  riderReport,
  riderSetShift,
  riderSos,
  riderUndelivered,
} from "@/lib/api";
import { groupPendingStops } from "@/lib/riderTrip";

const RiderContext = createContext(null);

export function RiderProvider({ children }) {
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [helpNotice, setHelpNotice] = useState(null);
  const [lastGpsAt, setLastGpsAt] = useState(null);
  const socketRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setTrip(null);
      return;
    }
    const data = await fetchRiderTrip(token);
    setTrip(data);
    if (data?.gps?.timestamp) setLastGpsAt(data.gps.timestamp);
  }, [token]);

  useEffect(() => {
    refresh().catch((err) => setHelpNotice(err.message));
    const id = setInterval(() => refresh().catch(() => {}), 8000);
    return () => clearInterval(id);
  }, [refresh]);

  const shiftOn = Boolean(trip?.shift_on);
  const stops = trip?.stops || [];
  const currentGroup = groupPendingStops(
    stops.map((s) => ({
      ...s,
      orderId: s.orderId,
      gateId: s.gateId,
      status: s.status,
      tiffinCount: s.tiffinCount,
    }))
  );
  const pendingStops = stops.filter((s) => s.status === "PENDING");
  const remainingStops = new Set(pendingStops.map((s) => s.gateId)).size;
  const tiffinCount = trip?.tiffinCount || 0;
  const machineState = trip?.machineState || (shiftOn ? "ON_SHIFT" : "OFF_SHIFT");
  const pickupDone = Boolean(trip?.pickupDone);
  const windowInfo = trip?.windowInfo || { label: "", mealWindow: "LUNCH", cutoffTime: "" };

  const toggleShift = useCallback(async () => {
    try {
      const data = await riderSetShift(!shiftOn, token);
      setTrip(data);
      setHelpNotice(null);
    } catch (err) {
      setHelpNotice(err.message);
    }
  }, [shiftOn, token]);

  const confirmPickup = useCallback(async () => {
    const data = await riderConfirmPickup(token);
    setTrip(data);
    setHelpNotice("Pickup confirmed.");
  }, [token]);

  const markDelivered = useCallback(
    async (orderId, otp) => {
      const pin = otp || window.prompt("Customer delivery PIN");
      if (!pin) return;
      const data = await riderDeliver(orderId, pin, token);
      setTrip(data);
    },
    [token]
  );

  const confirmAllAtGate = useCallback(
    async (orderIds) => {
      const deliveries = [];
      for (const orderId of orderIds) {
        const pin = window.prompt(`PIN for ${orderId}`);
        if (!pin) return;
        deliveries.push({ order_id: orderId, otp: pin });
      }
      const data = await riderConfirmGate(deliveries, token);
      setTrip(data);
    },
    [token]
  );

  const markUndelivered = useCallback(
    async (orderId, reason) => {
      const data = await riderUndelivered(orderId, reason || "Customer not available", token);
      setTrip(data);
    },
    [token]
  );

  const reportKitchenDelay = useCallback(async () => {
    const res = await riderReport("kitchen_delay", token);
    setHelpNotice(res.notice);
  }, [token]);

  const reportAddressIssue = useCallback(async () => {
    const res = await riderReport("address_issue", token);
    setHelpNotice(res.notice);
  }, [token]);

  const sos = useCallback(async () => {
    const res = await riderSos(token);
    setHelpNotice(res.notice);
  }, [token]);

  useEffect(() => {
    if (!token || !shiftOn) {
      socketRef.current?.close();
      socketRef.current = null;
      return undefined;
    }
    let cancelled = false;
    let ws = null;
    let timer = null;
    (async () => {
      const url = await fetchRiderWsUrl(token);
      if (cancelled || !url) return;
      ws = new WebSocket(url);
      socketRef.current = ws;
    const ping = () => {
      const send = (coords) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              latitude: coords.latitude,
              longitude: coords.longitude,
              heading: coords.heading ?? 0,
            })
          );
        }
      };
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => send(pos.coords),
        () => {},
        { maximumAge: 8000, timeout: 8000 }
      );
    };
    ws.onopen = ping;
    timer = setInterval(ping, 10000);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.timestamp) setLastGpsAt(msg.timestamp);
      } catch {
        /* ignore */
      }
    };
    })();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      ws?.close();
    };
  }, [token, shiftOn]);

  const value = useMemo(
    () => ({
      rider: trip?.rider || { fullName: "", vehicleNumber: "", phoneNumber: "" },
      kitchen: trip?.kitchen,
      windowInfo,
      shiftStatus: shiftOn ? "ON_SHIFT" : "OFF_SHIFT",
      machineState,
      pickupDone,
      stops,
      currentGroup,
      remainingStops,
      tiffinCount,
      helpNotice,
      lastGpsAt,
      toggleShift,
      confirmPickup,
      markDelivered,
      confirmAllAtGate,
      markUndelivered,
      reportKitchenDelay,
      reportAddressIssue,
      sos,
      refresh,
    }),
    [
      trip,
      windowInfo,
      shiftOn,
      machineState,
      pickupDone,
      stops,
      currentGroup,
      remainingStops,
      tiffinCount,
      helpNotice,
      lastGpsAt,
      toggleShift,
      confirmPickup,
      markDelivered,
      confirmAllAtGate,
      markUndelivered,
      reportKitchenDelay,
      reportAddressIssue,
      sos,
      refresh,
    ]
  );

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
}

export function useRider() {
  const context = useContext(RiderContext);
  if (!context) throw new Error("useRider must be used within RiderProvider");
  return context;
}
