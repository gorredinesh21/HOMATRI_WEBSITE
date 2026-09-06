"use client";

// Standalone floating location button (independent of the cart): always
// visible, draggable, tap → login-gated address/map picker. The chosen
// address lands in the shared cart context so checkout uses it.

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { AddressPopup } from "@/components/CartBubble";

export default function LocationBubble() {
  const { requireAuthentication, token } = useAuth();
  const { setDeliveryAddress } = useCart();
  const [open, setOpen] = useState(false);

  // Position on real mount viewport — never server-rendered (SSR has no
  // window, and hydration of a guessed position leaves the button stuck).
  const [pos, setPos] = useState(null);
  const dragState = useRef(null);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos(
      vw < 640
        ? { x: vw - 76, y: vh * 0.55 }
        : { x: vw - 100, y: 320 }
    );
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
    if (dragState.current && !dragState.current.moved) {
      // Address flow is login-gated, same as inside the cart widget.
      if (!token) {
        requireAuthentication(() => setOpen(true));
      } else {
        setOpen(true);
      }
    }
    dragState.current = null;
  };

  if (!pos) return null;

  return (
    <>
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Set your delivery location"
        style={{ left: pos.x, top: pos.y }}
        className="fixed z-[56] w-12 h-12 rounded-full bg-white text-homatri-forest shadow-2xl border-2 border-homatri-forest/30 flex items-center justify-center touch-none select-none cursor-pointer hover:bg-homatri-forest-mist"
      >
        <MapPin className="w-5 h-5" />
      </button>

      {open ? (
        <AddressPopup onClose={() => setOpen(false)} onSaved={setDeliveryAddress} />
      ) : null}
    </>
  );
}
