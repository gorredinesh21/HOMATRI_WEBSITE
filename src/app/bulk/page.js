"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/(public)/_components/Navbar";
import Footer from "@/app/(public)/_components/Footer";
import { checkoutBulkOrder, fetchBulkTemplates } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const FALLBACK = [
  {
    template_id: "standard",
    template_name: "Standard Thali",
    base_plate_price: 149,
    min_guests: 10,
    items: [
      { item_id: "std-roti", item_name: "Roti / Phulka (4 pcs)", deduction_value: 25, is_removable: false },
      { item_id: "std-rice", item_name: "Steamed Rice", deduction_value: 25, is_removable: true },
      { item_id: "std-sabzi", item_name: "Dry Sabzi", deduction_value: 30, is_removable: true },
      { item_id: "std-dal", item_name: "Dal Tadka", deduction_value: 25, is_removable: true },
      { item_id: "std-sweet", item_name: "Sweet", deduction_value: 20, is_removable: true },
    ],
  },
  {
    template_id: "deluxe",
    template_name: "Deluxe Thali",
    base_plate_price: 199,
    min_guests: 10,
    items: [
      { item_id: "dlx-roti", item_name: "Roti / Phulka (4 pcs)", deduction_value: 30, is_removable: false },
      { item_id: "dlx-rice", item_name: "Jeera Rice", deduction_value: 30, is_removable: true },
      { item_id: "dlx-sabzi", item_name: "Dry Sabzi (Chef's Choice)", deduction_value: 35, is_removable: true },
      { item_id: "dlx-dal", item_name: "Dal (Tadka / Fry)", deduction_value: 30, is_removable: true },
      { item_id: "dlx-protein", item_name: "Protein Sabzi (Paneer/Soya)", deduction_value: 45, is_removable: true },
      { item_id: "dlx-sweet", item_name: "Sweet (Gulab Jamun / Kheer)", deduction_value: 29, is_removable: true },
    ],
  },
  {
    template_id: "feast",
    template_name: "Grand Feast Thali",
    base_plate_price: 299,
    min_guests: 10,
    items: [
      { item_id: "fst-roti", item_name: "Roti + Puris", deduction_value: 40, is_removable: false },
      { item_id: "fst-rice", item_name: "Pulao / Jeera Rice", deduction_value: 40, is_removable: true },
      { item_id: "fst-sabzi", item_name: "Two Seasonal Sabzis", deduction_value: 50, is_removable: true },
      { item_id: "fst-dal", item_name: "Dal Fry / Kadhi", deduction_value: 35, is_removable: true },
      { item_id: "fst-protein", item_name: "Paneer Special", deduction_value: 55, is_removable: true },
      { item_id: "fst-sweet", item_name: "Dessert Duo", deduction_value: 40, is_removable: true },
    ],
  },
];

export default function BulkCateringPage() {
  const { token, customerPhone, requireAuthentication } = useAuth();
  const [templates, setTemplates] = useState(FALLBACK);
  const [templateId, setTemplateId] = useState("deluxe");
  const [guestCount, setGuestCount] = useState(30);
  const [removed, setRemoved] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("13:00");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBulkTemplates().then((rows) => {
      if (Array.isArray(rows) && rows.length) {
        setTemplates(rows);
        setTemplateId(rows[1]?.template_id || rows[0].template_id);
      }
    }).catch(() => {});
  }, []);

  const template = templates.find((t) => t.template_id === templateId) || templates[0];
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
    if (!eventDate) {
      setError("Pick an event date first.");
      return;
    }
    requireAuthentication(async () => {
      setError("");
      setMessage("");
      try {
        const result = await checkoutBulkOrder({
          customer_phone: customerPhone || "9999999999",
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
          {templates.map((item) => (
            <button key={item.template_id} type="button" onClick={() => { setTemplateId(item.template_id); setRemoved([]); }} className={`text-left rounded-3xl border p-5 ${templateId === item.template_id ? "border-homatri-orange bg-white shadow-sm" : "border-homatri-border bg-white"}`}>
              <p className="font-semibold">{item.template_name}</p>
              <p className="text-2xl font-bold text-homatri-orange mt-2">₹{item.base_plate_price}</p>
              <p className="text-xs text-homatri-muted mt-1">Min {item.min_guests} guests</p>
            </button>
          ))}
        </section>

        <section className="mt-8 bg-white border border-homatri-border rounded-3xl p-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div>
            <label className="text-sm font-semibold">Guest count ({guestCount})</label>
            <input type="range" min={10} max={80} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full mt-3" />
            <div className="mt-6 space-y-3">
              {(template?.items || []).map((item) => {
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
              })}
            </div>
          </div>
          <div className="bg-homatri-cream rounded-3xl p-5 space-y-4">
            <p className="text-sm text-homatri-muted">Per plate</p>
            <p className="text-4xl font-bold text-homatri-orange">₹{platePrice}</p>
            <p className="text-sm">Total for {guestCount} guests: <strong>₹{total.toLocaleString("en-IN")}</strong></p>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm" />
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hometown notes — e.g. Telangana-style pappu" className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm" rows={3} />
            <button type="button" onClick={checkout} className="w-full bg-homatri-orange text-white font-bold rounded-xl py-3">Request catering quote</button>
            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
