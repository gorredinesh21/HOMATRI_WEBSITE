"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CookChecklist({
  mealWindow,
  cutoffTime,
  totalMeals,
  summary = [],
  orders = [],
  onMarkPacked,
  isPackedReady,
}) {
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggle = (orderId) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const mark = async () => {
    setIsSubmitting(true);
    try {
      await onMarkPacked?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white border border-homatri-border rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-homatri-muted">Meal window</p>
          <p className="font-display text-2xl font-medium mt-1">{mealWindow}</p>
        </div>
        <div className="bg-white border border-homatri-border rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-homatri-muted">Cutoff</p>
          <p className="font-display text-2xl font-medium mt-1">{cutoffTime}</p>
        </div>
        <div className="bg-white border border-homatri-border rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-homatri-muted">Tiffins to prepare</p>
          <p className="font-display text-2xl font-medium mt-1">{totalMeals}</p>
        </div>
      </div>

      <section className="bg-white border border-homatri-border rounded-3xl p-5">
        <h3 className="font-display text-xl font-medium text-homatri-dark">Consolidated cook summary</h3>
        <ul className="mt-4 space-y-2">
          {summary.map((line) => (
            <li key={line.label} className="flex justify-between text-sm border-b border-homatri-border/70 py-2">
              <span>{line.label}</span>
              <strong>{line.quantity}×</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-xl font-medium text-homatri-dark">Order by order</h3>
        {orders.map((order) => {
          const open = expandedOrderIds.has(order.orderId);
          return (
            <article key={order.orderId} className="bg-white border border-homatri-border rounded-2xl">
              <button
                type="button"
                onClick={() => toggle(order.orderId)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span>
                  <span className="font-medium text-sm text-homatri-dark">{order.customerName}</span>
                  <span className="text-xs text-homatri-muted ml-2">{order.orderId}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open ? (
                <div className="px-4 pb-4 text-sm space-y-1">
                  {(order.items || []).map((item) => (
                    <p key={item.label}>
                      {item.quantity}× {item.label}
                    </p>
                  ))}
                  {order.notes ? (
                    <p className="text-homatri-orange text-xs mt-2">Note: {order.notes}</p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <button
        type="button"
        disabled={isPackedReady || isSubmitting}
        onClick={mark}
        className="w-full bg-homatri-green hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50"
      >
        {isPackedReady ? "Batch packed — waiting for driver" : "Mark batch packed & ready for driver pickup"}
      </button>
    </div>
  );
}
