"use client";

import { useEffect, useState } from "react";
import { useChefDashboard } from "@/context/ChefDashboardContext";
import { useAuth } from "@/context/AuthContext";
import { fetchChefEarningsHistory } from "@/lib/api";

export default function ChefEarningsPage() {
  const { earnings } = useChefDashboard();
  const { token } = useAuth();
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchChefEarningsHistory(token)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((err) => {
        if (!cancelled) setHistoryError(err?.message || "Could not load your payout history.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const cards = [
    { label: "Today’s kitchen income", value: `₹${earnings.todayIncome.toLocaleString("en-IN")}` },
    { label: "Weekly payout", value: `₹${earnings.weeklyPayout.toLocaleString("en-IN")}` },
    { label: "Completed orders", value: earnings.completedOrders },
    { label: "Repeat customer retention", value: `${earnings.repeatRetentionPct}%` },
  ];

  const orders = history?.orders || [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Earnings & payouts</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Your kitchen ledger</h1>
        <p className="text-sm text-homatri-muted mt-2">
          Kitchen income = order total minus the delivery fee. Weekly payouts are sent to your
          registered UPI ID.
        </p>
      </header>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <article key={card.label} className="bg-white border border-homatri-border rounded-3xl p-5">
            <p className="text-[11px] uppercase tracking-widest text-homatri-muted">{card.label}</p>
            <p className="font-display text-3xl font-medium mt-2">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="bg-white border border-homatri-border rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-medium text-homatri-dark">Delivered orders &amp; payouts</h2>
          {history ? (
            <p className="text-xs text-homatri-muted">{orders.length} delivered orders</p>
          ) : null}
        </div>

        {historyError ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {historyError}
          </p>
        ) : !history ? (
          <p className="text-sm text-homatri-muted">Loading your payouts…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-homatri-muted">
            No delivered orders yet. Once your meals are delivered, every payout shows up here
            order by order.
          </p>
        ) : (
          <>
            {/* Mobile-friendly card list */}
            <ul className="sm:hidden space-y-3">
              {orders.map((o) => (
                <li key={o.orderId} className="border border-homatri-border rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-homatri-dark truncate">{o.customerName}</p>
                    <p className="text-sm font-bold text-homatri-green">
                      ₹{o.kitchenIncome.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="text-xs text-homatri-muted">
                    {o.serviceDate ? new Date(o.serviceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} ·{" "}
                    {o.mealWindow} · order {o.orderId}
                  </p>
                  <p className="text-[11px] text-homatri-muted">
                    Total ₹{o.orderTotal.toLocaleString("en-IN")} (incl. ₹
                    {o.deliveryFee.toLocaleString("en-IN")} delivery) · {o.paymentMethod} ·{" "}
                    {o.paymentStatus}
                  </p>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-homatri-muted border-b border-homatri-border">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Window</th>
                    <th className="py-2 pr-3">Order</th>
                    <th className="py-2 pr-3 text-right">Order total</th>
                    <th className="py-2 pr-3 text-right">Delivery</th>
                    <th className="py-2 text-right">Your income</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderId} className="border-b border-homatri-border/60 last:border-0">
                      <td className="py-2.5 pr-3 whitespace-nowrap text-homatri-dark">
                        {o.serviceDate
                          ? new Date(o.serviceDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-homatri-dark truncate max-w-[160px]">
                        {o.customerName}
                      </td>
                      <td className="py-2.5 pr-3 text-homatri-muted">{o.mealWindow}</td>
                      <td className="py-2.5 pr-3 text-homatri-muted font-mono text-xs">
                        {o.orderId}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-homatri-dark">
                        ₹{o.orderTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-homatri-muted">
                        ₹{o.deliveryFee.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 text-right font-bold text-homatri-green">
                        ₹{o.kitchenIncome.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
