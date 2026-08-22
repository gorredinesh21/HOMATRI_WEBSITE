"use client";

import { useState } from "react";

export default function EscalationCenter({ items = [], onResolve, isLoading }) {
  const [notes, setNotes] = useState({});
  const [replies, setReplies] = useState({});
  const [busyId, setBusyId] = useState(null);

  return (
    <div className="space-y-4">
      {isLoading ? <p className="text-sm text-homatri-muted">Loading HITL queue…</p> : null}
      {!items.length && !isLoading ? (
        <p className="text-sm text-homatri-muted">No escalations in this filter.</p>
      ) : null}
      {items.map((item) => {
        const id = item.session_id || item.id;
        return (
          <article key={id} className="bg-white border border-homatri-border rounded-3xl p-5 space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-homatri-orange">{item.status || "PENDING"}</p>
            <h3 className="font-display text-xl font-medium">{item.customer_phone || item.customer_name || id}</h3>
            <p className="text-sm text-homatri-muted">{item.reason || item.summary || item.issue || "Escalated to admin"}</p>
            {item.order_id ? <p className="text-xs">Order {item.order_id}</p> : null}
            <textarea
              value={notes[id] || ""}
              onChange={(event) => setNotes((prev) => ({ ...prev, [id]: event.target.value }))}
              placeholder="Admin notes (required)"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              rows={2}
            />
            <textarea
              value={replies[id] || ""}
              onChange={(event) => setReplies((prev) => ({ ...prev, [id]: event.target.value }))}
              placeholder="Custom WhatsApp reply to customer phone"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              rows={2}
            />
            <button
              type="button"
              disabled={busyId === id || !(notes[id] || "").trim()}
              onClick={async () => {
                setBusyId(id);
                try {
                  await onResolve?.(id, notes[id], replies[id]);
                } finally {
                  setBusyId(null);
                }
              }}
              className="bg-homatri-green text-white font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              Mark resolved
            </button>
          </article>
        );
      })}
    </div>
  );
}
