"use client";

import { MessageSquareQuote, Star } from "lucide-react";

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Rendered only when real delivered-order reviews exist (is_public on the
// backend). No placeholder testimonials — the section hides itself otherwise.
export default function Testimonials({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section id="testimonials" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-homatri-forest">
            Social proof
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-homatri-dark">
            What Our Customers Say
          </h2>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <figure
              key={review.reviewId || review.text}
              className="bg-homatri-cream border border-homatri-border rounded-3xl p-6 flex flex-col"
            >
              <MessageSquareQuote className="w-6 h-6 text-homatri-forest/50" />
              <blockquote className="mt-3 text-sm text-homatri-dark leading-relaxed flex-1">
                “{review.text}”
              </blockquote>
              <div className="mt-4 flex items-center gap-1" aria-label={`${review.rating} star rating`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-3.5 h-3.5 ${
                      index < Number(review.rating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-homatri-border"
                    }`}
                  />
                ))}
              </div>
              <figcaption className="mt-3 flex items-center gap-3 border-t border-homatri-border pt-4">
                <span className="w-9 h-9 rounded-full bg-homatri-forest text-white text-xs font-bold inline-flex items-center justify-center">
                  {initials(review.customerName)}
                </span>
                <span>
                  <span className="block text-sm font-bold text-homatri-dark">{review.customerName}</span>
                  <span className="block text-[11px] text-homatri-muted">
                    ordered from {review.kitchenName}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
