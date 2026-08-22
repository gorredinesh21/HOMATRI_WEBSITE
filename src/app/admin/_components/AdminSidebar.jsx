"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  MessageSquare,
  Timer,
  AlertTriangle,
  ChefHat,
  Bike,
  Wrench,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const NAV = [
  { href: "/admin", label: "Order Pipeline", icon: Activity, exact: true },
  { href: "/admin/pipeline", label: "Pipeline detail", icon: Activity },
  { href: "/admin/chats", label: "Live Chat Stream", icon: MessageSquare },
  { href: "/admin/cutoff", label: "Cutoff Engine", icon: Timer },
  { href: "/admin/escalations", label: "Escalation HITL", icon: AlertTriangle },
  { href: "/admin/chefs", label: "Chefs & Menus", icon: ChefHat },
  { href: "/admin/drivers", label: "Riders & Routes", icon: Bike },
  { href: "/admin/tools", label: "System Tools", icon: Wrench },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-1">
      {NAV.filter((item) => item.href !== "/admin/pipeline").map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
              active ? "bg-homatri-orange text-white" : "text-homatri-dark hover:bg-homatri-orange-light"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center">
        <span className="font-display italic text-homatri-orange">Homatri Control</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-homatri-dark/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4">
            <div className="flex justify-between mb-4">
              <span className="font-display italic text-homatri-orange">Control</span>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {links}
          </aside>
        </div>
      ) : null}
      <aside className="hidden lg:flex w-72 min-h-screen flex-col bg-white border-r border-homatri-border sticky top-0">
        <div className="p-4 border-b border-homatri-border">
          <p className="font-display italic text-homatri-orange flex items-center gap-2">
            <Shield className="w-4 h-4" /> Homaatri Control
          </p>
          <p className="text-xs text-homatri-muted mt-1 truncate">
            {admin?.email || admin?.name || "Operations"}
          </p>
        </div>
        <div className="p-3 flex-1">{links}</div>
        <button type="button" onClick={logout} className="m-3 text-xs font-medium border rounded-xl py-2">
          Sign out
        </button>
      </aside>
    </>
  );
}
