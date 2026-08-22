"use client";

import { createContext, useContext, useState } from "react";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [activeLocation, setActiveLocation] = useState("Ghansoli, Navi Mumbai");
  const [selectedCluster, setSelectedCluster] = useState("Ghansoli");

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        setActiveLocation,
        selectedCluster,
        setSelectedCluster,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
