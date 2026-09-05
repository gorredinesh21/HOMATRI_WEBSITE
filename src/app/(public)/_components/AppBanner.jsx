"use client";

import { Bell, MapPinned, MessageCircle, Repeat2, Star } from "lucide-react";
import { kitchenPhotos, WHATSAPP_ORDER_URL } from "@/lib/visuals";

const APP_POINTS = [
  { icon: MapPinned, title: "Saved addresses", body: "Flat, office, mom's place — one tap to switch." },
  { icon: Bell, title: "Live rider tracking", body: "Watch your tiffin move from stove to door." },
  { icon: Repeat2, title: "One-tap reorder", body: "Your usual thali, again, in three seconds." },
];

export default function AppBanner({ kitchens }) {
  const chefs = kitchens.slice(0, 4);
  const foodPhoto = (() => {
    for (const kitchen of kitchens) {
      const photo = kitchenPhotos(kitchen).find((url) => url !== kitchenPhotos(kitchen)[0]);
      if (photo) return photo;
    }
    return null;
  })();

  return (
    <section className="bg-homatri-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
              Homatri in your pocket
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
              All Our Chefs. One App.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-homatri-muted leading-relaxed">
              The website will always feed you. The app just makes the regulars faster — same
              kitchens, same cooks, less tapping.
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

          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-3" aria-label="Chefs on Homatri">
            <div className="flex gap-4 w-max">
              {chefs.map((kitchen, index) => {
                const photo = kitchenPhotos(kitchen)[0];
                return (
                  <div
                    key={kitchen.chefId}
                    className={`w-40 sm:w-44 shrink-0 rounded-[1.6rem] border-[5px] ${
                      index % 2 === 0 ? "border-homatri-dark/90 bg-homatri-dark" : "border-white bg-white"
                    } shadow-xl overflow-hidden ${index % 2 === 0 ? "rotate-[3deg]" : "-rotate-[3deg]"} ${index > 0 ? "mt-6" : ""}`}
                  >
                    <div className="relative h-44 sm:h-48 bg-homatri-sand">
                      {photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photo}
                          alt={`${kitchen.chefName} of ${kitchen.kitchenName}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className={`px-3 py-2.5 ${index % 2 === 0 ? "text-white" : "text-homatri-dark"}`}>
                      <p className="text-xs font-bold leading-tight">{kitchen.chefName.split(" ")[0]}</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${index % 2 === 0 ? "text-white/70" : "text-homatri-muted"}`}>
                        {kitchen.kitchenName}
                      </p>
                      <p className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold ${index % 2 === 0 ? "text-white/90" : "text-homatri-dark"}`}>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(kitchen.rating || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {foodPhoto ? (
                <div className="w-40 sm:w-44 shrink-0 rounded-[1.6rem] border-[5px] border-homatri-forest bg-homatri-forest shadow-xl overflow-hidden rotate-[2deg] mt-3">
                  <div className="h-44 sm:h-48 bg-homatri-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foodPhoto} alt="Fresh from a Homatri kitchen" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="px-3 py-2.5 text-[10px] font-semibold text-white/80">
                    Live from Homatri kitchens
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
