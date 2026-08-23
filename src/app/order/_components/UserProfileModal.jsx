"use client";

import { useAuth } from "@/context/AuthContext";
import { CARTOON_AVATARS } from "@/lib/authClient";
import { LogOut, Package, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, customerPhone, logout } = useAuth();

  if (!isOpen) return null;

  const currentAvatar = CARTOON_AVATARS.find((a) => a.id === user?.avatar_url) || CARTOON_AVATARS[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-homatri-dark/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-homatri-border p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-homatri-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-homatri-orange-light border border-homatri-orange/30 flex items-center justify-center text-2xl shadow-xs">
              {currentAvatar.emoji}
            </div>
            <div>
              <h2 className="font-display font-medium text-lg text-homatri-dark">
                {user?.full_name || user?.name || "Homaatri Member"}
              </h2>
              <p className="text-xs font-semibold text-homatri-muted">
                +91 {user?.phone || customerPhone || "9876543210"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-homatri-muted hover:text-homatri-dark"
          >
            Close
          </button>
        </div>

        {/* Profile Content */}
        <div className="mt-5 space-y-3">
          
          <Link
            href="/order/tracking"
            onClick={onClose}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-homatri-border hover:bg-homatri-cream transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-homatri-orange-light text-homatri-orange">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-homatri-dark">My Active Orders</p>
                <p className="text-[11px] text-homatri-muted">Track live delivery status</p>
              </div>
            </div>
            <span className="text-xs font-bold text-homatri-orange">Track &rarr;</span>
          </Link>

          <div className="p-3.5 rounded-2xl border border-homatri-border bg-homatri-cream/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-homatri-dark">Session Status</p>
            </div>
            <p className="text-[11px] text-homatri-muted">
              Logged in via 30-Day Persistent Session. You will stay signed in across device restarts.
            </p>
          </div>

        </div>

        {/* Logout Button */}
        <div className="mt-6 pt-4 border-t border-homatri-border">
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-3 rounded-xl border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Homaatri</span>
          </button>
        </div>

      </div>
    </div>
  );
}
