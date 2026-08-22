"use client";

import { useState } from "react";

export default function MenuManager({ items = [], onCreate, onUpdate, onToggleAvailability }) {
  const [mealWindow, setMealWindow] = useState("LUNCH");
  const [editingItemId, setEditingItemId] = useState(null);
  const [formDraft, setFormDraft] = useState({
    itemName: "",
    description: "",
    unitPrice: "",
    mealWindow: "LUNCH",
    availability: "IN_STOCK",
    isSignatureDish: false,
    supportsCustomization: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const visible = items.filter((item) => item.mealWindow === mealWindow);

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
      if (!payload.itemName || Number.isNaN(payload.unitPrice)) {
        throw new Error("Name and a valid price are required. The server revalidates price and stock.");
      }
      if (editingItemId) {
        await onUpdate({ ...payload, menuItemId: editingItemId });
      } else {
        await onCreate(payload);
      }
      setEditingItemId(null);
      setFormDraft({
        itemName: "",
        description: "",
        unitPrice: "",
        mealWindow,
        availability: "IN_STOCK",
        isSignatureDish: false,
        supportsCustomization: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
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
              onClick={() => setMealWindow(window)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                mealWindow === window ? "bg-homatri-orange text-white" : "bg-white border border-homatri-border"
              }`}
            >
              {window}
            </button>
          ))}
        </div>
        {visible.map((item) => (
          <div key={item.menuItemId} className="bg-white border border-homatri-border rounded-2xl p-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-homatri-dark">{item.itemName}</p>
              <p className="text-sm text-homatri-orange">₹{item.unitPrice}</p>
              <p className="text-xs text-homatri-muted">{item.description}</p>
              {item.isSignatureDish ? (
                <span className="text-[11px] text-homatri-green font-semibold">Signature dish</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 items-end">
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
              <button
                type="button"
                onClick={() => {
                  setEditingItemId(item.menuItemId);
                  setFormDraft(item);
                }}
                className="text-xs font-semibold text-homatri-muted"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="lg:col-span-2 bg-white border border-homatri-border rounded-3xl p-5 space-y-3">
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
        <select
          value={formDraft.mealWindow || "LUNCH"}
          onChange={(event) => setFormDraft((prev) => ({ ...prev, mealWindow: event.target.value }))}
          className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
        >
          <option value="LUNCH">Lunch</option>
          <option value="DINNER">Dinner</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formDraft.isSignatureDish)}
            onChange={(event) => setFormDraft((prev) => ({ ...prev, isSignatureDish: event.target.checked }))}
          />
          Signature dish
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formDraft.supportsCustomization)}
            onChange={(event) => setFormDraft((prev) => ({ ...prev, supportsCustomization: event.target.checked }))}
          />
          Supports dietary notes
        </label>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-homatri-orange text-white font-semibold py-2.5 rounded-xl"
        >
          {isSaving ? "Saving…" : "Save dish"}
        </button>
        <p className="text-[11px] text-homatri-muted">
          Availability and price are display controls. FastAPI revalidates kitchen authorization, price, meal window, and stock.
        </p>
      </form>
    </div>
  );
}
