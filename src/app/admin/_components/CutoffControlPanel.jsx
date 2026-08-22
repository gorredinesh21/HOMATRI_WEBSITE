"use client";

import { useState } from "react";

export default function CutoffControlPanel({
  mealWindow,
  cutoffTime,
  serverNow,
  isBatchRunning,
  canRunManualBatch,
  onRunBatchNow,
  lunchStatus,
  dinnerStatus,
}) {
  const [confirmManualRunOpen, setConfirmManualRunOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const run = async () => {
    setIsSubmitting(true);
    try {
      await onRunBatchNow?.();
      setConfirmManualRunOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-homatri-border rounded-3xl p-5 space-y-4">
      <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Cutoff engine</p>
      <h2 className="font-display text-2xl font-medium">
        {mealWindow} · {cutoffTime}
      </h2>
      <p className="text-sm text-homatri-muted">Server now {serverNow}</p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="border rounded-2xl p-3">
          <p className="text-xs text-homatri-muted">Lunch 11:30 AM</p>
          <p className="font-medium">{lunchStatus || "OPEN"}</p>
        </div>
        <div className="border rounded-2xl p-3">
          <p className="text-xs text-homatri-muted">Dinner 6:30 PM</p>
          <p className="font-medium">{dinnerStatus || "OPEN"}</p>
        </div>
      </div>
      {!confirmManualRunOpen ? (
        <button
          type="button"
          disabled={!canRunManualBatch || isBatchRunning}
          onClick={() => setConfirmManualRunOpen(true)}
          className="w-full bg-homatri-dark text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {isBatchRunning ? "Batch running…" : "Run cutoff batch & route allocation now"}
        </button>
      ) : (
        <div className="bg-homatri-orange-light rounded-2xl p-4 space-y-3">
          <p className="text-sm">
            This locks the {mealWindow} window, batches CONFIRMED orders, calls Google Maps route optimization, and
            assigns 1 chef : 1 driver.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={run}
              className="flex-1 bg-homatri-orange text-white font-semibold py-2.5 rounded-xl"
            >
              {isSubmitting ? "Running…" : "Confirm run"}
            </button>
            <button type="button" onClick={() => setConfirmManualRunOpen(false)} className="flex-1 border rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
