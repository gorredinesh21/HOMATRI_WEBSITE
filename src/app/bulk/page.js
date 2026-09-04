"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/app/(public)/_components/Navbar";
import Footer from "@/app/(public)/_components/Footer";
import { checkoutBulkOrder, fetchBulkTemplates } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BulkCateringPage() {
  const { token, customerPhone, requireAuthentication } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [templateId, setTemplateId] = useState(null);
  const [guestCount, setGuestCount] = useState(30);
  const [removed, setRemoved] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("13:00");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const rows = await fetchBulkTemplates();
      const list = Array.isArray(rows) ? rows : rows?.templates || [];
      setTemplates(list);
      setTemplateId(list[0]?.template_id || null);
    } catch (err) {
      setTemplates([]);
      setTemplateId(null);
      setLoadError(err?.message || "Could not load catering templates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const template = templates.find((t) => t.template_id === templateId) || null;
  const platePrice = useMemo(() => {
    if (!template) return 0;
    const deduction = (template.items || []).reduce((sum, item) => {
      if (removed.includes(item.item_id) && item.is_removable) return sum + Number(item.deduction_value);
      return sum;
    }, 0);
    return Math.max(1, Number(template.base_plate_price) - deduction);
  }, [template, removed]);
  const total = platePrice * guestCount;

  const toggleItem = (item) => {
    if (!item.is_removable) return;
    setRemoved((prev) => prev.includes(item.item_id) ? prev.filter((id) => id !== item.item_id) : [...prev, item.item_id]);
  };

  const checkout = () => {
    if (!template) {
      setError("Pick a thali template first.");
      return;
    }
    if (!eventDate) {
      setError("Pick an event date first.");
      return;
    }
    requireAuthentication(async () => {
      if (!customerPhone) {
        setError("Sign in with your phone number to request a quote.");
        return;
      }
      setError("");
      setMessage("");
      try {
        const result = await checkoutBulkOrder({
          customer_phone: customerPhone,
          event_date: eventDate,
          event_time: `${eventTime}:00`,
          guest_count: guestCount,
          template_id: template.template_id,
          removed_item_ids: removed,
          special_event_note: note,
        }, token);
        setMessage(`Request sent. Per plate ₹${result.per_plate_price}, total ₹${result.total_amount}.`);
      } catch (err) {
        setError(err.message || "Checkout failed.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-homatri-cream">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-homatri-orange">Bulk & event catering</p>
        <h1 className="font-display italic text-4xl mt-2">Home kitchens, feast-scale</h1>
        <p className="text-homatri-muted mt-3 max-w-2xl">Pick a thali template, uncheck items you don&apos;t need, and watch the per-plate price recalculate instantly.</p>

        <section className="mt-8 grid md:grid-cols-3 gap-4">
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="rounded-3xl border border-homatri-border bg-white p-5 h-28 animate-pulse" />
            ))
          ) : loadError ? (
            <div className="md:col-span-3 rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-red-600">{loadError}</p>
              <button
                type="button"
                onClick={loadTemplates}
                className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Try again
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="md:col-span-3 rounded-3xl border border-dashed border-homatri-border bg-white p-8 text-center">
              <p className="text-sm font-bold text-homatri-dark">No catering templates available right now.</p>
              <p className="text-xs text-homatri-muted mt-1">Our kitchens are preparing feast menus — please check back soon.</p>
            </div>
          ) : (
            templates.map((item) => (
              <button key={item.template_id} type="button" onClick={() => { setTemplateId(item.template_id); setRemoved([]); }} className={`text-left rounded-3xl border p-5 ${templateId === item.template_id ? "border-homatri-orange bg-white shadow-sm" : "border-homatri-border bg-white"}`}>
                <p className="font-semibold">{item.template_name}</p>
                <p className="text-2xl font-bold text-homatri-orange mt-2">₹{item.base_plate_price}</p>
                <p className="text-xs text-homatri-muted mt-1">Min {item.min_guests} guests</p>
              </button>
            ))
          )}
        </section>

        <section className="mt-8 bg-white border border-homatri-border rounded-3xl p-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div>
            <label className="text-sm font-semibold">Guest count ({guestCount})</label>
            <input type="range" min={10} max={80} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full mt-3" />
            <div className="mt-6 space-y-3">
              {template ? (template.items || []).map((item) => {
                const checked = !removed.includes(item.item_id);
                return (
                  <label key={item.item_id} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${item.is_removable ? "cursor-pointer" : "opacity-80"}`}>
                    <span>
                      <input type="checkbox" className="mr-3" checked={checked} disabled={!item.is_removable} onChange={() => toggleItem(item)} />
                      {item.item_name}
                    </span>
                    <span className="text-sm text-homatri-muted">{item.is_removable ? `-₹${item.deduction_value}` : "Included"}</span>
                  </label>
                );
              }) : (
                <p className="text-sm text-homatri-muted py-6 text-center">
                  {isLoading ? "Loading templates…" : "Select an available template above to customize your thali."}
                </p>
              )}
            </div>
          </div>
          <div className="bg-homatri-cream rounded-3xl p-5 space-y-4">
            <p className="text-sm text-homatri-muted">Per plate</p>
            <p className="text-4xl font-bold text-homatri-orange">{template ? `₹${platePrice}` : "—"}</p>
            <p className="text-sm">Total for {guestCount} guests: <strong>{template ? `₹${total.toLocaleString("en-IN")}` : "—"}</strong></p>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm" />
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hometown notes — e.g. Telangana-style pappu" className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm" rows={3} />
            <button type="button" onClick={checkout} disabled={!template} className="w-full bg-homatri-orange text-white font-bold rounded-xl py-3 disabled:opacity-50">Request catering quote</button>
            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
