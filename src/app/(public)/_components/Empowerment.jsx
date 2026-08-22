"use client";

import { Award, Users, Heart, ShieldCheck } from "lucide-react";

export default function Empowerment() {
  return (
    <section className="py-20 bg-homatri-cream border-b border-homatri-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-homatri-orange border border-homatri-orange/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
            <Award className="w-3.5 h-3.5" />
            <span>The Homemaker Movement</span>
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-homatri-dark leading-snug">
            Empowering Homemakers. <br />
            <span className="text-homatri-orange">Your Kitchen, Your Business.</span>
          </h2>

          <p className="mt-4 text-base text-homatri-muted leading-relaxed font-normal">
            Every dish on Homaatri tells a story of passion, pride, and financial independence. We provide the business engine so homemakers can shine.
          </p>
        </div>

        {/* 3 Empowerment Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-homatri-border shadow-xs hover:shadow transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-homatri-orange-light text-homatri-orange flex items-center justify-center font-bold mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-medium text-homatri-dark mb-2">
              Recognized Food Identity
            </h3>
            <p className="text-sm text-homatri-muted leading-relaxed font-normal">
              Homemakers aren't anonymous suppliers—they are celebrated local food brands with their own kitchen name, signature recipes, and customer followers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-homatri-border shadow-xs hover:shadow transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-homatri-green-light text-homatri-green flex items-center justify-center font-bold mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-medium text-homatri-dark mb-2">
              Zero Operational Friction
            </h3>
            <p className="text-sm text-homatri-muted leading-relaxed font-normal">
              Homaatri manages order batching, payment gateway integration, packaging standards, and doorstep delivery so home chefs can focus 100% on cooking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-homatri-border shadow-xs hover:shadow transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-homatri-orange-light text-homatri-orange flex items-center justify-center font-bold mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-medium text-homatri-dark mb-2">
              Pride & Financial Independence
            </h3>
            <p className="text-sm text-homatri-muted leading-relaxed font-normal">
              Enabling talented homemakers to build a sustainable, dignified home business and earn an independent income doing what they love most.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
