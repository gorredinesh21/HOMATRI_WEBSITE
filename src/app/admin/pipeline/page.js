"use client";

import { useCallback, useEffect, useState } from "react";
import PipelineCounters from "../_components/PipelineCounters";
import KitchenCapacityBars from "../_components/KitchenCapacityBars";
import { adminApi } from "@/lib/adminApi";
import { fallbackPipeline, normalizePipeline, todayIso } from "@/lib/adminNormalize";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminPipelinePage() {
  const { localSession } = useAdminAuth();
  const [serviceDate] = useState(todayIso());
  const [pipeline, setPipeline] = useState(fallbackPipeline());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setPipeline(normalizePipeline(await adminApi.pipeline(serviceDate)));
    } catch (err) {
      if (localSession) {
        setPipeline(fallbackPipeline());
        setError("Live pipeline API needs a production admin session. Showing the local desk snapshot.");
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }, [serviceDate, localSession]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">Pipeline detail</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <PipelineCounters
        counts={pipeline.counts}
        serviceDate={pipeline.serviceDate}
        isRefreshing={busy}
        onRefresh={load}
      />
      <section className="bg-white border rounded-3xl p-5">
        <h2 className="font-display text-xl font-medium mb-4">Kitchen utilization</h2>
        <KitchenCapacityBars kitchens={pipeline.kitchens} />
      </section>
    </div>
  );
}
