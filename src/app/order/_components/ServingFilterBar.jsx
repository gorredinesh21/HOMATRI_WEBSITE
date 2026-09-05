"use client";

import { DIETARY_FILTERS, REGIONAL_CUISINES } from "@/lib/catalog";

export default function ServingFilterBar({
  currentlyServing,
  onCurrentlyServingChange,
  mealWindow,
  onMealWindowChange,
  dietary,
  onDietaryChange,
  cuisine,
  onCuisineChange,
  regions,
}) {
  const regionOptions = (regions && regions.length ? regions : REGIONAL_CUISINES);
  const mealOptions = [
    { id: "ALL", label: "All" },
    { id: "LUNCH", label: "Lunch (11:30 AM Cutoff)" },
    { id: "DINNER", label: "Dinner (6:30 PM Cutoff)" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCurrentlyServingChange(!currentlyServing)}
          className={`text-xs font-bold px-3 py-2 rounded-full border transition-colors ${
            currentlyServing
              ? "bg-homatri-green text-white border-homatri-green"
              : "bg-white text-homatri-dark border-homatri-border"
          }`}
        >
          Currently Serving Kitchens
        </button>
        {mealOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onMealWindowChange(option.id)}
            className={`text-xs font-semibold px-3 py-2 rounded-full border ${
              mealWindow === option.id
                ? "bg-homatri-orange text-white border-homatri-orange"
                : "bg-white text-homatri-muted border-homatri-border"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {DIETARY_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onDietaryChange(chip)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              dietary === chip
                ? "bg-homatri-dark text-white border-homatri-dark"
                : "bg-white text-homatri-muted border-homatri-border"
            }`}
          >
            {chip}
          </button>
        ))}
        <select
          value={cuisine || ""}
          onChange={(event) => onCuisineChange(event.target.value || null)}
          className="text-xs font-semibold bg-white border border-homatri-border rounded-full px-3 py-1.5 text-homatri-dark"
        >
          <option value="">Regional cuisine</option>
          {regionOptions.map((region) => (
            <option key={region} value={region}>
              {region.split(",")[0].trim()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
