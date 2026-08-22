"use client";

export default function KitchenCapacityBars({ kitchens = [] }) {
  if (!kitchens.length) {
    return <p className="text-sm text-homatri-muted">No kitchen capacity rows on this service date.</p>;
  }
  return (
    <div className="space-y-3">
      {kitchens.map((kitchen) => {
        const pct = kitchen.cap ? Math.min(100, Math.round((kitchen.used / kitchen.cap) * 100)) : 0;
        return (
          <div key={kitchen.name}>
            <div className="flex justify-between text-sm mb-1">
              <span>{kitchen.name}</span>
              <span className="text-homatri-muted">
                {kitchen.used}/{kitchen.cap}
              </span>
            </div>
            <div className="h-2 bg-homatri-border rounded-full overflow-hidden">
              <div className="h-full bg-homatri-orange" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
