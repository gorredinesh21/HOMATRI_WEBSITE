"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, ChevronRight, ArrowLeft, Minus, Pencil, Plus, Search, Trash2, UtensilsCrossed, X } from "lucide-react";
import { toBackendMediaUrl } from "@/lib/api";

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
  categoryId: "",
  mealWindow: "BOTH",
  dietaryTag: "VEG",
  maxAvailability: 10,
  imageUrl: null,
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

function DishThumb({ item, size = 48 }) {
  const url = toBackendMediaUrl(item.imageUrl);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={item.itemName}
      className={`rounded-xl object-cover shrink-0 border border-homatri-border`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`rounded-xl bg-homatri-orange-light flex items-center justify-center shrink-0 border border-dashed border-homatri-border`}
      style={{ width: size, height: size }}
      title="No photo yet"
    >
      <UtensilsCrossed className="w-4 h-4 text-homatri-muted" />
    </div>
  );
}

export default function MenuManager({
  items = [],
  categories = [],
  onCreate,
  onUpdate,
  onDelete,
  onToggleAvailability,
  onUploadImage,
}) {
  const [query, setQuery] = useState("");
  const [openCategoryId, setOpenCategoryId] = useState(null); // null = category list
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = add mode
  const [formDraft, setFormDraft] = useState({ ...BLANK_DRAFT });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const standardCategories = categories.filter((c) => c.pricingType !== "PAIR_COMBO");
  const comboCategories = categories.filter((c) => c.pricingType === "PAIR_COMBO");

  const categoriesWithCounts = useMemo(() => {
    const counts = {};
    for (const item of items) {
      const key = item.categoryId || "__unfiled__";
      counts[key] = (counts[key] || 0) + 1;
    }
    return standardCategories.map((c) => ({ ...c, liveCount: counts[c.categoryId] || 0 }));
  }, [standardCategories, items]);

  const unfiledItems = useMemo(() => items.filter((i) => !i.categoryId), [items]);

  const openCategory = useMemo(
    () => categoriesWithCounts.find((c) => c.categoryId === openCategoryId) || null,
    [categoriesWithCounts, openCategoryId]
  );

  const categoryItems = useMemo(() => {
    if (openCategoryId === "__unfiled__") return unfiledItems;
    return items.filter((i) => i.categoryId === openCategoryId);
  }, [items, openCategoryId, unfiledItems]);

  const searching = query.trim().length > 0;
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (item) =>
        item.itemName?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const soldOutCount = items.filter((i) => i.availability === "SOLD_OUT").length;

  const openAdd = (presetCategoryId = "") => {
    setEditingItem(null);
    setFormDraft({ ...BLANK_DRAFT, categoryId: presetCategoryId });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormDraft({
      itemName: item.itemName || "",
      description: item.description || "",
      unitPrice: item.unitPrice != null ? String(item.unitPrice) : "",
      categoryId: item.categoryId || "",
      mealWindow: item.mealWindow || "BOTH",
      dietaryTag: item.dietaryTag || "VEG",
      maxAvailability: item.maxAvailability ?? 0,
      imageUrl: item.imageUrl || null,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleImagePicked = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setFormError(null);
    try {
      const result = await onUploadImage(file, editingItem?.menuItemId || null);
      if (result?.imageUrl) {
        setFormDraft((p) => ({ ...p, imageUrl: result.imageUrl }));
      }
    } catch (err) {
      setFormError(err.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      if (!payload.categoryId) {
        throw new Error("Pick the category this dish belongs to.");
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
        categoryId: item.categoryId,
        mealWindow: item.mealWindow,
        dietaryTag: item.dietaryTag,
        maxAvailability: item.maxAvailability ?? 0,
        imageUrl: item.imageUrl ?? null,
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
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <DishThumb item={item} />
            <div className="min-w-0">
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
                {item.categoryName ? ` · ${item.categoryName}` : ""}
              </p>
            </div>
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

  const renderCategoryCard = (cat) => (
    <button
      key={cat.categoryId}
      type="button"
      onClick={() => {
        setOpenCategoryId(cat.categoryId);
        setQuery("");
      }}
      className="w-full text-left bg-white border border-homatri-border rounded-2xl p-4 hover:border-homatri-orange transition-colors flex items-center gap-4"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-homatri-dark truncate">{cat.name}</p>
        <p className="text-xs text-homatri-muted mt-0.5">
          {cat.liveCount} dish{cat.liveCount === 1 ? "" : "es"}
          {cat.startingPrice ? ` · from ₹${Math.round(cat.startingPrice)}` : ""}
        </p>
      </div>
      <span className="text-[11px] font-semibold text-homatri-orange bg-homatri-orange-light px-2.5 py-1 rounded-full">
        Open
      </span>
      <ChevronRight className="w-4 h-4 text-homatri-muted shrink-0" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar: add button + search */}
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
          onClick={() => openAdd(openCategoryId && openCategoryId !== "__unfiled__" ? openCategoryId : "")}
          className="bg-homatri-orange hover:bg-homatri-orange-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Dish
        </button>
      </div>

      {/* Search results view (flat) */}
      {searching ? (
        <div className="space-y-3">
          <p className="text-xs text-homatri-muted">
            {searchResults.length} dish{searchResults.length === 1 ? "" : "es"} match “{query}”
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-homatri-muted bg-white border border-homatri-border rounded-2xl px-4 py-6 text-center">
              No dishes match “{query}”.
            </p>
          ) : (
            searchResults.map(renderRow)
          )}
        </div>
      ) : openCategory ? (
        /* ---- Category detail view ---- */
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenCategoryId(null)}
              className="w-8 h-8 rounded-lg border border-homatri-border flex items-center justify-center text-homatri-muted hover:text-homatri-orange hover:border-homatri-orange"
              title="Back to categories"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="font-display text-lg text-homatri-dark">{openCategory.name}</h3>
              <p className="text-xs text-homatri-muted">
                {openCategory.liveCount} dish{openCategory.liveCount === 1 ? "" : "es"} in this category
              </p>
            </div>
          </div>
          {openCategory.description ? (
            <p className="text-xs text-homatri-muted">{openCategory.description}</p>
          ) : null}
          {categoryItems.length === 0 ? (
            <div className="bg-white border border-dashed border-homatri-border rounded-3xl px-6 py-12 text-center">
              <p className="font-display text-lg text-homatri-dark">No dishes here yet</p>
              <p className="text-sm text-homatri-muted mt-1">
                Add the first dish to {openCategory.name} — customers see it on homatri.com right away.
              </p>
              <button
                type="button"
                onClick={() => openAdd(openCategory.categoryId)}
                className="mt-4 bg-homatri-orange hover:bg-homatri-orange-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add a dish to {openCategory.name}
              </button>
            </div>
          ) : (
            categoryItems.map(renderRow)
          )}
        </div>
      ) : (
        /* ---- Category list view ("My Menu") ---- */
        <div className="space-y-3">
          <p className="text-xs text-homatri-muted">
            {items.length} dish{items.length === 1 ? "" : "es"} across {categoriesWithCounts.length} categor
            {categoriesWithCounts.length === 1 ? "y" : "ies"}
            {soldOutCount > 0 ? ` · ${soldOutCount} sold out` : ""}
          </p>

          {items.length === 0 && categoriesWithCounts.length === 0 ? (
            <div className="bg-white border border-dashed border-homatri-border rounded-3xl px-6 py-14 text-center">
              <p className="font-display text-xl text-homatri-dark">Your menu is empty</p>
              <p className="text-sm text-homatri-muted mt-1">
                Add your first dish — customers will see it on homatri.com right away.
              </p>
            </div>
          ) : (
            <>
              {categoriesWithCounts.map(renderCategoryCard)}
              {unfiledItems.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenCategoryId("__unfiled__")}
                  className="w-full text-left bg-white border border-dashed border-homatri-border rounded-2xl p-4 flex items-center gap-4 hover:border-homatri-orange transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-homatri-dark truncate">Dishes without a category</p>
                    <p className="text-xs text-homatri-muted mt-0.5">
                      {unfiledItems.length} dish{unfiledItems.length === 1 ? "" : "es"} — open and file them under a category
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-homatri-muted shrink-0" />
                </button>
              ) : null}
              {comboCategories.map((c) => (
                <div
                  key={c.categoryId}
                  className="bg-homatri-orange-light/60 border border-homatri-border rounded-2xl p-4"
                  title="Combo categories are managed by Homatri"
                >
                  <p className="font-medium text-homatri-dark">{c.name}</p>
                  <p className="text-xs text-homatri-muted mt-0.5">
                    {c.comboServes ? `Serves ${c.comboServes} · ` : ""}Customers pick any two of your dishes — ₹
                    {Math.round(c.comboDiscount || 0)} off the pair. Runs automatically on your menu.
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
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

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-homatri-muted">
                Category *
              </label>
              <select
                required
                value={formDraft.categoryId}
                onChange={(e) => setFormDraft((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full border border-homatri-border rounded-xl px-3 py-2.5 text-sm mt-1"
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {standardCategories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
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

            {/* Dish photo */}
            <div className="flex items-center gap-3 border border-homatri-border rounded-xl p-3">
              {formDraft.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toBackendMediaUrl(formDraft.imageUrl)}
                  alt="Dish preview"
                  className="w-14 h-14 rounded-xl object-cover border border-homatri-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-homatri-orange-light border border-dashed border-homatri-border flex items-center justify-center">
                  <Camera className="w-5 h-5 text-homatri-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-homatri-dark">Dish photo</p>
                <p className="text-[11px] text-homatri-muted">JPG / PNG / WEBP, up to 5 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/heic"
                  onChange={handleImagePicked}
                  className="hidden"
                  id="dish-photo-input"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-xs font-semibold text-homatri-orange disabled:opacity-60"
                >
                  {uploadingImage
                    ? "Uploading…"
                    : formDraft.imageUrl
                      ? "Replace photo"
                      : "Upload photo"}
                </button>
              </div>
            </div>

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
                value={formDraft.mealWindow || "BOTH"}
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
