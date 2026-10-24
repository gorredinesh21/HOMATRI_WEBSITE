"use client";

import { useMemo, useState } from "react";
import { Minus, Pencil, Plus, Search, Trash2, X } from "lucide-react";

const DIETARY_OPTIONS = [
  { value: "VEG", label: "Veg" },
  { value: "NON_VEG", label: "Non-veg" },
  { value: "VEGAN", label: "Vegan" },
  { value: "JAIN", label: "Jain" },
];

const WINDOW_OPTIONS = [
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "BOTH", label: "Both (all day)" },
];

const SECTION_LABELS = {
  BOTH: "All day (lunch + dinner)",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

const BLANK_DRAFT = {
  itemName: "",
  description: "",
  unitPrice: "",
  mealWindow: "LUNCH",
  dietaryTag: "VEG",
  maxAvailability: 10,
};

function dietaryDotClass(tag) {
  return tag === "NON_VEG"
    ? "bg-red-500"
    : tag === "VEGAN"
      ? "bg-emerald-500"
      : tag === "JAIN"
        ? "bg-amber-500"
        : "bg-homatri-green";
}

function dietaryLabel(tag) {
  return DIETARY_OPTIONS.find((o) => o.value === tag)?.label || "Veg";
}

/* Zomato/Swiggy-style availability switch: right = in stock. */
function StockSwitch({ isInStock, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isInStock}
      onClick={() => onChange(!isInStock)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        isInStock ? "bg-homatri-green" : "bg-gray-300"
      }`}
      title={isInStock ? "In stock — tap to mark sold out" : "Sold out — tap to restock"}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
          isInStock ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

/* Quantity stepper: plates available today. */
function QuantityStepper({ value, onChange, disabled }) {
  const set = (next) => {
    const clamped = Math.max(0, Math.min(99, next));
    if (clamped !== value) onChange(clamped);
  };
  return (
    <div className="flex items-center gap-1" title="Plates available today">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => set(value - 1)}
        className="w-7 h-7 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted disabled:opacity-40 hover:bg-homatri-orange-light"
        aria-label="Decrease plates"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-10 text-center text-sm font-semibold text-homatri-dark">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= 99}
        onClick={() => set(value + 1)}
        className="w-7 h-7 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted disabled:opacity-40 hover:bg-homatri-orange-light"
        aria-label="Increase plates"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function MenuManager({
  items = [],
  onCreate,
  onUpdate,
  onDelete,
  onToggleAvailability,
}) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = add mode
  const [formDraft, setFormDraft] = useState({ ...BLANK_DRAFT });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.itemName?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const sections = useMemo(() => {
    const groups = { BOTH: [], LUNCH: [], DINNER: [] };
    for (const item of filtered) {
      const key = ["BOTH", "LUNCH", "DINNER"].includes(item.mealWindow)
        ? item.mealWindow
        : "BOTH";
      groups[key].push(item);
    }
    return groups;
  }, [filtered]);

  const soldOutCount = items.filter((i) => i.availability === "SOLD_OUT").length;

  const openAdd = () => {
    setEditingItem(null);
    setFormDraft({ ...BLANK_DRAFT });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormDraft({
      itemName: item.itemName || "",
      description: item.description || "",
      unitPrice: item.unitPrice != null ? String(item.unitPrice) : "",
      mealWindow: item.mealWindow || "LUNCH",
      dietaryTag: item.dietaryTag || "VEG",
      maxAvailability: item.maxAvailability ?? 0,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...formDraft,
        unitPrice: Number(formDraft.unitPrice),
        maxAvailability: Number(formDraft.maxAvailability) || 0,
      };
      if (!payload.itemName || Number.isNaN(payload.unitPrice) || payload.unitPrice <= 0) {
        throw new Error("Dish name and a valid price are required.");
      }
      if (editingItem) {
        await onUpdate({ ...payload, menuItemId: editingItem.menuItemId });
      } else {
        await onCreate(payload);
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const patchItem = async (item, patch) => {
    setBusyId(item.menuItemId);
    try {
      await onUpdate({
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        description: item.description,
        unitPrice: item.unitPrice,
        mealWindow: item.mealWindow,
        dietaryTag: item.dietaryTag,
        maxAvailability: item.maxAvailability ?? 0,
        ...patch,
      });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (menuItemId) => {
    setDeletingId(menuItemId);
    try {
      await onDelete(menuItemId);
      setConfirmingDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const renderRow = (item) => {
    const isInStock = item.availability === "IN_STOCK";
    const busy = busyId === item.menuItemId;
    return (
      <div
        key={item.menuItemId}
        className={`bg-white border rounded-2xl p-4 ${
          confirmingDeleteId === item.menuItemId ? "border-red-300" : "border-homatri-border"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-homatri-dark flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full border shrink-0 border-gray-300 ${dietaryDotClass(item.dietaryTag)}`} />
              <span className="truncate">{item.itemName}</span>
            </p>
            <p className="text-sm font-semibold text-homatri-dark mt-0.5">₹{item.unitPrice}</p>
            {item.description ? (
              <p className="text-xs text-homatri-muted mt-0.5 line-clamp-2">{item.description}</p>
            ) : null}
            <p className="text-[11px] text-homatri-muted mt-1">
              {dietaryLabel(item.dietaryTag)} · {SECTION_LABELS[item.mealWindow] || "All day"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold ${isInStock ? "text-homatri-green" : "text-red-500"}`}>
                {isInStock ? "Available" : "Sold out"}
              </span>
              <StockSwitch
                isInStock={isInStock}
                onChange={(next) => patchItem(item, { availability: next ? "IN_STOCK" : "SOLD_OUT" })}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-homatri-muted">Plates</span>
              <QuantityStepper
                value={item.maxAvailability ?? 0}
                disabled={busy}
                onChange={(value) => patchItem(item, { maxAvailability: value })}
              />
            </div>

            {confirmingDeleteId === item.menuItemId ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deletingId === item.menuItemId}
                  onClick={() => remove(item.menuItemId)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-600 text-white disabled:opacity-60"
                >
                  {deletingId === item.menuItemId ? "Removing…" : "Yes, remove"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(null)}
                  className="text-xs font-medium text-homatri-muted"
                >
                  Keep
                </button>
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="w-8 h-8 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted hover:text-homatri-orange hover:border-homatri-orange"
                  title="Edit dish"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(item.menuItemId)}
                  className="w-8 h-8 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted hover:text-red-600 hover:border-red-300"
                  title="Remove dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: add button + search — Zomato partner style */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-homatri-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your dishes…"
            className="w-full bg-white border border-homatri-border rounded-xl pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="bg-homatri-orange hover:bg-homatri-orange-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Dish
        </button>
      </div>

      <p className="text-xs text-homatri-muted">
        {items.length} dish{items.length === 1 ? "" : "es"} on your menu
        {soldOutCount > 0 ? ` · ${soldOutCount} sold out` : ""}
        {" "}· toggle a dish off to hide it from customers instantly
      </p>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-homatri-border rounded-3xl px-6 py-14 text-center">
          <p className="font-display text-xl text-homatri-dark">Your menu is empty</p>
          <p className="text-sm text-homatri-muted mt-1">
            Add your first dish — customers will see it on homatri.com right away.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-4 bg-homatri-orange hover:bg-homatri-orange-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add your first dish
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-homatri-muted bg-white border border-homatri-border rounded-2xl px-4 py-6 text-center">
          No dishes match “{query}”.
        </p>
      ) : (
        Object.entries(sections)
          .filter(([, groupItems]) => groupItems.length > 0)
          .map(([key, groupItems]) => (
            <section key={key} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-homatri-muted">
                {SECTION_LABELS[key]} · {groupItems.length}
              </h3>
              {groupItems.map(renderRow)}
            </section>
          ))
      )}

      {/* Add / Edit modal — Zomato/Swiggy item editor pattern */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-homatri-dark/50"
          />
          <form
            onSubmit={save}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-medium">
                {editingItem ? "Edit dish" : "Add new dish"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-homatri-muted hover:bg-homatri-orange-light"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              required
              autoFocus
              value={formDraft.itemName}
              onChange={(e) => setFormDraft((p) => ({ ...p, itemName: e.target.value }))}
              placeholder="Dish name *"
              className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
            />
            <textarea
              value={formDraft.description}
              onChange={(e) => setFormDraft((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description (what's in it?)"
              rows={2}
              className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                min="1"
                value={formDraft.unitPrice ?? ""}
                onChange={(e) => setFormDraft((p) => ({ ...p, unitPrice: e.target.value }))}
                placeholder="Price ₹ *"
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
              />
              <input
                type="number"
                min="0"
                max="99"
                value={formDraft.maxAvailability ?? 0}
                onChange={(e) => setFormDraft((p) => ({ ...p, maxAvailability: e.target.value }))}
                placeholder="Plates available"
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formDraft.mealWindow || "LUNCH"}
                onChange={(e) => setFormDraft((p) => ({ ...p, mealWindow: e.target.value }))}
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
              >
                {WINDOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={formDraft.dietaryTag || "VEG"}
                onChange={(e) => setFormDraft((p) => ({ ...p, dietaryTag: e.target.value }))}
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm"
              >
                {DIETARY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-homatri-orange text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
              >
                {isSaving ? "Saving…" : editingItem ? "Save changes" : "Add dish"}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 border border-homatri-border rounded-xl text-sm font-medium text-homatri-muted"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-homatri-muted text-center">
              Changes go live for customers immediately.
            </p>
          </form>
        </div>
      ) : null}
    </div>
  );
}
