"use client";

import { useState } from "react";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefSettingsPage() {
  const { kitchen, setKitchen } = useChefDashboard();
  const [draft, setDraft] = useState(kitchen);
  const [saved, setSaved] = useState(false);

  const onChange = (key) => (event) => {
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));
    setSaved(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Kitchen settings</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Brand & capacity</h1>
      </header>
      <form
        className="bg-white border border-homatri-border rounded-3xl p-5 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setKitchen({
            ...draft,
            dailyCapacity: Number(draft.dailyCapacity) || 0,
          });
          setSaved(true);
        }}
      >
        <label className="block text-xs font-semibold">
          Kitchen name
          <input value={draft.kitchenName} onChange={onChange("kitchenName")} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal" />
        </label>
        <label className="block text-xs font-semibold">
          Chef name
          <input value={draft.chefName} onChange={onChange("chefName")} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal" />
        </label>
        <label className="block text-xs font-semibold">
          Address
          <input value={draft.address} onChange={onChange("address")} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal" />
        </label>
        <label className="block text-xs font-semibold">
          Hometown region
          <input value={draft.hometownRegion} onChange={onChange("hometownRegion")} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal" />
        </label>
        <label className="block text-xs font-semibold">
          Daily capacity (meals)
          <input
            type="number"
            min="0"
            value={draft.dailyCapacity}
            onChange={onChange("dailyCapacity")}
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="block text-xs font-semibold">
          Instagram
          <input value={draft.instagramUrl} onChange={onChange("instagramUrl")} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal" />
        </label>
        <label className="block text-xs font-semibold">
          YouTube
          <input value={draft.youtubeUrl} onChange={onChange("youtubeUrl")} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-normal" />
        </label>
        <button type="submit" className="w-full bg-homatri-orange text-white font-semibold py-2.5 rounded-xl">
          Save kitchen profile
        </button>
        {saved ? <p className="text-xs text-homatri-green">Saved in this session. Backend persistence is still TBD.</p> : null}
      </form>
    </div>
  );
}
