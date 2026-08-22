"use client";

import { useCallback, useEffect, useState } from "react";
import CutoffControlPanel from "../_components/CutoffControlPanel";
import { adminApi } from "@/lib/adminApi";
import { todayIso, windowLabel } from "@/lib/adminNormalize";
import { getActiveMealWindow } from "@/lib/mealWindow";

export default function AdminCutoffPage() {
  const info = getActiveMealWindow();
  const [serviceDate] = useState(todayIso());
  const [windows, setWindows] = useState(null);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setWindows(await adminApi.windows(serviceDate));
    } catch (err) {
      setError(err.message);
    }
  }, [serviceDate]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl font-medium">Cutoff & route allocator</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <CutoffControlPanel
        mealWindow={info.mealWindow}
        cutoffTime={info.cutoffTime}
        serverNow={new Date().toLocaleString()}
        isBatchRunning={running}
        canRunManualBatch
        lunchStatus={windowLabel(windows, "LUNCH")}
        dinnerStatus={windowLabel(windows, "DINNER")}
        onRunBatchNow={async () => {
          setRunning(true);
          setError(null);
          try {
            const payload = await adminApi.lockWindow(info.mealWindow, serviceDate);
            setResult(payload);
            await load();
          } catch (err) {
            setError(err.message);
            throw err;
          } finally {
            setRunning(false);
          }
        }}
      />
      {result ? (
        <pre className="text-xs bg-white border rounded-2xl p-4 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </div>
  );
}
