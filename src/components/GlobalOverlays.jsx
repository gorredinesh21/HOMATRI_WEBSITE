"use client";

import PhoneOtpModal from "@/app/order/_components/PhoneOtpModal";
import CartBubble from "@/components/CartBubble";
import LocationBubble from "@/components/LocationBubble";

export default function GlobalOverlays() {
  return (
    <>
      <PhoneOtpModal />
      <CartBubble />
      <LocationBubble />
    </>
  );
}
