"use client";

import { RiderProvider } from "@/context/RiderContext";

export default function RiderLayout({ children }) {
  return (
    <RiderProvider>
      <div className="min-h-screen bg-homatri-cream max-w-md mx-auto">{children}</div>
    </RiderProvider>
  );
}
