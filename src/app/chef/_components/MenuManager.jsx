"use client";

import { useState } from "react";

const DIETARY_OPTIONS = [
  { value: "VEG", label: "Veg" },
  { value: "NON_VEG", label: "Non-veg" },
  { value: "VEGAN", label: "Vegan" },
  { value: "JAIN", label: "Jain" },
];

function dietaryLabel(tag) {
  return DIETARY_OPTIONS.find((option) => option.value === tag)?.label || "";
}

function dietaryDotClass(tag) {
  return tag === "NON_VEG"
    ? "bg-red-500"
    : tag === "VEGAN"
      ? "bg-emerald-500"
      : tag === "JAIN"
        ? "bg-amber-500"
        : "bg-homatri-green";
}

const BLANK_DRAFT = {
  itemName: "",
  description: "",
  unitPrice: "",
  mealWindow: "LUNCH",
  availability: "IN_STOCK",
  dietaryTag: "VEG",
};

export default function MenuManager({ items = [], onCreate, onUpdate, onDelete, onToggleAvailability }) {
  const [mealWindow, setMealWindow] = useState("LUNCH");
  const [editingItemId, setEditingItemId] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formDraft, setFormDraft] = useState({ ...BLANK_DRAFT, mealWindow });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const visible = items.filter((item) => item.mealWindow === mealWindow);

  const resetForm = (nextWindow) => {
    setEditingItemId(null);
    setFormDraft({ ...BLANK_DRAFT, mealWindow: nextWindow ?? mealWindow });
  };

  const save = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...formDraft,
        unitPrice: Number(formDraft.unitPrice),
        mealWindow: formDraft.mealWindow,
      };
      if (!payload.itemName || Number.isNaN(payload.unitPrice) || payload.unitPrice <= 0) {
        throw new Error("Name and a valid price are required. The server revalidates price and stock.");
      }
      if (editingItemId) {
        await onUpdate({ ...payload, menuItemId: editingItemId });
      } else {
        await onCreate(payload);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (menuItemId) => {
    setDeletingId(menuItemId);
    setError(null);
    try {
      await onDelete(menuItemId);
      setConfirmingDeleteId(null);
      if (editingItemId === menuItemId) resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex gap-2">
          {["LUNCH", "DINNER"].map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => {
                setMealWindow(window);
                if (!editingItemId) setFormDraft((prev) => ({ ...prev, mealWindow: window }));
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                mealWindow === window ? "bg-homatri-orange text-white" : "bg-white border border-homatri-border"
              }`}
            >
              {window}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-homatri-muted bg-white border border-homatri-border rounded-2xl px-4 py-6 text-center">
            No dishes in this window yet. Add your first one with the form.
          </p>
        ) : null}
        {visible.map((item) => (
          <div
            key={item.menuItemId}
            className={`bg-white border rounded-2xl p-4 flex items-start justify-between gap-3 ${
              confirmingDeleteId === item.menuItemId ? "border-red-300" : "border-homatri-border"
            }`}
          >
            <div className="min-w-0">
              <p className="font-medium text-homatri-dark flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dietaryDotClass(item.dietaryTag)}`} />
                <span className="truncate">{item.itemName}</span>
              </p>
              <p className="text-sm text-homatri-orange">₹{item.unitPrice}</p>
              {item.description ? (
                <p className="text-xs text-homatri-muted">{item.description}</p>
              ) : null}
              <p className="text-[11px] text-homatri-muted">
                {dietaryLabel(item.dietaryTag) || "Dietary tag not set"}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <button
                type="button"
                onClick={() =>
                  onToggleAvailability(
                    item.menuItemId,
                    item.availability === "IN_STOCK" ? "SOLD_OUT" : "IN_STOCK"
                  )
                }
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.availability === "IN_STOCK"
                    ? "bg-homatri-green-light text-homatri-green"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {item.availability === "IN_STOCK" ? "In stock" : "Sold out"}
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDeleteId(null);
                    setEditingItemId(item.menuItemId);
                    setFormDraft({ ...BLANK_DRAFT, ...item });
                  }}
                  className="text-xs font-semibold text-homatri-muted hover:text-homatri-dark"
                >
                  Edit
                </button>
                {confirmingDeleteId === item.menuItemId ? (
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deletingId === item.menuItemId}
                      onClick={() => remove(item.menuItemId)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-600 text-white disabled:opacity-60"
                    >
                      {deletingId === item.menuItemId ? "Removing…" : "Confirm"}
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
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingDeleteId(item.menuItemId);
                      if (editingItemId === item.menuItemId) resetForm();
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="lg:col-span-2 bg-white border border-homatri-border rounded-3xl p-5 space-y-3 h-fit">
        <h3 className="font-display text-xl font-medium">{editingItemId ? "Edit dish" : "Add dish"}</h3>
        <input
          required
          value={formDraft.itemName || ""}
          onChange={(event) => setFormDraft((prev) => ({ ...prev, itemName: event.target.value }))}
          placeholder="Dish name"
          className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          value={formDraft.description || ""}
          onChange={(event) => setFormDraft((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Description"
          rows={2}
          className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          min="1"
          value={formDraft.unitPrice ?? ""}
          onChange={(event) => setFormDraft((prev) => ({ ...prev, unitPrice: event.target.value }))}
          placeholder="Price ₹"
          className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={formDraft.mealWindow || "LUNCH"}
            onChange={(event) => setFormDraft((prev) => ({ ...prev, mealWindow: event.target.value }))}
            className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
          >
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>
          <select
            value={formDraft.dietaryTag || "VEG"}
            onChange={(event) => setFormDraft((prev) => ({ ...prev, dietaryTag: event.target.value }))}
            className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
          >
            {DIETARY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-homatri-orange text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
          >
            {isSaving ? "Saving…" : editingItemId ? "Save changes" : "Add dish"}
          </button>
          {editingItemId ? (
            <button
              type="button"
              onClick={() => resetForm()}
              className="px-4 border border-homatri-border rounded-xl text-sm font-medium text-homatri-muted"
            >
              Cancel
            </button>
          ) : null}
        </div>
        <p className="text-[11px] text-homatri-muted">
          Removing a dish hides it from customers immediately. Dishes with past orders stay in your
          sales records but never show on the menu again.
        </p>
      </form>
    </div>
  );
}
