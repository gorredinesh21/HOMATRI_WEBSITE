"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefDashboardProvider, useChefDashboard } from "@/context/ChefDashboardContext";
import { useAuth } from "@/context/AuthContext";
import LeftSidebarNav from "./_components/LeftSidebarNav";

// Whole-portal gate: no session, or a session that is not a chef kitchen,
// sees a sign-in screen instead of the (empty) dashboard.
function ChefGate({ children }) {
  const { token, requireAuthentication, customerPhone } = useAuth();
  const { error } = useChefDashboard();
  const wrongRole = Boolean(token) && String(error || "").includes("CHEF");

  if (!token || wrongRole) {
    return (
      <div className="min-h-screen bg-homatri-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-homatri-border rounded-3xl p-8 text-center space-y-4">
          <p className="font-display italic text-homatri-orange">Homatri Kitchen</p>
          <h1 className="font-display text-2xl font-medium text-homatri-dark">
            {wrongRole ? "This account is not a chef kitchen" : "Chef sign in required"}
          </h1>
          <p className="text-sm text-homatri-muted">
            {wrongRole
              ? `You're signed in as +91 ${customerPhone || ""} (customer). Sign in with your kitchen's phone number.`
              : "Sign in with your kitchen's phone & password to manage orders, menus and payouts."}
          </p>
          <button
            type="button"
            onClick={() => requireAuthentication(() => {})}
            className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl text-sm"
          >
            Sign in to your kitchen
          </button>
          <Link
            href="/chef/onboarding"
            className="block text-xs font-semibold text-homatri-orange hover:underline"
          >
            New homemaker? Onboard your kitchen →
          </Link>
        </div>
      </div>
    );
  }
  return children;
}

export default function ChefLayout({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/chef/onboarding")) {
    return <div className="min-h-screen bg-homatri-cream">{children}</div>;
  }
  return (
    <ChefDashboardProvider>
      <ChefGate>
        <div className="min-h-screen bg-homatri-cream flex flex-col lg:flex-row">
          <LeftSidebarNav />
          <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-5xl w-full">{children}</main>
        </div>
      </ChefGate>
    </ChefDashboardProvider>
  );
}
