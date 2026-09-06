"use client";

// Uber/Rapido-driver-style floating cart widget: a draggable circle that
// EXPANDS IN PLACE into a bill panel when tapped and collapses back when
// tapped again. No modal, no backdrop, no slide-in — the page behind stays
// fully interactive while the widget is open.

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, CreditCard, Crosshair, MapPin, Minus, Plus, ShoppingBag, Truck, Wallet, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { fetchSavedAddresses, saveCustomerAddress } from "@/lib/api";

const GMAPS_KEY = process.env.NEXT_PUBLIC_GMAPS_API_KEY || "";
const GHANSOLI = { lat: 19.1197, lng: 72.9982 };

function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (!GMAPS_KEY) return Promise.reject(new Error("Maps key missing"));
  if (!window.__gmapsPromise) {
    window.__gmapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}`;
      script.onload = () => resolve(window.google.maps);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return window.__gmapsPromise;
}

/* ---------------- Address popup with Google map ---------------- */

export function AddressPopup({ onClose, onSaved }) {
  const { token, customerPhone } = useAuth();
  const [saved, setSaved] = useState([]);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState({
    flatNo: "",
    street: "",
    landmark: "",
    phone: customerPhone || "",
  });
  const [pin, setPin] = useState(GHANSOLI);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState("");

  // "My location" — browser geolocation permission → pin jumps to the user.
  const moveToMyLocation = () => {
    if (!navigator.geolocation) {
      setMapError("This device can't share its location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPin(next);
        markerRef.current?.setPosition(next);
        mapObjRef.current?.setCenter(next);
        setLocating(false);
        // Best-effort street fill via Google's geocoder (fails silently).
        try {
          const maps = window.google?.maps;
          if (maps) {
            new maps.Geocoder().geocode({ location: next }, (results, status) => {
              if (status === "OK" && results?.[0]) {
                setForm((f) => (f.street ? f : { ...f, street: results[0].formatted_address }));
              }
            });
          }
        } catch {
          // non-fatal
        }
      },
      () => {
        setLocating(false);
        setMapError("Location permission denied — tap the map to pick manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  const [saving, setSaving] = useState(false);
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markerRef = useRef(null);

  const loadSaved = useCallback(async () => {
    if (!token) return;
    try {
      const rows = await fetchSavedAddresses(token);
      setSaved(Array.isArray(rows) ? rows : []);
    } catch {
      setSaved([]);
    }
  }, [token]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  useEffect(() => {
    if (!addingNew || !mapRef.current || mapObjRef.current) return;
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapRef.current) return;
        mapObjRef.current = new maps.Map(mapRef.current, {
          center: pin,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        markerRef.current = new maps.Marker({
          position: pin,
          map: mapObjRef.current,
          draggable: true,
        });
        mapObjRef.current.addListener("click", (event) => {
          const next = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          setPin(next);
          markerRef.current?.setPosition(next);
        });
        markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current.getPosition();
          setPin({ lat: pos.lat(), lng: pos.lng() });
        });
      })
      .catch((err) => setMapError(err?.message || "Map failed to load"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addingNew]);

  const save = async () => {
    if (!form.flatNo.trim() || !form.street.trim()) {
      setMapError("Flat no and street/address are required.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      setMapError("Enter a valid 10-digit phone number.");
      return;
    }
    setSaving(true);
    setMapError("");
    try {
      await saveCustomerAddress(
        {
          address_type: "HOME",
          flat_no: form.flatNo.trim(),
          street_address: form.street.trim(),
          landmark: form.landmark.trim() || null,
          phone: form.phone.replace(/\D/g, "").slice(-10),
          cluster: "Ghansoli",
          latitude: pin.lat,
          longitude: pin.lng,
          is_default: saved.length === 0,
        },
        token
      );
      await loadSaved();
      setAddingNew(false);
    } catch (err) {
      setMapError(err?.message || "Could not save the address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl max-h-[88dvh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-homatri-border shrink-0">
          <h3 className="font-display text-lg font-medium text-homatri-dark">Delivery location</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1">
            <X className="w-5 h-5 text-homatri-muted" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {saved.map((address) => (
            <button
              key={address.id}
              type="button"
              onClick={() => {
                onSaved(address);
                onClose();
              }}
              className="w-full text-left border border-homatri-border rounded-2xl p-3 hover:border-homatri-forest"
            >
              <p className="text-sm font-bold text-homatri-dark">
                {address.address_type || "HOME"} · {address.flat_no || address.flatNo || ""}
              </p>
              <p className="text-xs text-homatri-muted mt-0.5">
                {[address.street_address || address.streetAddress, address.landmark].filter(Boolean).join(", ")}
              </p>
              <p className="text-xs text-homatri-muted">📞 {address.phone}</p>
            </button>
          ))}

          {addingNew ? (
            <div className="space-y-3 border-t border-homatri-border pt-3">
              <div className="relative">
                <div ref={mapRef} className="w-full h-44 rounded-2xl border border-homatri-border bg-homatri-sand" />
                <button
                  type="button"
                  onClick={moveToMyLocation}
                  aria-label="Use my current location"
                  title="Use my current location"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white shadow-lg border border-homatri-border flex items-center justify-center hover:bg-homatri-cream"
                >
                  {locating ? (
                    <span className="block w-4 h-4 rounded-full border-2 border-homatri-forest border-t-transparent animate-spin" />
                  ) : (
                    <Crosshair className="w-5 h-5 text-homatri-forest" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-homatri-muted flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-homatri-forest" />
                Tap the map or drag the pin to your exact building.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="border border-homatri-border rounded-xl px-3 py-2 text-sm"
                  placeholder="Flat / doorno *"
                  value={form.flatNo}
                  onChange={(e) => setForm((f) => ({ ...f, flatNo: e.target.value }))}
                />
                <input
                  className="border border-homatri-border rounded-xl px-3 py-2 text-sm"
                  placeholder="Phone *"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <input
                className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
                placeholder="Street / society / sector *"
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              />
              <input
                className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
                placeholder="Landmark (optional)"
                value={form.landmark}
                onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
              />
              {mapError ? <p className="text-xs text-red-600 font-medium">{mapError}</p> : null}
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="w-full bg-homatri-forest hover:bg-homatri-forest-deep text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save address"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="w-full border border-dashed border-homatri-forest/40 text-homatri-forest text-sm font-bold py-3 rounded-2xl hover:bg-homatri-forest-mist"
            >
              + Add new address on map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Expanding cart panel (anchored to the bubble) ---------------- */

function CartPanel({ onCollapse }) {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    error,
    isSubmitting,
    paymentMethod,
    setPaymentMethod,
    beginCheckout,
    deliveryAddress: address,
    setDeliveryAddress: setAddress,
  } = useCart();
  const { requireAuthentication, token: authToken } = useAuth();
  const { activeCluster } = useLocation();
  const [addressOpen, setAddressOpen] = useState(false);

  // Address + payment happen after login — anonymous users are signed in
  // first and then dropped straight into the map picker.
  const openAddresses = () => {
    if (!authToken) {
      requireAuthentication(() => setAddressOpen(true));
      return;
    }
    setAddressOpen(true);
  };

  const fullAddress = address
    ? {
        id: address.id,
        fullAddress: [address.flat_no || address.flatNo, address.street_address || address.streetAddress, address.landmark]
          .filter(Boolean)
          .join(", "),
        phone: address.phone,
        latitude: address.latitude,
        longitude: address.longitude,
      }
    : null;

  const pay = () => {
    // Login (if needed) happens exactly here — never at Add.
    requireAuthentication(async () => {
      if (!fullAddress) {
        setAddressOpen(true);
        return;
      }
      await beginCheckout(fullAddress);
    });
  };

  return (
    <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[88dvh] shadow-2xl border border-homatri-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-homatri-border shrink-0">
        <div className="min-w-0">
          <p className="font-display text-lg font-medium text-homatri-dark truncate">Your order</p>
          <p className="text-[11px] text-homatri-muted truncate">{items[0]?.kitchenName || ""}</p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Close cart"
          className="p-1.5 rounded-full hover:bg-homatri-sand"
        >
          <X className="w-5 h-5 text-homatri-muted" />
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-4">
        {/* Items */}
        <ul className="divide-y divide-homatri-border/70">
          {items.map((line) => (
            <li key={line.menuItemId} className="py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-homatri-dark leading-snug">{line.itemName}</p>
                <p className="text-[11px] text-homatri-muted">
                  ₹{line.unitPriceDisplay} × {line.quantity}
                </p>
                {line.customNote ? (
                  <p className="text-[10px] text-homatri-orange">“{line.customNote}”</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  aria-label="Less"
                  onClick={() =>
                    line.quantity <= 1
                      ? removeItem(line.menuItemId)
                      : updateQuantity(line.menuItemId, line.quantity - 1)
                  }
                  className="w-7 h-7 rounded-lg border border-homatri-border flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="More"
                  onClick={() => updateQuantity(line.menuItemId, line.quantity + 1)}
                  className="w-7 h-7 rounded-lg border border-homatri-border flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="w-14 text-right text-sm font-bold text-homatri-dark shrink-0">
                ₹{Math.round(line.unitPriceDisplay * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        {/* Bill breakdown */}
        <div className="bg-homatri-cream rounded-2xl p-3.5 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-homatri-muted">Bill details</p>
          <div className="flex justify-between text-xs text-homatri-dark">
            <span>Items subtotal</span>
            <span className="font-semibold">₹{Math.round(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-homatri-dark">
            <span>Convenience fee</span>
            <span className="font-semibold">₹{items.length ? Math.round(deliveryFee) : 0}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-homatri-dark pt-1.5 border-t border-homatri-border">
            <span>To pay</span>
            <span>₹{Math.round(total)}</span>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-homatri-muted mb-1.5">Deliver to</p>
          {fullAddress ? (
            <button
              type="button"
              onClick={openAddresses}
              className="w-full text-left border border-homatri-border rounded-xl p-2.5 hover:border-homatri-forest"
            >
              <p className="text-xs font-bold text-homatri-dark line-clamp-1">{fullAddress.fullAddress}</p>
              <p className="text-[10px] text-homatri-muted">
                📞 {fullAddress.phone} · {activeCluster} · tap to change
              </p>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddresses}
              className="w-full border border-dashed border-homatri-forest/40 text-homatri-forest text-xs font-bold py-2.5 rounded-xl hover:bg-homatri-forest-mist inline-flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" /> Choose location on map
            </button>
          )}
        </div>

        {/* Payment */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-homatri-muted mb-1.5">Payment</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("RAZORPAY")}
              className={`border rounded-xl p-2 text-left ${
                paymentMethod === "RAZORPAY"
                  ? "border-homatri-orange bg-homatri-orange-light"
                  : "border-homatri-border"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-homatri-orange mb-0.5" />
              <p className="text-[11px] font-bold text-homatri-dark leading-tight">Pay online</p>
              <p className="text-[9px] text-homatri-muted leading-tight">UPI · cards</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("COD")}
              className={`border rounded-xl p-2 text-left ${
                paymentMethod === "COD" ? "border-homatri-forest bg-homatri-forest-mist" : "border-homatri-border"
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-homatri-forest mb-0.5" />
              <p className="text-[11px] font-bold text-homatri-dark leading-tight">Cash</p>
              <p className="text-[9px] text-homatri-muted leading-tight">Pay the rider</p>
            </button>
          </div>
        </div>

        {error ? <p className="text-[11px] text-red-600 font-medium">{error}</p> : null}
      </div>

      <div className="p-4 border-t border-homatri-border shrink-0 bg-white">
        <button
          type="button"
          onClick={pay}
          disabled={isSubmitting || !items.length}
          className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md disabled:opacity-50 uppercase tracking-wider inline-flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          {isSubmitting ? "Placing order…" : `Pay ₹${Math.round(total)}${paymentMethod === "COD" ? " on delivery" : ""}`}
        </button>
      </div>

      {addressOpen ? (
        <AddressPopup
          onClose={() => setAddressOpen(false)}
          onSaved={(addr) => setAddress(addr)}
        />
      ) : null}
    </div>
  );
}

/* ---------------- Draggable circle that expands in place ---------------- */

export default function CartBubble() {
  const { items, total } = useCart();
  const [expanded, setExpanded] = useState(false);
  const count = items.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);

  // Position on real mount viewport — never server-rendered (SSR has no
  // window, and hydration of a guessed position leaves the button stuck).
  const [pos, setPos] = useState(null);
  const dragState = useRef(null);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos(
      vw < 640
        ? { x: vw - 84, y: vh * 0.62 }
        : { x: vw - 100, y: 380 }
    );
  }, []);

  useEffect(() => {
    const open = () => setExpanded(true);
    window.addEventListener("homatri:open-cart", open);
    return () => window.removeEventListener("homatri:open-cart", open);
  }, []);

  const onPointerDown = (event) => {
    dragState.current = { startX: event.clientX, startY: event.clientY, origX: pos.x, origY: pos.y, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.moved = true;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  };
  const onPointerUp = () => {
    if (dragState.current && !dragState.current.moved) setExpanded((prev) => !prev);
    dragState.current = null;
  };

  if (!count || !pos) return null;

  return (
    <>
      {/* Full bill popup — bottom sheet on phones, centered on desktop.
          Opens on bubble tap; tap the bubble again or ✕ to close. */}
      {expanded ? (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <CartPanel onCollapse={() => setExpanded(false)} />
        </div>
      ) : null}

      {/* The circle itself — tap to expand/collapse, drag to move */}
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label={`${expanded ? "Collapse" : "Open"} cart with ${count} items`}
        aria-expanded={expanded}
        style={{ left: pos.x, top: pos.y }}
        className={`fixed z-[56] flex items-center gap-2 text-white rounded-full shadow-2xl border-2 border-white/60 touch-none select-none cursor-pointer transition-colors ${
          expanded ? "bg-homatri-forest pr-4 pl-3 py-2.5" : "bg-homatri-orange pl-3 pr-4 py-2.5"
        }`}
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ShoppingBag className="w-5 h-5" />
        )}
        <span className="text-sm font-black">{count}</span>
        <span className="text-xs font-bold opacity-90">· ₹{Math.round(total)}</span>
      </button>
    </>
  );
}
