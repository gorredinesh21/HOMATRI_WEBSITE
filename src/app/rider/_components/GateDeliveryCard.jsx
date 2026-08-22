"use client";

import { useMemo, useState } from "react";
import { mapsUrl } from "@/lib/riderTrip";

export default function GateDeliveryCard({ orders = [], onConfirmAll, onMarkUndelivered }) {
  const pending = orders.filter((order) => order.status === "PENDING");
  const [undeliveredIds, setUndeliveredIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sample = pending[0] || orders[0];
  const deliverIds = useMemo(
    () => pending.filter((order) => !undeliveredIds.has(order.orderId)).map((order) => order.orderId),
    [pending, undeliveredIds]
  );

  if (!orders.length) return null;

  const toggleException = (orderId) => {
    setUndeliveredIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      for (const orderId of undeliveredIds) {
        await onMarkUndelivered?.(orderId, "Customer not available");
      }
      if (deliverIds.length) {
        await onConfirmAll?.(deliverIds);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="bg-white border border-homatri-border rounded-3xl p-5 space-y-4">
      <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Gate drop-off</p>
      <h2 className="font-display text-2xl font-medium text-homatri-dark">
        Stop #{sample?.stopNumber}: {sample?.address}
      </h2>
      <p className="text-sm text-homatri-muted">{pending.length} tiffins at this residential gate</p>
      <a
        href={mapsUrl(sample)}
        target="_blank"
        rel="noreferrer"
        className="block text-center bg-homatri-dark text-white rounded-xl py-3 text-sm font-semibold"
      >
        Open Google Maps navigation
      </a>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.orderId} className="border border-homatri-border rounded-2xl p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{order.customerName}</p>
                <p className="text-xs text-homatri-muted">Order {order.orderId}</p>
              </div>
              <span className="text-[11px] font-semibold">{order.status}</span>
            </div>
            {order.status === "PENDING" ? (
              <label className="mt-2 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={undeliveredIds.has(order.orderId)}
                  onChange={() => toggleException(order.orderId)}
                />
                Mark Order {order.orderId} undelivered (customer not available)
              </label>
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={isSubmitting || pending.length === 0}
        onClick={submit}
        className="w-full bg-homatri-green text-white font-semibold py-3 rounded-xl disabled:opacity-50"
      >
        Confirm all deliveries at this address
      </button>
      <p className="text-[11px] text-homatri-muted">
        Exceptions stay UNDELIVERED. Everyone else at the gate still completes as DELIVERED.
      </p>
    </article>
  );
}
