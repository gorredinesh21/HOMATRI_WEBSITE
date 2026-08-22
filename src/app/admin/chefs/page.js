"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { normalizeCollection } from "@/lib/adminNormalize";

export default function AdminChefsPage() {
  const [chefs, setChefs] = useState([]);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({
    chef_phone: "",
    chef_name: "",
    kitchen_name: "",
    address: "",
    city: "Navi Mumbai",
    dietary_type: "VEG",
  });

  const load = useCallback(async () => {
    try {
      setChefs(normalizeCollection(await adminApi.chefs(), ["chefs"]));
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
      <h1 className="font-display text-3xl font-medium">Chefs & menus</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid md:grid-cols-2 gap-3">
        {chefs.map((chef) => (
          <article key={chef.id || chef.chef_phone} className="bg-white border rounded-2xl p-4">
            <p className="font-medium">{chef.kitchen_name || chef.kitchenName}</p>
            <p className="text-sm text-homatri-orange">{chef.chef_name || chef.chefName}</p>
            <p className="text-xs text-homatri-muted">{chef.address}</p>
            <p className="text-xs mt-1">
              {chef.latitude}, {chef.longitude} · cap {chef.daily_capacity ?? chef.capacity ?? "—"}
            </p>
          </article>
        ))}
      </div>
      <form
        className="bg-white border rounded-3xl p-5 space-y-3 max-w-lg"
        onSubmit={async (event) => {
          event.preventDefault();
          await adminApi.createChef(draft);
          await load();
        }}
      >
        <h2 className="font-display text-xl font-medium">Add kitchen</h2>
        {["chef_phone", "chef_name", "kitchen_name", "address"].map((key) => (
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
          Create chef
        </button>
      </form>
    </div>
  );
}
