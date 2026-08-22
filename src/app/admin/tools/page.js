"use client";

import DevOpsTools from "../_components/DevOpsTools";
import { adminApi } from "@/lib/adminApi";

export default function AdminToolsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">System tools</h1>
      <p className="text-sm text-homatri-muted">These hit the live Cloud SQL production database. Use with care.</p>
      <DevOpsTools onSeed={() => adminApi.seed()} onWipe={() => adminApi.wipe()} />
    </div>
  );
}
