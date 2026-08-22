"use client";

import { useState } from "react";

export default function DietaryRequestCard({
  requestId,
  orderId,
  customerName,
  note,
  status,
  counterTurnCount,
  maxCounterTurns = 2,
  history = [],
  onAccept,
  onReject,
  onCounterOffer,
}) {
  const [counterText, setCounterText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCounter = counterTurnCount < maxCounterTurns && status !== "EXPIRED_DEFAULT";
  const closed = ["CHEF_ACCEPTED", "CUSTOMER_ACCEPTED", "EXPIRED_DEFAULT"].includes(status);

  const run = async (fn) => {
    setIsSubmitting(true);
    try {
      await fn();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="bg-white border border-homatri-border rounded-3xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-homatri-orange">{status.replace(/_/g, " ")}</p>
          <h3 className="font-display text-xl font-medium text-homatri-dark">{customerName}</h3>
          <p className="text-xs text-homatri-muted">Order {orderId} · turn {counterTurnCount}/{maxCounterTurns}</p>
        </div>
      </div>
      <p className="text-sm bg-homatri-cream rounded-2xl px-4 py-3">“{note}”</p>
      {history.map((entry, index) => (
        <p key={index} className="text-xs text-homatri-muted">
          Counter {index + 1}: {entry.message}
        </p>
      ))}

      {!closed ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => run(() => onAccept(requestId))}
            className="px-4 py-2 rounded-xl bg-homatri-green text-white text-sm font-semibold"
          >
            Accept
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => run(() => onReject(requestId))}
            className="px-4 py-2 rounded-xl border border-homatri-border text-sm font-semibold"
          >
            Reject
          </button>
        </div>
      ) : null}

      {canCounter && !closed ? (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!counterText.trim()) return;
            run(async () => {
              await onCounterOffer(requestId, counterText.trim());
              setCounterText("");
            });
          }}
        >
          <textarea
            value={counterText}
            onChange={(event) => setCounterText(event.target.value)}
            placeholder="Send a counter-offer (max 2 turns, enforced on the server)"
            rows={2}
            className="w-full text-sm border border-homatri-border rounded-xl px-3 py-2"
          />
          <button type="submit" disabled={isSubmitting} className="text-sm font-semibold text-homatri-orange">
            Send counter-offer
          </button>
        </form>
      ) : (
        <p className="text-[11px] text-homatri-muted">
          {status === "EXPIRED_DEFAULT"
            ? "Request closed. Default menu item applies."
            : !canCounter
              ? "Two-turn cap reached. Accept, reject, or wait for the customer."
              : null}
        </p>
      )}
    </article>
  );
}
