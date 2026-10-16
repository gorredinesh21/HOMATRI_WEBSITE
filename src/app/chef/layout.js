"use client";

import { useState } from "react";
import { ChefDashboardProvider, useChefDashboard } from "@/context/ChefDashboardContext";
import { useAuth } from "@/context/AuthContext";
import LeftSidebarNav from "./_components/LeftSidebarNav";

// Whole-portal gate. Chef credentials (kitchen phone + password) are issued by
// the Homatri team — there is no self-signup for kitchens. No session, or a
// session that is not a chef kitchen, sees the sign-in screen instead of the
// (empty) dashboard.
function ChefGate({ children }) {
  const { token, user, customerPhone, loginWithPassword, logout } = useAuth();
  const { error } = useChefDashboard();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const sessionRole = user?.role || user?.profile?.role;
  const wrongRole =
    Boolean(token) &&
    (sessionRole ? sessionRole !== "CHEF" : String(error || "").includes("CHEF"));

  async function handleSignIn(event) {
    event.preventDefault();
    setFormError(null);
    const digits = (phone || "")
      .replace(/\D/g, "")
      .replace(/^91(?=[6-9])/, "")
      .replace(/^0+/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setFormError("Enter your kitchen's 10-digit mobile number.");
      return;
    }
    if (!password) {
      setFormError("Enter the password the Homatri team gave you.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await loginWithPassword({ phone: digits, password });
      if (result?.role && result.role !== "CHEF") {
        await logout();
        setFormError("This phone number is not a chef kitchen. Sign in with your kitchen's number.");
      }
    } catch (err) {
      setFormError(err?.message || "Log in failed. Check the phone number and password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (wrongRole) {
    return (
      <div className="min-h-screen bg-homatri-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-homatri-border rounded-3xl p-8 text-center space-y-4">
          <p className="font-display italic text-homatri-orange">Homatri Kitchen</p>
          <h1 className="font-display text-2xl font-medium text-homatri-dark">
            This account is not a chef kitchen
          </h1>
          <p className="text-sm text-homatri-muted">
            You&apos;re signed in as +91 {customerPhone || ""}. Sign in with your kitchen&apos;s
            phone number to manage orders.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl text-sm"
          >
            Switch to kitchen account
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-homatri-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-homatri-border rounded-3xl p-8 space-y-5">
          <div className="text-center space-y-1">
            <p className="font-display italic text-homatri-orange">Homatri Kitchen</p>
            <h1 className="font-display text-2xl font-medium text-homatri-dark">
              Sign in to your kitchen
            </h1>
            <p className="text-sm text-homatri-muted">
              Your login is your kitchen&apos;s phone number and the password the Homatri team
              gave you.
            </p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4" noValidate>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-homatri-muted">
                Kitchen phone number
              </span>
              <div className="mt-1 flex items-center rounded-xl border border-homatri-border focus-within:border-homatri-orange overflow-hidden">
                <span className="pl-3 pr-2 text-sm text-homatri-muted border-r border-homatri-border py-2.5">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 text-sm text-homatri-dark outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-homatri-muted">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Given by Homatri"
                className="mt-1 w-full rounded-xl border border-homatri-border focus:border-homatri-orange px-3 py-2.5 text-sm text-homatri-dark outline-none"
              />
            </label>
            {formError ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-homatri-orange hover:bg-homatri-orange-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm"
            >
              {submitting ? "Signing in…" : "Sign in to your kitchen"}
            </button>
          </form>
          <p className="text-xs text-homatri-muted text-center leading-relaxed">
            Chef accounts are created by the Homatri team. Forgot your password or can&apos;t sign
            in? WhatsApp us — we&apos;ll reset it for you.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

function PendingApprovalBanner() {
  const { kitchen } = useChefDashboard();
  if (!kitchen?.kitchenName || kitchen?.isVerified !== false) return null;
  return (
    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <p className="text-sm font-bold text-amber-900">
        ⏳ Your kitchen is pending Homatri verification
      </p>
      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
        We&apos;re reviewing your details — customers can&apos;t see your kitchen yet and orders
        are off. This usually takes under 24 hours. You can set up your menu and content plan
        meanwhile; everything goes live the moment we approve you.
      </p>
    </div>
  );
}

export default function ChefLayout({ children }) {
  return (
    <ChefDashboardProvider>
      <ChefGate>
        <div className="min-h-screen bg-homatri-cream flex flex-col lg:flex-row">
          <LeftSidebarNav />
          <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-5xl w-full">
            <PendingApprovalBanner />
            {children}
          </main>
        </div>
      </ChefGate>
    </ChefDashboardProvider>
  );
}
