"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Camera, Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { adminApi, adminUploadDishImage } from "@/lib/adminApi";
import { toBackendMediaUrl } from "@/lib/api";
import { normalizeCollection } from "@/lib/adminNormalize";

const DISH_BLANK = {
  dish_name: "",
  description: "",
  unit_price: "",
  category_id: "",
  meal_type: "BOTH",
  dietary_tag: "VEG",
  max_availability: 10,
  image_url: null,
};

function ChefMenuPanel({ phone }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null); // { items, categories }
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', draft, menuItemId? }
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.chefMenu(phone);
      setData({ items: res?.items ?? [], categories: res?.categories ?? [] });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [phone]);

  useEffect(() => {
    if (open && data === null) load();
  }, [open, data, load]);

  const live = data?.items?.filter((m) => !m.is_archived) ?? [];
  const archived = data?.items?.filter((m) => !m.is_archived ? false : true) ?? [];
  const archivedOnly = archived.filter((m) => m.is_archived);
  const assignedCategories = useMemo(
    () => (data?.categories ?? []).filter((c) => c.pricingType !== "PAIR_COMBO"),
    [data]
  );

  const grouped = useMemo(() => {
    const byCat = new Map(assignedCategories.map((c) => [c.category_id, { cat: c, dishes: [] }]));
    const unfiled = { cat: null, dishes: [] };
    for (const m of live) {
      if (m.category_id && byCat.has(m.category_id)) byCat.get(m.category_id).dishes.push(m);
      else unfiled.dishes.push(m);
    }
    return [...byCat.values(), ...(unfiled.dishes.length ? [unfiled] : [])];
  }, [live, assignedCategories]);

  const openAdd = () => setModal({ mode: "add", draft: { ...DISH_BLANK } });
  const openEdit = (m) =>
    setModal({
      mode: "edit",
      menuItemId: m.menu_item_id,
      draft: {
        dish_name: m.dish_name || "",
        description: m.description || "",
        unit_price: m.unit_price != null ? String(m.unit_price) : "",
        category_id: m.category_id || "",
        meal_type: m.meal_type || "BOTH",
        dietary_tag: m.dietary_tag || "VEG",
        max_availability: m.max_availability ?? 10,
        image_url: m.image_url || null,
      },
    });

  const pickImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await adminUploadDishImage(phone, file, modal.mode === "edit" ? modal.menuItemId : null);
      if (res?.imageUrl) {
        setModal((m) => ({ ...m, draft: { ...m.draft, image_url: res.imageUrl } }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveDish = async (event) => {
    event.preventDefault();
    const d = modal.draft;
    const body = {
      dish_name: d.dish_name,
      description: d.description || null,
      unit_price: Number(d.unit_price),
      category_id: d.category_id,
      meal_type: d.meal_type,
      dietary_tag: d.dietary_tag,
      max_availability: Number(d.max_availability) || 0,
      image_url: d.image_url || null,
    };
    if (!body.dish_name || !body.unit_price || !body.category_id) {
      setError("Dish name, price and category are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (modal.mode === "add") await adminApi.chefCreateDish(phone, body);
      else await adminApi.adminPatchDish(modal.menuItemId, body);
      setModal(null);
      setNotice(modal.mode === "add" ? "Dish added." : "Dish updated.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeDish = async (menuItemId) => {
    setError(null);
    try {
      const res = await adminApi.adminDeleteDish(menuItemId);
      setNotice(res?.archived ? "Dish archived (kept for order history)." : "Dish deleted.");
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAvailable = async (m) => {
    setError(null);
    try {
      await adminApi.adminPatchDish(m.menu_item_id, { is_available: !m.is_available });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-3 border-t pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold text-homatri-orange"
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          Manage menu {data ? `(${live.length} dishes · ${assignedCategories.length} categories)` : ""}
        </button>
        {open ? (
          <button
            type="button"
            onClick={openAdd}
            className="text-[11px] font-semibold inline-flex items-center gap-1 text-white bg-homatri-orange px-2.5 py-1 rounded-full"
          >
            <Plus className="w-3 h-3" /> Add dish
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="mt-2 space-y-3">
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          {notice ? <p className="text-xs text-homatri-green">{notice}</p> : null}
          {data === null && !error ? <p className="text-xs text-homatri-muted">Loading…</p> : null}
          {data !== null && assignedCategories.length === 0 ? (
            <p className="text-xs text-homatri-muted">
              No categories assigned yet — assign some from the Menu Categories page first.
            </p>
          ) : null}
          {grouped.map(({ cat, dishes }) => (
            <div key={cat?.category_id ?? "unfiled"} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-homatri-muted">
                {cat ? cat.name : "Unfiled"} · {dishes.length}
              </p>
              {dishes.map((m) => (
                <div key={m.menu_item_id} className="flex items-center gap-2 text-xs bg-homatri-orange-light/40 rounded-xl px-2.5 py-1.5">
                  {m.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={toBackendMediaUrl(m.image_url)} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : null}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      m.dietary_tag === "VEG" || m.dietary_tag === "VEGAN"
                        ? "bg-green-600"
                        : m.dietary_tag === "NON_VEG"
                          ? "bg-red-600"
                          : "bg-gray-400"
                    }`}
                  />
                  <span className={`flex-1 min-w-0 truncate ${m.is_available ? "" : "line-through opacity-60"}`}>
                    {m.dish_name}
                  </span>
                  <span className="text-homatri-muted shrink-0">₹{Number(m.unit_price).toLocaleString("en-IN")}</span>
                  <button
                    type="button"
                    onClick={() => toggleAvailable(m)}
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.is_available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                    title="Toggle availability"
                  >
                    {m.is_available ? "LIVE" : "OFF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="shrink-0 text-homatri-muted hover:text-homatri-orange"
                    title="Edit dish"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {confirmId === m.menu_item_id ? (
                    <span className="shrink-0 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => removeDish(m.menu_item_id)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white"
                      >
                        Remove
                      </button>
                      <button type="button" onClick={() => setConfirmId(null)} className="text-[10px] text-homatri-muted">
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(m.menu_item_id)}
                      className="shrink-0 text-homatri-muted hover:text-red-600"
                      title="Remove dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {dishes.length === 0 ? (
                <p className="text-[11px] text-homatri-muted pl-1">No dishes yet.</p>
              ) : null}
            </div>
          ))}
          {archivedOnly.length > 0 ? (
            <details className="text-xs text-homatri-muted">
              <summary className="cursor-pointer">{archivedOnly.length} archived</summary>
              {archivedOnly.map((m) => (
                <p key={m.menu_item_id} className="line-through opacity-60">
                  {m.dish_name} ₹{Number(m.unit_price).toLocaleString("en-IN")}
                </p>
              ))}
            </details>
          ) : null}

          {/* Admin add/edit dish modal */}
          {modal ? (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
              <button type="button" aria-label="Close" onClick={() => setModal(null)} className="absolute inset-0 bg-homatri-dark/50" />
              <form
                onSubmit={saveDish}
                className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-3 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-medium">{modal.mode === "add" ? "Add dish" : "Edit dish"}</h3>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-homatri-muted hover:bg-homatri-orange-light"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <select
                  required
                  value={modal.draft.category_id}
                  onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, category_id: e.target.value } }))}
                  className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="" disabled>
                    Select category…
                  </option>
                  {assignedCategories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  required
                  value={modal.draft.dish_name}
                  onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, dish_name: e.target.value } }))}
                  placeholder="Dish name *"
                  className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                />
                <textarea
                  value={modal.draft.description}
                  onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, description: e.target.value } }))}
                  placeholder="Short description"
                  rows={2}
                  className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                />
                <div className="flex items-center gap-3 border border-homatri-border rounded-xl p-3">
                  {modal.draft.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={toBackendMediaUrl(modal.draft.image_url)}
                      alt="Dish preview"
                      className="w-14 h-14 rounded-xl object-cover border border-homatri-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-homatri-orange-light border border-dashed border-homatri-border flex items-center justify-center">
                      <Camera className="w-5 h-5 text-homatri-muted" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-homatri-dark">Dish photo</p>
                    <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      className="mt-1 text-xs font-semibold text-homatri-orange disabled:opacity-60"
                    >
                      {uploading ? "Uploading…" : modal.draft.image_url ? "Replace photo" : "Upload photo"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="number"
                    min="1"
                    value={modal.draft.unit_price}
                    onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, unit_price: e.target.value } }))}
                    placeholder="Price ₹ *"
                    className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    value={modal.draft.max_availability}
                    onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, max_availability: e.target.value } }))}
                    placeholder="Plates"
                    className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={modal.draft.meal_type}
                    onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, meal_type: e.target.value } }))}
                    className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="BOTH">Both (all day)</option>
                  </select>
                  <select
                    value={modal.draft.dietary_tag}
                    onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, dietary_tag: e.target.value } }))}
                    className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non-veg</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="JAIN">Jain</option>
                  </select>
                </div>
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-homatri-orange text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
                  >
                    {saving ? "Saving…" : modal.mode === "add" ? "Add dish" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 border border-homatri-border rounded-xl text-sm font-medium text-homatri-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
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
