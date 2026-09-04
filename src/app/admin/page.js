"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PipelineCounters from "./_components/PipelineCounters";
import KitchenCapacityBars from "./_components/KitchenCapacityBars";
import CutoffControlPanel from "./_components/CutoffControlPanel";
import { adminApi } from "@/lib/adminApi";
import { fallbackPipeline, normalizePipeline, todayIso, windowLabel } from "@/lib/adminNormalize";
import { getActiveMealWindow } from "@/lib/mealWindow";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminHomePage() {
  const { localSession } = useAdminAuth();
  const windowInfo = getActiveMealWindow();
  const [serviceDate] = useState(todayIso());
  // Start EMPTY (never mock data) — the live poll fills it; failures show an
  // error instead of silently leaving demo numbers on screen.
  const [pipeline, setPipeline] = useState({ counts: {}, serviceDate: null, kitchens: [] });
  const [windows, setWindows] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [pipe, wins] = await Promise.all([
        adminApi.pipeline(serviceDate),
        adminApi.windows(serviceDate).catch(() => null),
      ]);
      setPipeline(normalizePipeline(pipe));
      setWindows(wins);
    } catch (err) {
      // Cloud Run scales to zero — one retry covers the cold start.
      try {
        await new Promise((r) => setTimeout(r, 3000));
        const pipe = await adminApi.pipeline(serviceDate);
        setPipeline(normalizePipeline(pipe));
        setWindows(null);
      } catch (retryErr) {
        if (localSession) {
          setPipeline(fallbackPipeline());
          setError("⚠ LOCAL DESK MOCK DATA — live pipeline needs a production admin session.");
        } else {
          setError(retryErr.message || err.message);
        }
      }
    } finally {
      setBusy(false);
    }
  }, [serviceDate, localSession]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Operations control tower</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Live order pipeline</h1>
      </header>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <PipelineCounters
        counts={pipeline.counts}
        serviceDate={pipeline.serviceDate || serviceDate}
        isRefreshing={busy}
        onRefresh={load}
      />
      <section className="bg-white border border-homatri-border rounded-3xl p-5">
        <h2 className="font-display text-xl font-medium mb-4">Active kitchen capacity</h2>
        <KitchenCapacityBars kitchens={pipeline.kitchens} />
      </section>
      <CutoffControlPanel
        mealWindow={windowInfo.mealWindow}
        cutoffTime={windowInfo.cutoffTime}
        serverNow={new Date().toLocaleString()}
        isBatchRunning={batchRunning}
        canRunManualBatch
        lunchStatus={windowLabel(windows, "LUNCH")}
        dinnerStatus={windowLabel(windows, "DINNER")}
        onRunBatchNow={async () => {
          setBatchRunning(true);
          try {
            await adminApi.lockWindow(windowInfo.mealWindow, serviceDate);
            await load();
          } catch (err) {
            setError(err.message);
            throw err;
          } finally {
            setBatchRunning(false);
          }
        }}
      />
      <Link href="/admin/pipeline" className="text-sm font-semibold text-homatri-orange">
        Open pipeline detail →
      </Link>
    </div>
  );
}
