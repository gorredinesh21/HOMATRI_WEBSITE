"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Check, ChevronDown, X } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { normalizeCollection } from "@/lib/adminNormalize";

function ChefMenuPanel({ phone }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.chefMenu(phone);
      setItems(res?.items ?? []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [phone]);

  useEffect(() => {
    if (open && items === null) load();
  }, [open, items, load]);

  const live = items?.filter((m) => !m.is_archived) ?? [];
  const archived = items?.filter((m) => m.is_archived) ?? [];

  return (
    <div className="mt-3 border-t pt-2">
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs font-semibold text-homatri-orange"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        View menu {items ? `(${live.length} dishes)` : ""}
      </button>
      {open ? (
        <div className="mt-2 space-y-1">
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          {items === null && !error ? <p className="text-xs text-homatri-muted">Loading…</p> : null}
          {live.map((m) => (
            <p key={m.menu_item_id} className="flex items-center gap-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  m.dietary_tag === "VEG" || m.dietary_tag === "VEGAN"
                    ? "bg-green-600"
                    : m.dietary_tag === "NON_VEG"
                      ? "bg-red-600"
                      : "bg-gray-400"
                }`}
              />
              <span className={m.is_available ? "" : "line-through opacity-60"}>{m.dish_name}</span>
              <span className="text-homatri-muted">
                ₹{Number(m.unit_price).toLocaleString("en-IN")} · {m.meal_type}
                {m.is_available ? "" : " · unavailable"}
              </span>
            </p>
          ))}
          {archived.length > 0 ? (
            <details className="text-xs text-homatri-muted">
              <summary className="cursor-pointer">{archived.length} archived</summary>
              {archived.map((m) => (
                <p key={m.menu_item_id} className="line-through opacity-60">
                  {m.dish_name} ₹{Number(m.unit_price).toLocaleString("en-IN")}
                </p>
              ))}
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminChefsPage() {
  const [chefs, setChefs] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
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

  const act = async (phone, action, name) => {
    setBusy(phone + action);
    setNotice("");
    try {
      if (action === "approve") {
        const res = await adminApi.approveChef(phone);
        setNotice(res?.message || `${name} approved and live.`);
      } else {
        const res = await adminApi.rejectChef(phone);
        setNotice(res?.message || `${name} rejected.`);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">Chefs & approvals</h1>
      {notice ? <p className="text-sm font-semibold text-homatri-forest">{notice}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid md:grid-cols-2 gap-3">
        {chefs.map((chef) => {
          const verified = chef.is_verified ?? chef.isVerified ?? true;
          return (
            <article key={chef.id || chef.chef_phone} className="bg-white border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{chef.kitchen_name || chef.kitchenName}</p>
                  <p className="text-sm text-homatri-orange">{chef.chef_name || chef.chefName}</p>
                  <p className="text-xs text-homatri-muted">{chef.address}</p>
                  <p className="text-xs mt-1">
                    {chef.latitude}, {chef.longitude} · cap {chef.daily_capacity ?? chef.capacity ?? "—"}
                  </p>
                </div>
                {verified ? (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-homatri-forest bg-homatri-forest-mist px-2.5 py-1 rounded-full">
                    <BadgeCheck className="w-3 h-3" /> LIVE
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    PENDING APPROVAL
                  </span>
                )}
              </div>
              {!verified ? (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => act(chef.chef_phone, "approve", chef.kitchen_name)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-homatri-forest hover:bg-homatri-forest-deep text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & go live
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => act(chef.chef_phone, "reject", chef.kitchen_name)}
                    className="inline-flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:border-red-400 text-red-600 text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : null}
              <ChefMenuPanel phone={chef.chef_phone} />
            </article>
          );
        })}
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
