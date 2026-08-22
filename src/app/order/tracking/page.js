"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchOrder, orderStreamUrl } from "@/lib/api";

const PIPELINE = ["PENDING_PAYMENT", "CONFIRMED", "BATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];

function parseSseChunk(buffer, onEvent) {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() || "";
  for (const block of parts) {
    let eventName = "message";
    const dataLines = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    try {
      onEvent(eventName, JSON.parse(dataLines.join("\n")));
    } catch {
      onEvent(eventName, { message: dataLines.join("\n") });
    }
  }
  return rest;
}

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { token, requireAuthentication, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("PENDING_PAYMENT");
  const [message, setMessage] = useState("Waiting for live updates…");
  const [rider, setRider] = useState(null);
  const [error, setError] = useState(null);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return undefined;
    if (!isAuthenticated) {
      requireAuthentication();
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const snapshot = await fetchOrder(orderId, token);
        if (cancelled) return;
        setOrder(snapshot);
        setStatus(snapshot?.order_status || snapshot?.status || "PENDING_PAYMENT");
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();

    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(orderStreamUrl(orderId), {
          headers: {
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error("Live tracking stream is unavailable.");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = parseSseChunk(buffer, (eventName, payload) => {
            const data = payload?.data || payload;
            if (eventName === "order_status_updated" || data?.current_status) {
              if (data.current_status) setStatus(data.current_status);
              setMessage(data.message || "Status updated.");
            }
            if (eventName === "rider_assigned") {
              setRider(data);
              setMessage(`Rider ${data.rider_name || ""} assigned.`);
            }
          });
        }
      } catch (err) {
        if (!cancelled && err.name !== "AbortError") {
          setError((prev) => prev || err.message);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [orderId, token, isAuthenticated, requireAuthentication]);

  const activeIndex = useMemo(() => {
    const index = PIPELINE.indexOf(status);
    return index === -1 ? 0 : index;
  }, [status]);

  return (
    <div className="min-h-screen bg-homatri-cream">
      <header className="bg-white border-b border-homatri-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/order" className="text-sm font-semibold text-homatri-orange">
            ← Back to kitchens
          </Link>
          <h1 className="font-display font-medium text-homatri-dark">Live tracking</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {!orderId ? (
          <p className="text-sm text-homatri-muted">
            No order selected. After Razorpay checkout you will land here with an <code>order_id</code>.
          </p>
        ) : null}

        <section className="bg-white rounded-3xl border border-homatri-border p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-homatri-orange">Pipeline</p>
          <div className="mt-4 flex items-center gap-1">
            {PIPELINE.map((step, index) => (
              <div key={step} className="flex-1">
                <div
                  className={`h-2 rounded-full ${index <= activeIndex ? "bg-homatri-green" : "bg-homatri-border"}`}
                />
                <p className="mt-2 text-[10px] font-semibold text-homatri-muted leading-tight">{step.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-homatri-dark">{message}</p>
          {status === "PAYMENT_FAILED" ? (
            <p className="mt-2 text-sm text-red-600">Payment failed. You can retry checkout from the cart.</p>
          ) : null}
        </section>

        <section className="bg-white rounded-3xl border border-homatri-border p-5 space-y-2">
          <h2 className="font-display font-medium text-homatri-dark">Order summary</h2>
          <p className="text-sm text-homatri-muted">Order ID: {orderId || "—"}</p>
          <p className="text-sm text-homatri-muted">Meal window: {order?.meal_window || "—"}</p>
          <p className="text-sm text-homatri-dark">
            Delivery address: {order?.delivery_address || "Saved after checkout on the server."}
          </p>
          {rider ? (
            <p className="text-sm">
              Rider {rider.rider_name} · {rider.vehicle_number} · ETA {rider.estimated_delivery_time}
            </p>
          ) : null}
          {error ? <p className="text-xs text-homatri-muted">{error}</p> : null}
        </section>

        <button
          type="button"
          onClick={() => setSupportOpen(true)}
          className="w-full bg-homatri-dark text-white font-bold py-3 rounded-xl"
        >
          Request admin support
        </button>

        {supportOpen ? (
          <div className="bg-homatri-orange-light border border-homatri-orange/20 rounded-2xl p-4 text-sm text-homatri-dark">
            A HITL escalation will be opened for this order. An operator can reply on WhatsApp and mark the issue resolved
            from the admin portal.
          </div>
        ) : null}
      </main>
    </div>
  );
}
