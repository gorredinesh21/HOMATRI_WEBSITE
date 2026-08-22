"use client";

import { useState } from "react";
import { mapsUrl } from "@/lib/riderTrip";

export default function LegNavigationCard({
  stop,
  remainingStops,
  onNavigate,
  onCallCustomer,
  onMarkDelivered,
  onReportAddressIssue,
}) {
  const [isActionPending, setIsActionPending] = useState(false);

  if (!stop) {
    return (
      <p className="text-sm text-homatri-muted bg-white border border-dashed border-homatri-border rounded-2xl p-5">
        No next stop. The route stays stored on the server; this screen only shows the immediate leg.
      </p>
    );
  }

  const run = async (fn) => {
    setIsActionPending(true);
    try {
      await fn();
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <article className="bg-white border border-homatri-border rounded-3xl p-5 space-y-4">
      <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Next stop only</p>
      <h2 className="font-display text-2xl font-medium text-homatri-dark">
        Stop #{stop.stopNumber}: {stop.customerName}
      </h2>
      <p className="text-sm text-homatri-dark">{stop.address}</p>
      <p className="text-xs text-homatri-muted">{remainingStops} stop{remainingStops === 1 ? "" : "s"} remaining after this gate</p>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={mapsUrl(stop)}
          target="_blank"
          rel="noreferrer"
          onClick={() => onNavigate?.(stop)}
          className="text-center bg-homatri-dark text-white rounded-xl py-3 text-sm font-semibold"
        >
          Open Google Maps
        </a>
        <a
          href={`tel:${stop.customerPhone || ""}`}
          onClick={() => onCallCustomer?.(stop)}
          className="text-center border border-homatri-border rounded-xl py-3 text-sm font-semibold"
        >
          Call customer
        </a>
      </div>
      <button
        type="button"
        disabled={isActionPending}
        onClick={() => run(() => onMarkDelivered(stop.orderId))}
        className="w-full bg-homatri-green text-white font-semibold py-3 rounded-xl"
      >
        Mark delivered
      </button>
      <button
        type="button"
        disabled={isActionPending}
        onClick={() => run(() => onReportAddressIssue(stop.orderId))}
        className="w-full text-sm font-medium text-homatri-muted"
      >
        Report address issue
      </button>
    </article>
  );
}
