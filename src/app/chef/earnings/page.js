"use client";

import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefEarningsPage() {
  const { earnings } = useChefDashboard();

  const cards = [
    { label: "Today’s kitchen income", value: `₹${earnings.todayIncome.toLocaleString("en-IN")}` },
    { label: "Weekly payout", value: `₹${earnings.weeklyPayout.toLocaleString("en-IN")}` },
    { label: "Completed orders", value: earnings.completedOrders },
    { label: "Repeat customer retention", value: `${earnings.repeatRetentionPct}%` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Earnings & payouts</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Your kitchen ledger</h1>
      </header>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <article key={card.label} className="bg-white border border-homatri-border rounded-3xl p-5">
            <p className="text-[11px] uppercase tracking-widest text-homatri-muted">{card.label}</p>
            <p className="font-display text-3xl font-medium mt-2">{card.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
