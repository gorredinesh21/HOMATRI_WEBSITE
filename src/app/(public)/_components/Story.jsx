"use client";

import { Home, Utensils, HeartHandshake } from "lucide-react";

export default function Story() {
  return (
    <section id="story" className="py-20 bg-white border-y border-homatri-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual Illustration Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-homatri-orange-light p-8 border border-homatri-orange/20 shadow-sm">
              <div className="space-y-6">
                
                {/* Story Quote Card */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-homatri-border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🍛</span>
                    <div>
                      <h4 className="text-xs font-bold text-homatri-orange uppercase tracking-wider">
                        Regional Nostalgia
                      </h4>
                      <p className="font-display text-sm font-medium italic text-homatri-dark">
                        "Craving authentic Gongura Pappu from Telangana..."
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-homatri-muted leading-relaxed italic">
                    "After moving to Navi Mumbai for work, commercial restaurant food left me sick of excess oil. Finding a verified homemaker's kitchen nearby felt like eating at my own mother's house."
                  </p>
                </div>

                {/* Regional Homemaker Card */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-homatri-border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">👩‍🍳</span>
                    <div>
                      <h4 className="text-xs font-bold text-homatri-green uppercase tracking-wider">
                        Homemaker Heritage
                      </h4>
                      <p className="font-display text-sm font-medium italic text-homatri-dark">
                        Authentic Regional Homemakers
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-homatri-muted leading-relaxed">
                    Homemakers from your native hometown cooking traditional, healthy recipes handed down through generations.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-homatri-orange-light text-homatri-orange px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Home className="w-3.5 h-3.5" />
              <span>A Home Away From Home</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-medium text-homatri-dark leading-snug">
              Authentic Regional Home Food, <br />
              <span className="text-homatri-orange">Cooked Just Like Mom Made.</span>
            </h2>

            <p className="text-homatri-muted text-base leading-relaxed font-normal">
              When you move to a new city for work or study, finding food that actually feels like home is almost impossible. Commercial restaurants load dishes with heavy spices and commercial oils.
            </p>

            <p className="text-homatri-muted text-base leading-relaxed font-normal">
              On <strong>Homaatri</strong>, you discover verified homemakers living right in your neighborhood who hail from your exact native hometown—whether it’s <strong>Telangana, Andhra, Konkan, Punjab, Kerala, or Gujarat</strong>. They cook authentic, healthy meals using fresh ingredients, low oil, and traditional recipes filled with maternal warmth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-homatri-orange-light rounded-xl text-homatri-orange shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-homatri-dark">Authentic Hometown Taste</h4>
                  <p className="text-xs text-homatri-muted leading-relaxed">Native recipes crafted by homemakers from your home state.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-homatri-green-light rounded-xl text-homatri-green shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-homatri-dark">Healthy Daily Meals</h4>
                  <p className="text-xs text-homatri-muted leading-relaxed">Clean ingredients, minimal oil, perfect for daily lunch & dinner.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
