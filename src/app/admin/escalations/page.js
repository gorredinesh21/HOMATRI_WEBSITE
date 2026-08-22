"use client";

import { useCallback, useEffect, useState } from "react";
import EscalationCenter from "../_components/EscalationCenter";
import { adminApi } from "@/lib/adminApi";
import { normalizeCollection } from "@/lib/adminNormalize";

export default function AdminEscalationsPage() {
  const [status, setStatus] = useState("PENDING");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.escalations(status);
      setItems(normalizeCollection(data, ["escalations", "sessions"]));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-medium">Escalation HITL</h1>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border rounded-full px-3 py-1.5 text-sm"
        >
          <option value="PENDING">PENDING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </header>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <EscalationCenter
        items={items}
        isLoading={loading}
        onResolve={async (sessionId, notes, reply) => {
          await adminApi.resolveEscalation(sessionId, notes, reply);
          await load();
        }}
      />
    </div>
  );
}
