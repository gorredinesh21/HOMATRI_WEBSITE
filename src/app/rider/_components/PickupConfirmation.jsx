"use client";

export default function PickupConfirmation({ kitchen, mealWindow, onConfirm, disabled }) {
  if (!kitchen) return null;

  const maps = `https://www.google.com/maps/dir/?api=1&destination=${kitchen.latitude},${kitchen.longitude}&travelmode=driving`;

  return (
    <section className="bg-white border border-homatri-border rounded-3xl p-5 space-y-4">
      <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Kitchen pickup</p>
      <h2 className="font-display text-2xl font-medium text-homatri-dark">{kitchen.kitchenName}</h2>
      <p className="text-sm text-homatri-muted">
        {kitchen.chefName} · {kitchen.address}
      </p>
      <p className="text-sm">1 chef : 1 driver for {mealWindow}</p>
      <a
        href={maps}
        target="_blank"
        rel="noreferrer"
        className="block text-center border border-homatri-border rounded-xl py-2.5 text-sm font-semibold"
      >
        Navigate to kitchen
      </a>
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="w-full bg-homatri-orange text-white font-semibold py-3 rounded-xl disabled:opacity-50"
      >
        Confirm kitchen pickup
      </button>
    </section>
  );
}
