"use client";

import { useState } from "react";

export default function DevOpsTools({ onSeed, onWipe }) {
  const [confirmWipe, setConfirmWipe] = useState("");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(null);

  const seed = async () => {
    setBusy("seed");
    setMessage(null);
    try {
      const result = await onSeed?.();
      setMessage({ ok: true, text: result?.message || "Seeded 4 Ghansoli kitchens and riders." });
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setBusy(null);
    }
  };

  const wipe = async () => {
    if (confirmWipe !== "WIPE") return;
    setBusy("wipe");
    setMessage(null);
    try {
      const result = await onWipe?.();
      setMessage({ ok: true, text: result?.message || "Customer data wiped." });
      setConfirmWipe("");
    } catch (error) {
      setMessage({ ok: false, text: error.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <section className="bg-white border rounded-3xl p-5 space-y-3">
        <h3 className="font-display text-xl font-medium">Seed production sample</h3>
        <p className="text-sm text-homatri-muted">POST /api/admin/seed-chefs-and-riders</p>
        <button
          type="button"
          disabled={busy === "seed"}
          onClick={seed}
          className="w-full bg-homatri-green text-white font-semibold py-3 rounded-xl"
        >
          {busy === "seed" ? "Seeding…" : "Seed 4 Ghansoli kitchens & riders"}
        </button>
      </section>
      <section className="bg-white border border-red-200 rounded-3xl p-5 space-y-3">
        <h3 className="font-display text-xl font-medium text-red-700">Wipe production customer data</h3>
        <p className="text-sm text-homatri-muted">POST /api/admin/clear-all-data — type WIPE to enable.</p>
        <input
          value={confirmWipe}
          onChange={(event) => setConfirmWipe(event.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm"
          placeholder="WIPE"
        />
        <button
          type="button"
          disabled={confirmWipe !== "WIPE" || busy === "wipe"}
          onClick={wipe}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl disabled:opacity-40"
        >
          {busy === "wipe" ? "Wiping…" : "Wipe production customer data"}
        </button>
      </section>
      {message ? (
        <p className={`text-sm ${message.ok ? "text-homatri-green" : "text-red-600"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}
