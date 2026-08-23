"use client";

import { usePathname } from "next/navigation";
import { ChefDashboardProvider } from "@/context/ChefDashboardContext";
import LeftSidebarNav from "./_components/LeftSidebarNav";

export default function ChefLayout({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/chef/onboarding")) {
    return <div className="min-h-screen bg-homatri-cream">{children}</div>;
  }
  return (
    <ChefDashboardProvider>
      <div className="min-h-screen bg-homatri-cream flex flex-col lg:flex-row">
        <LeftSidebarNav />
        <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-5xl w-full">{children}</main>
      </div>
    </ChefDashboardProvider>
  );
}
