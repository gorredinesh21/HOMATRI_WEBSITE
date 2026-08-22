"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { normalizeCollection } from "@/lib/adminNormalize";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({
    driver_phone: "",
    driver_name: "",
    vehicle_number: "",
    vehicle_type: "BIKE",
  });

  const load = useCallback(async () => {
    try {
      setDrivers(normalizeCollection(await adminApi.drivers(), ["drivers", "riders"]));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">Riders & routes</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-3">
        {drivers.map((driver) => (
          <article key={driver.id || driver.driver_phone} className="bg-white border rounded-2xl p-4">
            <p className="font-medium">{driver.driver_name || driver.full_name || driver.name}</p>
            <p className="text-sm text-homatri-muted">
              {driver.vehicle_number} · {driver.vehicle_type || "BIKE"} · {driver.shift_status || driver.status || "—"}
            </p>
            <p className="text-xs">{driver.driver_phone || driver.phone_number}</p>
          </article>
        ))}
      </div>
      <form
        className="bg-white border rounded-3xl p-5 space-y-3 max-w-lg"
        onSubmit={async (event) => {
          event.preventDefault();
          await adminApi.createDriver(draft);
          await load();
        }}
      >
        <h2 className="font-display text-xl font-medium">Add rider</h2>
        {["driver_phone", "driver_name", "vehicle_number"].map((key) => (
          <input
            key={key}
            required
            value={draft[key]}
            onChange={(event) => setDraft((prev) => ({ ...prev, [key]: event.target.value }))}
            placeholder={key.replace(/_/g, " ")}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
        ))}
        <button type="submit" className="w-full bg-homatri-orange text-white font-semibold py-2.5 rounded-xl">
          Create rider
        </button>
      </form>
    </div>
  );
}
