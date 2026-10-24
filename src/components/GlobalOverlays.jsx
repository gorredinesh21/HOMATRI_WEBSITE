"use client";

import { usePathname } from "next/navigation";
import PhoneOtpModal from "@/app/order/_components/PhoneOtpModal";
import CartBubble from "@/components/CartBubble";
import LocationBubble from "@/components/LocationBubble";

export default function GlobalOverlays() {
  const pathname = usePathname();
  // Customer floating widgets (cart / location) have no place over the
  // chef, rider and admin dashboards — they overlap dashboard cards there.
  const isBackoffice = /^\/(chef|rider|admin)(\/|$)/.test(pathname || "");
  return (
    <>
      <PhoneOtpModal />
      {isBackoffice ? null : (
        <>
          <CartBubble />
          <LocationBubble />
        </>
      )}
    </>
  );
}
