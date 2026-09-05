"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { WHATSAPP_ORDER_URL } from "@/lib/visuals";

const FOOTER_COLUMNS = [
  {
    heading: "Order",
    links: [
      { label: "Today's menus", href: "/order" },
      { label: "Find your cuisine", href: "/#cuisines" },
      { label: "Tiffin & bulk plans", href: "/bulk" },
      { label: "Track an order", href: "/order/tracking" },
    ],
  },
  {
    heading: "Homatri",
    links: [
      { label: "Our chefs", href: "/#chefs" },
      { label: "Trust & hygiene", href: "/#trust" },
      { label: "Customer stories", href: "/#testimonials" },
    ],
  },
  {
    heading: "Join us",
    links: [
      { label: "Cook with us — chefs", href: "/chef" },
      { label: "Ride with us — riders", href: "/rider" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-homatri-forest-deep text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm">
                <Image src="/logo.jpg" alt="Homatri logo" fill className="object-cover" />
              </div>
              <div>
                <span className="font-display italic font-medium text-2xl text-white block leading-none">
                  Homatri
                </span>
                <span className="text-[11px] text-white/60 block mt-1">Achha Khao. Ghar Ka Khao.</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              A managed home-food network around real homemakers. Verified kitchens, regional
              soul food, pooled delivery straight to your door.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/60">
              <MapPin className="w-3.5 h-3.5" /> Ghansoli, Navi Mumbai
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Homatri · FSSAI-registered home kitchens
          </p>
          <div className="flex items-center gap-4">
            <a
              href={WHATSAPP_ORDER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp us
            </a>
            <span className="inline-flex items-center gap-1 text-xs text-white/50">
              Made with <Heart className="w-3 h-3 fill-homatri-orange text-homatri-orange" /> in Navi Mumbai
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
