"use client";

import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login, enterLocalSession } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen bg-homatri-cream flex items-center justify-center px-4">
      <form
        className="w-full max-w-md bg-white border border-homatri-border rounded-3xl p-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(email, password);
          } catch (err) {
            setError(err.message || "Sign in failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="font-display italic text-homatri-orange">Homaatri Control</p>
        <h1 className="font-display text-3xl font-medium">Admin sign in</h1>
        <p className="text-sm text-homatri-muted">
          Production login is <code>POST /api/admin/login</code> on the live FastAPI app. This website never stored an
          admin password.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full border rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full border rounded-xl px-3 py-2 text-sm"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="w-full bg-homatri-orange text-white font-semibold py-3 rounded-xl">
          {busy ? "Signing in…" : "Enter production operations"}
        </button>
        <button
          type="button"
          onClick={enterLocalSession}
          className="w-full border border-homatri-border font-semibold py-3 rounded-xl text-sm"
        >
          Open local operations desk
        </button>
        <p className="text-[11px] text-homatri-muted">
          Local desk opens the admin UI on this machine. Seed/wipe still hit production if you use those buttons.
        </p>
      </form>
    </div>
  );
}
