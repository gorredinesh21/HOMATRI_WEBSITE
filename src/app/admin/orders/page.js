"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

const STATUS_STYLES = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  BATCHED: "bg-indigo-100 text-indigo-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};
const PAYMENT_STYLES = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  COD_PENDING: "bg-blue-100 text-blue-800",
  REFUNDED: "bg-gray-200 text-gray-700",
};

const STATUS_FILTERS = ["ALL", "CONFIRMED", "PENDING_PAYMENT", "DELIVERED", "CANCELLED"];
const PAGE_SIZE = 20;

function money(n) {
  return `₹${Number(n ?? 0).toLocaleString("en-IN")}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.orders({
        status_filter: statusFilter === "ALL" ? null : statusFilter,
        q: search || null,
        service_date_from: dateFrom || null,
        service_date_to: dateTo || null,
        limit: PAGE_SIZE,
        offset,
      });
      setOrders(res?.orders ?? []);
      setTotal(res?.total ?? 0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, dateFrom, dateTo, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === "PAID");
    const cancelled = orders.filter((o) => o.status === "CANCELLED");
    const revenue = paid
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    return { paid: paid.length, cancelled: cancelled.length, revenue };
  }, [orders]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl font-medium">Order history</h1>
        <p className="text-xs text-homatri-muted">
          {total} order{total === 1 ? "" : "s"} total · page {page} of {pages}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setOffset(0);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                statusFilter === s ? "bg-homatri-orange text-white" : "bg-homatri-orange-light text-homatri-dark"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <form
            className="flex items-center gap-2 border rounded-xl px-3 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput.trim());
              setOffset(0);
            }}
          >
            <Search className="w-4 h-4 text-homatri-muted" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Phone, kitchen or order id"
              className="w-52 outline-none text-sm"
            />
          </form>
          <label className="flex items-center gap-1.5 text-xs text-homatri-muted">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setOffset(0);
              }}
              className="border rounded-lg px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-homatri-muted">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setOffset(0);
              }}
              className="border rounded-lg px-2 py-1"
            />
          </label>
        </div>
      </div>

      {/* Quick stats for current page */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white border rounded-2xl p-3">
          <p className="text-xl font-semibold">{stats.paid}</p>
          <p className="text-[11px] text-homatri-muted">paid on this page</p>
        </div>
        <div className="bg-white border rounded-2xl p-3">
          <p className="text-xl font-semibold text-red-600">{stats.cancelled}</p>
          <p className="text-[11px] text-homatri-muted">cancelled on this page</p>
        </div>
        <div className="bg-white border rounded-2xl p-3">
          <p className="text-xl font-semibold text-homatri-forest">{money(stats.revenue)}</p>
          <p className="text-[11px] text-homatri-muted">paid & not cancelled</p>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-homatri-muted">Loading…</p> : null}

      {/* Orders list */}
      <div className="space-y-2">
        {orders.map((o) => {
          const open = expanded === o.order_id;
          return (
            <article key={o.order_id} className="bg-white border rounded-2xl overflow-hidden">
              <button
                type="button"
                className="w-full text-left p-4 flex items-center gap-3 hover:bg-homatri-orange-light/40"
                onClick={() => setExpanded(open ? null : o.order_id)}
              >
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {o.kitchen_name} · {o.items?.map((i) => `${i.quantity}× ${i.dish_name}`).join(", ") || "—"}
                  </p>
                  <p className="text-xs text-homatri-muted truncate">
                    {o.customer_name || "Unknown"} · {o.customer_phone} · {o.meal_window} ·{" "}
                    {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLES[o.status] || "bg-gray-100"}`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${PAYMENT_STYLES[o.payment_status] || "bg-gray-100"}`}>
                    {o.payment_status.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-semibold">{money(o.total_amount)}</span>
                </div>
              </button>

              {open ? (
                <div className="border-t px-4 py-3 grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-homatri-muted uppercase">Items</p>
                    {o.items?.map((i, idx) => (
                      <p key={idx} className="flex justify-between">
                        <span>
                          {i.quantity}× {i.dish_name}
                        </span>
                        <span>{money(i.item_subtotal)}</span>
                      </p>
                    ))}
                    <p className="flex justify-between text-xs text-homatri-muted">
                      <span>Subtotal / delivery</span>
                      <span>
                        {money(o.cart_subtotal)} / {money(o.delivery_fee)}
                      </span>
                    </p>
                    <p className="flex justify-between font-semibold">
                      <span>Total ({o.payment_method})</span>
                      <span>{money(o.total_amount)}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-homatri-muted uppercase">Delivery & payment</p>
                    <p className="text-xs">{o.delivery_address || "No address on order"}</p>
                    {o.special_instructions ? (
                      <p className="text-xs">📝 {o.special_instructions}</p>
                    ) : null}
                    {o.cancellation_reason ? (
                      <p className="text-xs text-red-600">Cancelled: {o.cancellation_reason}</p>
                    ) : null}
                    {o.payments?.map((p, idx) => (
                      <p key={idx} className="text-xs text-homatri-muted">
                        {p.gateway} {p.payment_type}: {p.status}
                        {p.gateway_payment_id ? ` (${p.gateway_payment_id})` : ""}
                        {p.paid_at ? ` · paid ${new Date(p.paid_at).toLocaleString("en-IN")}` : ""}
                      </p>
                    ))}
                    <p className="text-[11px] text-homatri-muted">Order id {o.order_id}</p>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
        {!loading && orders.length === 0 ? (
          <p className="text-sm text-homatri-muted">No orders match these filters.</p>
        ) : null}
      </div>

      {/* Pagination */}
      {pages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={offset === 0}
            className="border rounded-xl px-3 py-1.5 text-sm disabled:opacity-40"
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-homatri-muted">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={offset + PAGE_SIZE >= total}
            className="border rounded-xl px-3 py-1.5 text-sm disabled:opacity-40"
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
