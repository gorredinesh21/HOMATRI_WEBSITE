"use client";

import PhoneOtpModal from "@/app/order/_components/PhoneOtpModal";
import CartBubble from "@/components/CartBubble";

export default function GlobalOverlays() {
  return (
    <>
      <PhoneOtpModal />
      <CartBubble />
    </>
  );
}
