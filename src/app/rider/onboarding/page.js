"use client";

import { useState } from "react";
import Link from "next/link";
import { submitRiderOnboarding } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CLUSTERS = ["Ghansoli", "Vashi", "Airoli"];
const VEHICLES = ["SCOOTER", "BIKE", "EV"];

export default function RiderOnboardingPage() {
  const { token, customerPhone } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    driver_phone: customerPhone || "",
    driver_name: "",
    driving_license_number: "",
    vehicle_type: "SCOOTER",
    vehicle_reg_number: "",
    assigned_cluster: "Ghansoli",
    payout_upi_id: "",
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submitRiderOnboarding({
        ...form,
        driver_phone: form.driver_phone.replace(/\D/g, "").slice(-10),
        vehicle_reg_number: form.vehicle_reg_number.toUpperCase(),
      }, token);
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not save rider profile.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <main className="px-4 py-16 text-center">
        <h1 className="font-display italic text-3xl">You&apos;re on the Ghansoli roster</h1>
        <p className="text-homatri-muted mt-3">Pickup slots will appear on your rider home once a meal window batches.</p>
        <Link href="/rider" className="inline-block mt-8 bg-homatri-orange text-white font-bold px-6 py-3 rounded-xl">Open rider app</Link>
      </main>
    );
  }

  return (
    <main className="px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-homatri-orange">Rider onboarding</p>
      <h1 className="font-display italic text-3xl mt-2">Join the delivery fleet</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 bg-white border border-homatri-border rounded-3xl p-5">
        <Input label="Full legal name" value={form.driver_name} onChange={(v) => setField("driver_name", v)} />
        <Input label="Phone number" value={form.driver_phone} onChange={(v) => setField("driver_phone", v)} />
        <Input label="Driving license number" value={form.driving_license_number} onChange={(v) => setField("driving_license_number", v)} />
        <label className="block text-xs font-semibold">Vehicle type
          <select value={form.vehicle_type} onChange={(e) => setField("vehicle_type", e.target.value)} className="mt-2 w-full rounded-xl border border-homatri-border px-4 py-3 text-sm">
            {VEHICLES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <Input label="Vehicle registration" value={form.vehicle_reg_number} onChange={(v) => setField("vehicle_reg_number", v)} placeholder="MH-43-AZ-1234" />
        <label className="block text-xs font-semibold">Service cluster
          <select value={form.assigned_cluster} onChange={(e) => setField("assigned_cluster", e.target.value)} className="mt-2 w-full rounded-xl border border-homatri-border px-4 py-3 text-sm">
            {CLUSTERS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <Input label="Payout UPI ID" value={form.payout_upi_id} onChange={(v) => setField("payout_upi_id", v)} placeholder="rider@upi" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={saving} className="w-full bg-homatri-orange text-white font-bold rounded-xl py-3 disabled:opacity-60">
          {saving ? "Saving…" : "Finish rider setup"}
        </button>
      </form>
    </main>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-xs font-semibold text-homatri-dark">
      {label}
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-homatri-border px-4 py-3 text-sm font-medium" />
    </label>
  );
}
