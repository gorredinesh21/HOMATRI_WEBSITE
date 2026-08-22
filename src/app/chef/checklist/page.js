"use client";

import CookChecklist from "../_components/CookChecklist";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefChecklistPage() {
  const { windowInfo, cook, markPacked, isPackedReady } = useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Cooking checklist</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Cutoff cook list</h1>
        <p className="text-sm text-homatri-muted mt-2">
          Aggregated from confirmed/batched demand. The kitchen still cannot over-commit past server capacity.
        </p>
      </header>
      <CookChecklist
        mealWindow={windowInfo.mealWindow}
        cutoffTime={windowInfo.cutoffTime}
        totalMeals={cook.totalMeals}
        summary={cook.summary}
        orders={cook.orders}
        onMarkPacked={markPacked}
        isPackedReady={isPackedReady}
      />
    </div>
  );
}
