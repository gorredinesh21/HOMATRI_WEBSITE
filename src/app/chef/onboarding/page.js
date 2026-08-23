"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { submitChefOnboarding } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CARTOON_AVATARS } from "@/lib/authClient";

const STEPS = ["Kitchen story", "FSSAI", "Kitchen pin", "Payout"];

export default function ChefOnboardingPage() {
  const { token, customerPhone } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    chef_phone: customerPhone || "",
    chef_name: "",
    kitchen_name: "",
    bio: "",
    hometown_region: "",
    fssai_license_number: "",
    daily_capacity: 15,
    address_line1: "",
    city: "Navi Mumbai",
    latitude: 19.1197,
    longitude: 73.0078,
    payout_upi_id: "",
    avatar_url: CARTOON_AVATARS[0].id,
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const canNext = useMemo(() => {
    if (step === 0) return form.chef_name && form.kitchen_name && form.bio && form.hometown_region && form.chef_phone.length >= 10;
    if (step === 1) return /^\d{14}$/.test(form.fssai_license_number);
    if (step === 2) return form.address_line1 && form.daily_capacity >= 1;
    return /.+@.+/.test(form.payout_upi_id);
  }, [form, step]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setField("latitude", Number(pos.coords.latitude.toFixed(6)));
      setField("longitude", Number(pos.coords.longitude.toFixed(6)));
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submitChefOnboarding({
        ...form,
        chef_phone: form.chef_phone.replace(/\D/g, "").slice(-10),
        daily_capacity: Number(form.daily_capacity),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      }, token);
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not save kitchen profile.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-homatri-orange text-sm font-semibold uppercase tracking-wider">Kitchen ready</p>
        <h1 className="font-display italic text-3xl mt-2">Welcome to Homatri, {form.chef_name}</h1>
        <p className="text-homatri-muted mt-3">{form.kitchen_name} is now listed for Ghansoli-cluster tiffins.</p>
        <Link href="/chef" className="inline-block mt-8 bg-homatri-orange text-white font-bold px-6 py-3 rounded-xl">
          Open kitchen dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-homatri-orange">Homemaker onboarding</p>
      <h1 className="font-display italic text-3xl text-homatri-dark mt-2">Set up your home kitchen</h1>
      <div className="flex gap-2 mt-6">
        {STEPS.map((label, index) => (
          <div key={label} className={`flex-1 h-1.5 rounded-full ${index <= step ? "bg-homatri-orange" : "bg-homatri-border"}`} />
        ))}
      </div>
      <p className="text-sm font-semibold mt-3 text-homatri-dark">{STEPS[step]}</p>

      <form onSubmit={step === 3 ? submit : (event) => { event.preventDefault(); setStep((s) => s + 1); }} className="mt-6 space-y-4 bg-white border border-homatri-border rounded-3xl p-6">
        {step === 0 && (
          <>
            <Field label="Mobile number" value={form.chef_phone} onChange={(v) => setField("chef_phone", v)} placeholder="10-digit phone" />
            <Field label="Legal name" value={form.chef_name} onChange={(v) => setField("chef_name", v)} />
            <Field label="Kitchen name" value={form.kitchen_name} onChange={(v) => setField("kitchen_name", v)} placeholder="Indravati Pure Veg" />
            <Field label="Hometown region" value={form.hometown_region} onChange={(v) => setField("hometown_region", v)} placeholder="Telangana / Konkan / Punjab" />
            <Field label="Bio" value={form.bio} onChange={(v) => setField("bio", v)} textarea />
          </>
        )}
        {step === 1 && (
          <Field label="14-digit FSSAI license" value={form.fssai_license_number} onChange={(v) => setField("fssai_license_number", v.replace(/\D/g, "").slice(0, 14))} placeholder="14 digits" />
        )}
        {step === 2 && (
          <>
            <Field label="Daily meal capacity" type="number" value={form.daily_capacity} onChange={(v) => setField("daily_capacity", v)} />
            <Field label="Kitchen address" value={form.address_line1} onChange={(v) => setField("address_line1", v)} />
            <Field label="City" value={form.city} onChange={(v) => setField("city", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" type="number" value={form.latitude} onChange={(v) => setField("latitude", v)} />
              <Field label="Longitude" type="number" value={form.longitude} onChange={(v) => setField("longitude", v)} />
            </div>
            <button type="button" onClick={locate} className="text-sm font-semibold text-homatri-orange">Use my GPS pin</button>
          </>
        )}
        {step === 3 && (
          <>
            <Field label="Payout UPI ID" value={form.payout_upi_id} onChange={(v) => setField("payout_upi_id", v)} placeholder="homemaker@upi" />
            <p className="text-xs font-semibold">Cartoon kitchen avatar</p>
            <div className="grid grid-cols-4 gap-2">
              {CARTOON_AVATARS.map((avatar) => (
                <button key={avatar.id} type="button" onClick={() => setField("avatar_url", avatar.id)} className={`rounded-2xl border py-3 ${form.avatar_url === avatar.id ? "border-homatri-orange bg-homatri-orange-light" : "border-homatri-border"}`}>
                  <span className="text-2xl">{avatar.emoji}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 border border-homatri-border rounded-xl py-3 font-semibold">Back</button>
          ) : null}
          <button type="submit" disabled={!canNext || saving} className="flex-1 bg-homatri-orange text-white font-bold rounded-xl py-3 disabled:opacity-50">
            {step === 3 ? (saving ? "Saving…" : "Finish kitchen setup") : "Continue"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, textarea, type = "text" }) {
  return (
    <label className="block text-xs font-semibold text-homatri-dark">
      {label}
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-homatri-border px-4 py-3 text-sm font-medium" />
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-homatri-border px-4 py-3 text-sm font-medium" />
      )}
    </label>
  );
}
