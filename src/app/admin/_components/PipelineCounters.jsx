"use client";

import { useEffect, useState } from "react";

const STAGES = ["DRAFT", "PENDING_PAYMENT", "CONFIRMED", "BATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];
const EXTRA = ["CANCELLED", "PAYMENT_FAILED"];

export default function PipelineCounters({ counts = {}, serviceDate, isRefreshing, onRefresh }) {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    setLastUpdatedAt(new Date().toISOString());
  }, [counts, serviceDate]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Live pipeline</p>
          <h2 className="font-display text-2xl font-medium">Service date {serviceDate}</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs font-semibold border border-homatri-border rounded-full px-3 py-1.5 bg-white"
        >
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STAGES.map((stage) => (
          <article key={stage} className="bg-white border border-homatri-border rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-widest text-homatri-muted">{stage.replace(/_/g, " ")}</p>
            <p className="font-display text-3xl font-medium mt-1">{counts[stage] ?? 0}</p>
          </article>
        ))}
      </div>
      <div className="flex gap-3 text-xs text-homatri-muted">
        {EXTRA.map((stage) => (
          <span key={stage}>
            {stage.replace(/_/g, " ")}: {counts[stage] ?? 0}
          </span>
        ))}
      </div>
      {lastUpdatedAt ? (
        <p className="text-[11px] text-homatri-muted">Updated {new Date(lastUpdatedAt).toLocaleTimeString()}</p>
      ) : null}
    </section>
  );
}
