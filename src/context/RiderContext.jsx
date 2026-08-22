"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { riderLocationWsUrl } from "@/lib/api";
import { getActiveMealWindow } from "@/lib/mealWindow";
import {
  ASSIGNED_KITCHEN,
  INITIAL_STOPS,
  RIDER_PROFILE,
  groupPendingStops,
} from "@/lib/riderTrip";

const RiderContext = createContext(null);

export function RiderProvider({ children }) {
  const windowInfo = getActiveMealWindow();
  const [shiftStatus, setShiftStatus] = useState("OFF_SHIFT");
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [helpNotice, setHelpNotice] = useState(null);
  const [lastGpsAt, setLastGpsAt] = useState(null);
  const socketRef = useRef(null);
  const gpsTimerRef = useRef(null);

  const pendingStops = useMemo(() => stops.filter((stop) => stop.status === "PENDING"), [stops]);
  const currentGroup = useMemo(() => groupPendingStops(stops), [stops]);
  const remainingStops = useMemo(() => {
    const gates = new Set(pendingStops.map((stop) => stop.gateId));
    return gates.size;
  }, [pendingStops]);
  const tiffinCount = stops.reduce((sum, stop) => sum + stop.tiffinCount, 0);

  const [pickupDone, setPickupDone] = useState(false);

  const machineState = useMemo(() => {
    if (shiftStatus === "OFF_SHIFT") return "OFF_SHIFT";
    if (!pickupDone) return "ASSIGNED_BATCH";
    if (pendingStops.length === 0) return "BATCH_COMPLETED";
    return "DELIVERIES_IN_PROGRESS";
  }, [shiftStatus, pickupDone, pendingStops.length]);

  const toggleShift = useCallback(() => {
    if (shiftStatus !== "OFF_SHIFT") {
      if (machineState === "DELIVERIES_IN_PROGRESS" || machineState === "ASSIGNED_BATCH") {
        setHelpNotice("Finish or wait for reassignment before going off shift.");
        return;
      }
      setShiftStatus("OFF_SHIFT");
      setPickupDone(false);
      setStops(INITIAL_STOPS);
      return;
    }
    setShiftStatus("ON_SHIFT");
    setHelpNotice(null);
  }, [shiftStatus, machineState]);

  const confirmPickup = useCallback(async () => {
    setPickupDone(true);
    setHelpNotice("Pickup confirmed. Orders are PICKED_UP_BY_DRIVER. Leg 1 is open.");
  }, []);

  const markDelivered = useCallback(async (orderId) => {
    setStops((prev) =>
      prev.map((stop) => (stop.orderId === orderId ? { ...stop, status: "DELIVERED" } : stop))
    );
  }, []);

  const confirmAllAtGate = useCallback(async (orderIds) => {
    setStops((prev) =>
      prev.map((stop) =>
        orderIds.includes(stop.orderId) && stop.status === "PENDING"
          ? { ...stop, status: "DELIVERED" }
          : stop
      )
    );
  }, []);

  const markUndelivered = useCallback(async (orderId, reason) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.orderId === orderId ? { ...stop, status: "UNDELIVERED", undeliveredReason: reason } : stop
      )
    );
  }, []);

  const reportKitchenDelay = useCallback(async () => {
    setHelpNotice("Master agent notified: kitchen delay. Customers will get a WhatsApp update.");
  }, []);

  const reportAddressIssue = useCallback(async () => {
    setHelpNotice("Master agent notified: address issue. A location pin will be requested from the customer.");
  }, []);

  useEffect(() => {
    if (shiftStatus !== "ON_SHIFT") {
      socketRef.current?.close();
      socketRef.current = null;
      if (gpsTimerRef.current) clearInterval(gpsTimerRef.current);
      return undefined;
    }

    try {
      socketRef.current = new WebSocket(riderLocationWsUrl());
    } catch {
      socketRef.current = null;
    }

    const sendFix = (coords) => {
      const payload = {
        action: "update_location",
        rider_id: RIDER_PROFILE.riderId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading ?? 0,
        timestamp: new Date().toISOString(),
      };
      setLastGpsAt(payload.timestamp);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
      }
    };

    const ping = () => {
      if (!navigator.geolocation) {
        sendFix({ latitude: 19.123456, longitude: 73.012345, heading: 185.5 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          sendFix({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            heading: pos.coords.heading,
          }),
        () => sendFix({ latitude: 19.123456, longitude: 73.012345, heading: 185.5 }),
        { maximumAge: 8000, timeout: 8000 }
      );
    };

    ping();
    gpsTimerRef.current = setInterval(ping, 10000);

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
      if (gpsTimerRef.current) clearInterval(gpsTimerRef.current);
    };
  }, [shiftStatus]);

  const value = useMemo(
    () => ({
      rider: RIDER_PROFILE,
      kitchen: ASSIGNED_KITCHEN,
      windowInfo,
      shiftStatus,
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
    }),
    [
      windowInfo,
      shiftStatus,
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
    ]
  );

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
}

export function useRider() {
  const context = useContext(RiderContext);
  if (!context) throw new Error("useRider must be used within RiderProvider");
  return context;
}
