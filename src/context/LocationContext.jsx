"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LocationContext = createContext(null);

const DEFAULT_CLUSTER = "Ghansoli";
const STORAGE_KEY = "homatri_location_v1";

// Hyperlocal browsing: the saved pin decides which kitchens the customer sees.
export function readSavedLocation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number") return parsed;
  } catch {
    /* corrupted entry — treat as absent */
  }
  return null;
}

export function persistLocation(entry) {
  if (typeof window === "undefined") return;
  if (entry) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function LocationProvider({ children }) {
  const [activeCluster, setActiveCluster] = useState(DEFAULT_CLUSTER);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddressState] = useState(null);
  const [isResolved, setIsResolved] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore the saved delivery pin once on mount so hyperlocal filtering
  // survives reloads without asking again.
  useEffect(() => {
    const saved = readSavedLocation();
    if (saved) {
      setLatitude(saved.latitude);
      setLongitude(saved.longitude);
      if (saved.label) setAddressState(saved.label);
    }
    setHydrated(true);
  }, []);

  const setCluster = useCallback((cluster) => {
    setActiveCluster(cluster || null);
    setIsResolved(Boolean(cluster));
    setError(null);
  }, []);

  const setCoordinates = useCallback((lat, lon, label = null) => {
    if (lat != null && (lat < -90 || lat > 90)) {
      setError("Latitude must be between -90 and 90.");
      return;
    }
    if (lon != null && (lon < -180 || lon > 180)) {
      setError("Longitude must be between -180 and 180.");
      return;
    }
    setLatitude(lat ?? null);
    setLongitude(lon ?? null);
    persistLocation(
      lat != null && lon != null ? { latitude: lat, longitude: lon, label: label || address } : null
    );
  }, [address]);

  const setAddress = useCallback((nextAddress) => {
    setAddressState(nextAddress || null);
  }, []);

  const setLocation = useCallback((input = {}) => {
    if (input.activeCluster !== undefined) setActiveCluster(input.activeCluster || null);
    if (input.latitude !== undefined || input.longitude !== undefined) {
      setCoordinates(input.latitude ?? null, input.longitude ?? null);
    }
    if (input.address !== undefined) setAddressState(input.address || null);
    setIsResolved(true);
    setIsLoading(false);
  }, [setCoordinates]);

  const clearLocation = useCallback(() => {
    setActiveCluster(null);
    setLatitude(null);
    setLongitude(null);
    setAddressState(null);
    setIsResolved(false);
    persistLocation(null);
  }, []);

  const value = useMemo(
    () => ({
      activeCluster,
      latitude,
      longitude,
      address,
      isResolved,
      isLoading,
      error,
      hydrated,
      hasCoords: latitude != null && longitude != null,
      setCluster,
      setCoordinates,
      setAddress,
      setLocation,
      clearLocation,
      locationLabel: address || (activeCluster ? `${activeCluster}, Navi Mumbai` : "Select locality"),
    }),
    [
      activeCluster,
      latitude,
      longitude,
      address,
      isResolved,
      isLoading,
      error,
      hydrated,
      setCluster,
      setCoordinates,
      setAddress,
      setLocation,
      clearLocation,
    ],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
