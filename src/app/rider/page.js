"use client";

import PickupConfirmation from "./_components/PickupConfirmation";
import LegNavigationCard from "./_components/LegNavigationCard";
import GateDeliveryCard from "./_components/GateDeliveryCard";
import { useRider } from "@/context/RiderContext";

export default function RiderPortalPage() {
  const {
    rider,
    kitchen,
    windowInfo,
    shiftStatus,
    machineState,
    pickupDone,
    currentGroup,
    remainingStops,
    tiffinCount,
    stops,
    helpNotice,
    lastGpsAt,
    toggleShift,
    confirmPickup,
    markDelivered,
    confirmAllAtGate,
    markUndelivered,
    reportKitchenDelay,
    reportAddressIssue,
  } = useRider();

  const onShift = shiftStatus === "ON_SHIFT";
  const nextStop = currentGroup[0] || null;
  const isGate = currentGroup.length > 1;

  return (
    <div className="px-4 py-5 space-y-4 pb-16">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display italic text-homatri-orange">Homatri Rider</p>
          <h1 className="font-display text-2xl font-medium text-homatri-dark">{rider.fullName}</h1>
          <p className="text-xs text-homatri-muted">{rider.vehicleNumber}</p>
        </div>
        <button
          type="button"
          onClick={toggleShift}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            onShift ? "bg-homatri-green text-white" : "bg-white border border-homatri-border"
          }`}
        >
          {onShift ? "On shift" : "Off shift"}
        </button>
      </header>

      <p className="text-[11px] uppercase tracking-widest text-homatri-muted">
        State · {machineState.replace(/_/g, " ")}
      </p>

      {onShift ? (
        <section className="bg-homatri-dark text-white rounded-3xl p-5">
          <p className="text-[11px] uppercase tracking-widest text-white/70">Active trip · 1 chef : 1 driver</p>
          <h2 className="font-display text-2xl font-medium mt-1">{kitchen.kitchenName}</h2>
          <p className="text-sm text-white/80 mt-1">
            {windowInfo.label} · {remainingStops} stops · {tiffinCount} tiffins
          </p>
          {lastGpsAt ? (
            <p className="text-[11px] text-white/60 mt-2">GPS ping {new Date(lastGpsAt).toLocaleTimeString()}</p>
          ) : (
            <p className="text-[11px] text-white/60 mt-2">GPS every 10s on /ws/v1/rider/location</p>
          )}
        </section>
      ) : (
        <section className="bg-white border border-homatri-border rounded-3xl p-5">
          <h2 className="font-display text-xl font-medium">Go on shift</h2>
          <p className="text-sm text-homatri-muted mt-2">
            After the {windowInfo.cutoffTime} cutoff, this kitchen batch is assigned to you. Pickup stays locked until
            you confirm at the homemaker.
          </p>
        </section>
      )}

      {helpNotice ? (
        <p className="text-sm bg-homatri-orange-light border border-homatri-orange/20 rounded-2xl px-4 py-3">
          {helpNotice}
        </p>
      ) : null}

      {onShift && !pickupDone ? (
        <PickupConfirmation
          kitchen={kitchen}
          mealWindow={windowInfo.mealWindow}
          onConfirm={confirmPickup}
        />
      ) : null}

      {onShift && pickupDone && machineState !== "BATCH_COMPLETED" ? (
        isGate ? (
          <GateDeliveryCard
            orders={currentGroup}
            onConfirmAll={confirmAllAtGate}
            onMarkUndelivered={markUndelivered}
          />
        ) : (
          <LegNavigationCard
            stop={nextStop}
            remainingStops={Math.max(0, remainingStops - 1)}
            onNavigate={() => {}}
            onCallCustomer={() => {}}
            onMarkDelivered={markDelivered}
            onReportAddressIssue={reportAddressIssue}
          />
        )
      ) : null}

      {machineState === "BATCH_COMPLETED" ? (
        <section className="bg-homatri-green-light border border-homatri-green/20 rounded-3xl p-5">
          <h2 className="font-display text-2xl font-medium text-homatri-dark">Batch complete</h2>
          <p className="text-sm mt-2">
            All assigned deliveries are closed. You can stay on shift for the next window or go off shift.
          </p>
        </section>
      ) : null}

      {onShift ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={reportKitchenDelay}
            className="bg-white border border-homatri-border rounded-xl py-3 text-xs font-semibold"
          >
            Report kitchen delay
          </button>
          <button
            type="button"
            onClick={reportAddressIssue}
            className="bg-white border border-homatri-border rounded-xl py-3 text-xs font-semibold"
          >
            Report address issue
          </button>
        </div>
      ) : null}

      {onShift ? (
        <p className="text-[11px] text-homatri-muted">
          Full route stays in PostgreSQL after Google Maps cutoff allocation. This screen never lists future stops:{" "}
          {stops.filter((s) => s.status !== "PENDING").length} closed / {stops.length} assigned.
        </p>
      ) : null}
    </div>
  );
}
