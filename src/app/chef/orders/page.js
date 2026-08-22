"use client";

import { useChefDashboard } from "@/context/ChefDashboardContext";

const PIPELINE = ["COOKING", "PACKED_READY", "PICKED_UP_BY_DRIVER"];

export default function ChefOrdersPage() {
  const { orders, rider, isPackedReady } = useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Live orders</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Kitchen handoff</h1>
      </header>

      <section className="bg-white border border-homatri-border rounded-3xl p-5">
        <p className="text-[11px] uppercase tracking-widest text-homatri-muted">Assigned rider · 1 chef : 1 driver</p>
        <p className="font-display text-2xl font-medium mt-1">{rider.riderName}</p>
        <p className="text-sm text-homatri-muted">Vehicle {rider.vehicleNumber}</p>
        {isPackedReady ? (
          <p className="text-sm text-homatri-green mt-2">Batch is packed. Rider can confirm kitchen pickup.</p>
        ) : (
          <p className="text-sm text-homatri-muted mt-2">Mark the batch packed on Overview before pickup.</p>
        )}
      </section>

      <div className="flex gap-2 text-[11px] font-semibold text-homatri-muted">
        {PIPELINE.map((step) => (
          <span key={step} className="bg-white border border-homatri-border rounded-full px-3 py-1">
            {step.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.orderId} className="bg-white border border-homatri-border rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium text-homatri-dark">{order.customerName}</p>
                <p className="text-xs text-homatri-muted">{order.orderId}</p>
              </div>
              <span className="text-[11px] font-semibold bg-homatri-cream px-2 py-1 rounded-full h-fit">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <ul className="mt-2 text-sm text-homatri-muted">
              {order.items.map((item) => (
                <li key={item.label}>
                  {item.quantity}× {item.label}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
