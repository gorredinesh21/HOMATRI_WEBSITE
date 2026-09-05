"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  UtensilsCrossed,
  Video,
  Clapperboard,
  MessageSquareHeart,
  Wallet,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useChefDashboard } from "@/context/ChefDashboardContext";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { key: "OVERVIEW", href: "/chef", label: "Overview", icon: LayoutDashboard },
  { key: "CHECKLIST", href: "/chef/checklist", label: "Cooking Checklist", icon: ClipboardList },
  { key: "ORDERS", href: "/chef/orders", label: "Live Orders", icon: Package },
  { key: "MENU", href: "/chef/menu", label: "Menu Manager", icon: UtensilsCrossed },
  { key: "CONTENT", href: "/chef/studio", label: "Content Studio", icon: Video },
  { key: "CONTENT_PLAN", href: "/chef/content", label: "30-Day Reel Plan", icon: Clapperboard },
  { key: "DIETARY_REQUESTS", href: "/chef/requests", label: "Dietary Requests", icon: MessageSquareHeart },
  { key: "EARNINGS", href: "/chef/earnings", label: "Earnings", icon: Wallet },
  { key: "SETTINGS", href: "/chef/settings", label: "Kitchen Settings", icon: Settings },
];

export default function LeftSidebarNav() {
  const pathname = usePathname();
  const { kitchen, acceptingOrders, error } = useChefDashboard();
  const { token, requireAuthentication, customerPhone } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const wrongRole = Boolean(token) && String(error || "").includes("CHEF");

  const signInCard = !token ? (
    <div className="mb-3 rounded-xl border border-homatri-orange/40 bg-homatri-orange-light p-3">
      <p className="text-xs font-bold text-homatri-dark">Chef sign in required</p>
      <p className="text-[11px] text-homatri-muted mt-0.5">
        Sign in with your kitchen&apos;s phone &amp; password to see orders, menus and payouts.
      </p>
      <button
        type="button"
        onClick={() => requireAuthentication(() => {})}
        className="mt-2 w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white text-xs font-bold py-2 rounded-lg"
      >
        Sign in to your kitchen
      </button>
      <a
        href="/chef/onboarding"
        className="mt-1.5 block text-center text-[11px] font-semibold text-homatri-orange hover:underline"
      >
        New homemaker? Onboard your kitchen →
      </a>
    </div>
  ) : wrongRole ? (
    <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
      <p className="text-xs font-bold text-amber-800">This account is not a chef kitchen</p>
      <p className="text-[11px] text-amber-700 mt-0.5">
        You&apos;re signed in as +91 {customerPhone || ""} (customer). Sign in with your kitchen&apos;s phone number.
      </p>
    </div>
  ) : (
    <p className="mb-3 px-1 text-[11px] text-homatri-muted truncate">+91 {customerPhone || ""}</p>
  );

  const links = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/chef" ? pathname === "/chef" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setIsMobileDrawerOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-homatri-orange text-white"
                : "text-homatri-dark hover:bg-homatri-orange-light"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!isCollapsed ? <span className="font-medium">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-homatri-border px-4 py-3 flex items-center justify-between">
        <p className="font-display italic font-medium text-homatri-orange">Homatri Kitchen</p>
        <button type="button" onClick={() => setIsMobileDrawerOpen(true)} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isMobileDrawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-homatri-dark/40" onClick={() => setIsMobileDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-display italic text-homatri-orange">Kitchen</span>
              <button type="button" onClick={() => setIsMobileDrawerOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {signInCard}
            {links}
          </aside>
        </div>
      ) : null}

      <aside
        className={`hidden lg:flex flex-col border-r border-homatri-border bg-white min-h-screen sticky top-0 ${
          isCollapsed ? "w-[76px]" : "w-72"
        }`}
      >
        <div className="p-4 border-b border-homatri-border">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url(${kitchen.kitchenPhotoUrl})` }}
            />
            {!isCollapsed ? (
              <div className="min-w-0">
                <p className="font-display italic text-homatri-orange text-sm">Your Kitchen, Your Business.</p>
                <p className="font-medium text-homatri-dark text-sm truncate">{kitchen.kitchenName}</p>
                <p className="text-[11px] text-homatri-muted">{kitchen.chefName}</p>
              </div>
            ) : null}
          </div>
          {!isCollapsed ? (
            <p className={`mt-3 text-[11px] font-semibold ${acceptingOrders ? "text-homatri-green" : "text-homatri-muted"}`}>
              {acceptingOrders ? "Accepting orders" : "Kitchen closed"}
            </p>
          ) : null}
        </div>
        <div className="p-3 flex-1">
          {!isCollapsed ? signInCard : null}
          {links}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          className="m-3 text-xs font-medium text-homatri-muted border border-homatri-border rounded-xl py-2"
        >
          {isCollapsed ? "›" : "Collapse"}
        </button>
      </aside>
    </>
  );
}
