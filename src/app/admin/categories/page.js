"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

const BLANK = {
  name: "",
  description: "",
  display_order: 0,
  is_active: true,
  pricing_type: "STANDARD",
  combo_discount: "",
  combo_serves: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', draft, categoryId? }
  const [saving, setSaving] = useState(false);
  const [assignOpen, setAssignOpen] = useState(null); // category being assigned
  const [assignSelection, setAssignSelection] = useState([]);
  const [deleteFlow, setDeleteFlow] = useState(null); // { category, blocked, liveDishCount }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, chefList] = await Promise.all([adminApi.categories(), adminApi.chefs()]);
      setCategories(cats?.categories || []);
      setChefs(chefList || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const standardCategories = useMemo(
    () => categories.filter((c) => c.pricingType === "STANDARD"),
    [categories]
  );

  const openCreate = () => setModal({ mode: "create", draft: { ...BLANK } });

  const openEdit = (cat) =>
    setModal({
      mode: "edit",
      categoryId: cat.categoryId,
      draft: {
        name: cat.name || "",
        description: cat.description || "",
        display_order: cat.displayOrder ?? 0,
        is_active: cat.isActive !== false,
        pricing_type: cat.pricingType || "STANDARD",
        combo_discount: cat.comboDiscount != null ? String(cat.comboDiscount) : "",
        combo_serves: cat.comboServes != null ? String(cat.comboServes) : "",
      },
    });

  const save = async (event) => {
    event.preventDefault();
    const d = modal.draft;
    const body = {
      name: d.name,
      description: d.description || null,
      display_order: Number(d.display_order) || 0,
      is_active: d.is_active,
      pricing_type: d.pricing_type,
      combo_discount: d.pricing_type === "PAIR_COMBO" && d.combo_discount ? Number(d.combo_discount) : null,
      combo_serves: d.pricing_type === "PAIR_COMBO" && d.combo_serves ? Number(d.combo_serves) : null,
    };
    setSaving(true);
    setError(null);
    try {
      if (modal.mode === "create") {
        await adminApi.createCategory(body);
        setNotice(`Category “${d.name}” created.`);
      } else {
        await adminApi.patchCategory(modal.categoryId, body);
        setNotice(`Category “${d.name}” updated.`);
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitAssign = async (categoryId) => {
    setError(null);
    try {
      const res = await adminApi.assignCategory(categoryId, assignSelection);
      setNotice(`Assigned to ${res?.assigned ?? 0} chef(s).`);
      setAssignOpen(null);
      setAssignSelection([]);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const attemptDelete = async (cat) => {
    setError(null);
    try {
      const res = await adminApi.deleteCategory(cat.categoryId);
      if (res?.blocked) {
        setDeleteFlow({ category: cat, liveDishCount: res.liveDishCount, mode: "", reassignTo: "" });
      } else {
        setNotice(`Category “${cat.name}” deleted.`);
        await load();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    const { category, mode, reassignTo } = deleteFlow;
    setError(null);
    try {
      await adminApi.deleteCategory(category.categoryId, {
        mode: mode || undefined,
        reassignTo: mode === "reassign" ? reassignTo : undefined,
      });
      setNotice(`Category “${category.name}” deleted${mode === "reassign" ? " — dishes moved" : ""}.`);
      setDeleteFlow(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="text-sm text-homatri-muted">Loading categories…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Menu architecture</p>
          <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Menu categories</h1>
          <p className="text-sm text-homatri-muted mt-2">
            Create the categories chefs organise their dishes into, and assign them to kitchens.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-homatri-orange hover:bg-homatri-orange-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New category
        </button>
      </header>

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p> : null}
      {notice ? <p className="text-sm text-homatri-green bg-green-50 border border-green-200 rounded-xl px-4 py-3">{notice}</p> : null}

      <div className="grid gap-3">
        {categories.map((cat) => (
          <div key={cat.categoryId} className="bg-white border border-homatri-border rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-medium text-homatri-dark flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-homatri-orange shrink-0" />
                  <span className="truncate">{cat.name}</span>
                  {cat.pricingType === "PAIR_COMBO" ? (
                    <span className="text-[10px] font-bold uppercase bg-homatri-orange-light text-homatri-orange px-2 py-0.5 rounded-full">
                      Pick-two combo · ₹{Math.round(cat.comboDiscount || 0)} off
                      {cat.comboServes ? ` · serves ${cat.comboServes}` : ""}
                    </span>
                  ) : null}
                  {!cat.isActive ? (
                    <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Inactive</span>
                  ) : null}
                </p>
                {cat.description ? <p className="text-xs text-homatri-muted mt-1">{cat.description}</p> : null}
                <p className="text-[11px] text-homatri-muted mt-1.5">
                  Order {cat.displayOrder} · {cat.dishCount} live dish{cat.dishCount === 1 ? "" : "es"} ·{" "}
                  {cat.chefCount} kitchen{cat.chefCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAssignOpen(cat);
                    setAssignSelection([]);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-homatri-border text-homatri-dark hover:border-homatri-orange hover:text-homatri-orange flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  Assign to chefs
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="w-8 h-8 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted hover:text-homatri-orange hover:border-homatri-orange"
                  title="Edit category"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => attemptDelete(cat)}
                  className="w-8 h-8 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted hover:text-red-600 hover:border-red-300"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 ? (
          <p className="text-sm text-homatri-muted bg-white border border-dashed border-homatri-border rounded-2xl px-4 py-8 text-center">
            No categories yet — create the first one.
          </p>
        ) : null}
      </div>

      {/* Create / edit modal */}
      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button type="button" aria-label="Close" onClick={() => setModal(null)} className="absolute inset-0 bg-homatri-dark/50" />
          <form
            onSubmit={save}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-medium">
                {modal.mode === "create" ? "New category" : "Edit category"}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-homatri-muted hover:bg-homatri-orange-light"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              required
              autoFocus
              value={modal.draft.name}
              onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, name: e.target.value } }))}
              placeholder="Category name *"
              className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
            />
            <textarea
              value={modal.draft.description}
              onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, description: e.target.value } }))}
              placeholder="Description (shown to customers)"
              rows={2}
              className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={modal.draft.pricing_type}
                onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, pricing_type: e.target.value } }))}
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="STANDARD">Standard (dishes with prices)</option>
                <option value="PAIR_COMBO">Pick-two combo (₹ off)</option>
              </select>
              <input
                type="number"
                min="0"
                value={modal.draft.display_order}
                onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, display_order: e.target.value } }))}
                placeholder="Display order"
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
            {modal.draft.pricing_type === "PAIR_COMBO" ? (
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={modal.draft.combo_discount}
                  onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, combo_discount: e.target.value } }))}
                  placeholder="Discount ₹ per pair *"
                  className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                />
                <input
                  required
                  type="number"
                  min="2"
                  value={modal.draft.combo_serves}
                  onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, combo_serves: e.target.value } }))}
                  placeholder="Serves *"
                  className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-homatri-dark">
              <input
                type="checkbox"
                checked={modal.draft.is_active}
                onChange={(e) => setModal((m) => ({ ...m, draft: { ...m.draft, is_active: e.target.checked } }))}
              />
              Active (visible once assigned to chefs)
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-homatri-orange text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
              >
                {saving ? "Saving…" : modal.mode === "create" ? "Create category" : "Save changes"}
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

      {/* Assign-to-chefs modal */}
      {assignOpen ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button type="button" aria-label="Close" onClick={() => setAssignOpen(null)} className="absolute inset-0 bg-homatri-dark/50" />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-medium">Assign “{assignOpen.name}”</h3>
              <button
                type="button"
                onClick={() => setAssignOpen(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-homatri-muted hover:bg-homatri-orange-light"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-homatri-muted">
              Selected chefs get this category on their menu and can add dishes inside it.
            </p>
            <div className="space-y-1.5">
              {chefs.map((chef) => (
                <label
                  key={chef.chef_phone}
                  className="flex items-center gap-2.5 border border-homatri-border rounded-xl px-3 py-2 text-sm cursor-pointer hover:border-homatri-orange"
                >
                  <input
                    type="checkbox"
                    checked={assignSelection.includes(chef.chef_phone)}
                    onChange={(e) =>
                      setAssignSelection((prev) =>
                        e.target.checked
                          ? [...prev, chef.chef_phone]
                          : prev.filter((p) => p !== chef.chef_phone)
                      )
                    }
                  />
                  <span className="font-medium text-homatri-dark">{chef.kitchen_name}</span>
                  <span className="text-xs text-homatri-muted">{chef.chef_phone}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={assignSelection.length === 0}
              onClick={() => submitAssign(assignOpen.categoryId)}
              className="w-full bg-homatri-orange text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
            >
              Assign to {assignSelection.length} chef{assignSelection.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Safe-delete modal */}
      {deleteFlow ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDeleteFlow(null)}
            className="absolute inset-0 bg-homatri-dark/50"
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-3">
            <h3 className="font-display text-xl font-medium text-red-600">
              Delete “{deleteFlow.category.name}”?
            </h3>
            <p className="text-sm text-homatri-dark">
              This category still has{" "}
              <span className="font-semibold">{deleteFlow.liveDishCount} live dish(es)</span>. Choose what happens
              to them — nothing is deleted silently:
            </p>
            <label className="flex items-start gap-2 border border-homatri-border rounded-xl px-3 py-2.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="del-mode"
                checked={deleteFlow.mode === "reassign"}
                onChange={() => setDeleteFlow((f) => ({ ...f, mode: "reassign" }))}
                className="mt-1"
              />
              <span className="flex-1">
                Move the dishes into another category
                <select
                  value={deleteFlow.reassignTo}
                  onChange={(e) => setDeleteFlow((f) => ({ ...f, reassignTo: e.target.value }))}
                  className="mt-1.5 w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
                  disabled={deleteFlow.mode !== "reassign"}
                >
                  <option value="" disabled>
                    Pick a target category…
                  </option>
                  {standardCategories
                    .filter((c) => c.categoryId !== deleteFlow.category.categoryId)
                    .map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </span>
            </label>
            <label className="flex items-start gap-2 border border-homatri-border rounded-xl px-3 py-2.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="del-mode"
                checked={deleteFlow.mode === "archive"}
                onChange={() => setDeleteFlow((f) => ({ ...f, mode: "archive" }))}
                className="mt-1"
              />
              <span>
                Archive the dishes (hidden from every menu; past orders keep their history)
              </span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={!deleteFlow.mode || (deleteFlow.mode === "reassign" && !deleteFlow.reassignTo)}
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50"
              >
                Delete category
              </button>
              <button
                type="button"
                onClick={() => setDeleteFlow(null)}
                className="px-4 border border-homatri-border rounded-xl text-sm font-medium text-homatri-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
