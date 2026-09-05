"use client";

import { Bell, MapPinned, MessageCircle, Repeat2 } from "lucide-react";
import { WHATSAPP_ORDER_URL } from "@/lib/visuals";

const APP_POINTS = [
  { icon: MapPinned, title: "Saved addresses", body: "Flat, office, mom's place — one tap to switch." },
  { icon: Bell, title: "Live rider tracking", body: "Watch your tiffin move from stove to door." },
  { icon: Repeat2, title: "One-tap reorder", body: "Your usual thali, again, in three seconds." },
];

export default function AppBanner({ photos }) {
  return (
    <section className="bg-homatri-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
              Homatri in your pocket
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
              Order Faster From the App
            </h2>
            <p className="mt-4 text-sm sm:text-base text-homatri-muted leading-relaxed">
              The website will always feed you. The app just makes the regulars faster — same
              kitchens, same ₹11 fee, less tapping.
            </p>

            <ul className="mt-7 space-y-4">
              {APP_POINTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-homatri-forest-mist text-homatri-forest">
                    <Icon className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-homatri-dark">{title}</h4>
                    <p className="text-xs text-homatri-muted leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP_ORDER_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-homatri-forest hover:bg-homatri-forest-deep text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Get the app link on WhatsApp
            </a>
          </div>

          {photos.length > 0 ? (
            <div className="flex justify-center lg:justify-end gap-4" aria-hidden="true">
              <div className="w-40 sm:w-48 rotate-[4deg] rounded-[2rem] border-[6px] border-homatri-dark/90 bg-homatri-dark shadow-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[0]} alt="" className="w-full h-72 sm:h-84 object-cover" loading="lazy" />
                <p className="px-3 py-2.5 text-[10px] font-semibold text-white/80">
                  Live from Homatri kitchens
                </p>
              </div>
              {photos[1] ? (
                <div className="hidden sm:block w-40 sm:w-48 -rotate-[4deg] mt-8 rounded-[2rem] border-[6px] border-white bg-white shadow-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[1]} alt="" className="w-full h-72 sm:h-84 object-cover" loading="lazy" />
                  <p className="px-3 py-2.5 text-[10px] font-semibold text-homatri-dark/70">
                    Fresh from the stove
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
