"use client";

import { usePathname } from "next/navigation";
import { RiderProvider } from "@/context/RiderContext";

export default function RiderLayout({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/rider/onboarding")) {
    return <div className="min-h-screen bg-homatri-cream max-w-md mx-auto">{children}</div>;
  }
  return (
    <RiderProvider>
      <div className="min-h-screen bg-homatri-cream max-w-md mx-auto">{children}</div>
    </RiderProvider>
  );
}
