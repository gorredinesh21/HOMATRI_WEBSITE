"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const LocationContext = createContext(null);

const DEFAULT_CLUSTER = "Ghansoli";

export function LocationProvider({ children }) {
  const [activeCluster, setActiveCluster] = useState(DEFAULT_CLUSTER);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddressState] = useState(null);
  const [isResolved, setIsResolved] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const setCluster = useCallback((cluster) => {
    setActiveCluster(cluster || null);
    setIsResolved(Boolean(cluster));
    setError(null);
  }, []);

  const setCoordinates = useCallback((lat, lon) => {
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
  }, []);

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
      setCluster,
      setCoordinates,
      setAddress,
      setLocation,
      clearLocation,
    ]
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
