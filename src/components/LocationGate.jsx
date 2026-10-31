"use client";

import { useState } from "react";
import { Crosshair, Loader2, MapPin, X } from "lucide-react";
import { useLocation } from "@/context/LocationContext";

// Up-front location ask on /order (no login): hyperlocal browsing means we
// need the customer's pin before showing kitchens. GPS first; a typed area
// falls back to the Maps Geocoding API.

async function geocodeArea(text) {
  const key = process.env.NEXT_PUBLIC_GMAPS_API_KEY;
  if (!key) throw new Error("Map search unavailable.");
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      `${text}, Navi Mumbai, Maharashtra`
    )}&key=${key}`
  );
  const data = await res.json();
  const first = data?.results?.[0];
  if (!first) throw new Error("Couldn't find that area — try a nearby landmark.");
  const loc = first.geometry.location;
  return { latitude: loc.lat, longitude: loc.lng, label: first.formatted_address };
}

export default function LocationGate({ onDone }) {
  const { setCoordinates } = useLocation();
  const [mode, setMode] = useState(null); // null | 'gps' | 'type'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [areaText, setAreaText] = useState("");

  const apply = (lat, lon, label) => {
    setCoordinates(lat, lon, label);
    onDone?.();
  };

  const useGps = () => {
    setError("");
    if (!navigator.geolocation) {
      setMode("type");
      return;
    }
    setMode("gps");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let label = null;
        try {
          const geo = await geocodeArea(
            `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`
          ).catch(() => null);
          label = geo?.label || null;
        } catch {
          /* reverse-geocode label is best-effort */
        }
        setBusy(false);
        apply(pos.coords.latitude, pos.coords.longitude, label);
      },
      () => {
        setBusy(false);
        setMode("type");
        setError("Couldn't get your GPS — type your area instead.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const submitArea = async (event) => {
    event.preventDefault();
    if (!areaText.trim()) return;
    setBusy(true);
    setError("");
    try {
      const geo = await geocodeArea(areaText.trim());
      setBusy(false);
      apply(geo.latitude, geo.longitude, geo.label);
    } catch (err) {
      setBusy(false);
      setError(err?.message || "Couldn't find that area.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-homatri-dark/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-homatri-orange-light flex items-center justify-center">
          <MapPin className="w-6 h-6 text-homatri-orange" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-medium text-homatri-dark">
          Where should we deliver?
        </h2>
        <p className="mt-1.5 text-sm text-homatri-muted leading-relaxed">
          We show only home kitchens within <strong>5 km</strong> of you, so your food
          arrives hot and fresh.
        </p>

        <button
          type="button"
          onClick={useGps}
          disabled={busy}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl disabled:opacity-60"
        >
          {busy && mode === "gps" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
          {busy && mode === "gps" ? "Finding you…" : "Use my current location"}
        </button>

        {mode === "type" || mode === null ? (
          <form onSubmit={submitArea} className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-homatri-muted">
              <X className="w-3 h-3 invisible" />
              <span className="flex-1 border-t border-homatri-border" />
              <span>or type your area</span>
              <span className="flex-1 border-t border-homatri-border" />
            </div>
            <div className="flex gap-2">
              <input
                value={areaText}
                onChange={(e) => setAreaText(e.target.value)}
                placeholder="e.g. Ghansoli sector 7"
                className="flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-homatri-orange"
              />
              <button
                type="submit"
                disabled={busy || !areaText.trim()}
                className="bg-homatri-forest hover:bg-homatri-forest-deep text-white text-sm font-bold px-4 rounded-xl disabled:opacity-50"
              >
                {busy && mode === "type" ? "…" : "Go"}
              </button>
            </div>
          </form>
        ) : null}

        {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
