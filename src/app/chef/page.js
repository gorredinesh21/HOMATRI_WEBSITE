"use client";

import Link from "next/link";
import CookChecklist from "./_components/CookChecklist";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefOverviewPage() {
  const {
    windowInfo,
    cook,
    acceptingOrders,
    toggleAccepting,
    pauseKitchen,
    kitchenState,
    remainingCapacity,
    committedMeals,
    kitchen,
    markPacked,
    isPackedReady,
    notice,
  } = useChefDashboard();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Today’s overview</p>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-homatri-dark mt-1">
          {kitchen.kitchenName}
        </h1>
        <p className="text-sm text-homatri-muted mt-2">{windowInfo.label}</p>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={toggleAccepting}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            acceptingOrders && kitchenState === "ACCEPTING_ORDERS"
              ? "bg-homatri-green text-white"
              : "bg-white border border-homatri-border"
          }`}
        >
          {kitchenState === "ACCEPTING_ORDERS" ? "Accepting orders" : kitchenState.replace(/_/g, " ")}
        </button>
        <button
          type="button"
          onClick={pauseKitchen}
          className="px-4 py-2 rounded-full text-sm font-medium border border-homatri-border bg-white"
        >
          Pause kitchen
        </button>
        <p className="text-sm text-homatri-muted">
          Capacity {committedMeals}/{kitchen.dailyCapacity} meals · {remainingCapacity} remaining
        </p>
      </div>

      {kitchenState === "CAPACITY_REACHED" ? (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3">
          This kitchen has reached today’s meal capacity. New demand must be rejected by the server until the window resets.
        </p>
      ) : null}

      {notice ? <p className="text-sm text-homatri-green">{notice}</p> : null}

      <CookChecklist
        mealWindow={windowInfo.mealWindow}
        cutoffTime={windowInfo.cutoffTime}
        totalMeals={cook.totalMeals}
        summary={cook.summary}
        orders={cook.orders}
        onMarkPacked={markPacked}
        isPackedReady={isPackedReady}
      />

      <Link href="/chef/checklist" className="text-sm font-semibold text-homatri-orange">
        Open full cooking checklist →
      </Link>
    </div>
  );
}
