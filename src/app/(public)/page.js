"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import WhatsCooking from "./_components/WhatsCooking";
import CuisineRail from "./_components/CuisineRail";
import HometownBanner from "./_components/HometownBanner";
import ChefSection from "./_components/ChefSection";
import TrustPanel from "./_components/TrustPanel";
import ConversionBanner from "./_components/ConversionBanner";
import Testimonials from "./_components/Testimonials";
import AppBanner from "./_components/AppBanner";
import Footer from "./_components/Footer";
import CartDrawer from "@/app/order/_components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { fetchFeaturedReviews, fetchPublicChefs } from "@/lib/api";
import { isPhotoUrl, kitchenPhotos, regionLabel } from "@/lib/visuals";

export default function Home() {
  const { requireAuthentication } = useAuth();
  const { items, isOpen, closeCart, beginCheckout, deliveryFee, error } = useCart();
  const [kitchens, setKitchens] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("LUNCH");

  useEffect(() => {
    let cancelled = false;
    fetchPublicChefs()
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.chefs || response?.data || [];
        if (!cancelled) setKitchens(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setKitchens([]);
      });
    fetchFeaturedReviews(6)
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.reviews || [];
        if (!cancelled) setReviews(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Every dish currently on every live menu, carrying its kitchen.
  const dishes = useMemo(() => {
    const out = [];
    for (const kitchen of kitchens) {
      for (const item of kitchen.menuItems || []) {
        if (item.is_available === false || item.availability === "SOLD_OUT") continue;
        out.push({
          key: `${kitchen.chefId}-${item.menuItemId}`,
          item,
          kitchen,
        });
      }
    }
    return out;
  }, [kitchens]);

  // Circular cuisine rail entries — derived from live kitchen origins.
  const regions = useMemo(() => {
    const map = new Map();
    for (const kitchen of kitchens) {
      const value = kitchen.regionalIdentity || kitchen.hometownRegion;
      if (!value) continue;
      if (!map.has(value)) {
        map.set(value, {
          value,
          label: regionLabel(value),
          kitchenCount: 0,
          photo: kitchenPhotos(kitchen)[0] || null,
        });
      }
      map.get(value).kitchenCount += 1;
    }
    return [...map.values()];
  }, [kitchens]);

  const collagePhotos = useMemo(() => {
    const photos = kitchens.flatMap((kitchen) => kitchenPhotos(kitchen).slice(0, 2));
    return [...new Set(photos)].filter(isPhotoUrl);
  }, [kitchens]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhatsCooking dishes={dishes} activeTab={activeTab} onTabChange={setActiveTab} />
        <CuisineRail kitchens={kitchens} />
        <HometownBanner photos={collagePhotos} />
        <ChefSection kitchens={kitchens} />
        <TrustPanel kitchens={kitchens} />
        <ConversionBanner />
        <Testimonials reviews={reviews} />
        <AppBanner kitchens={kitchens} />
      </main>
      <Footer />
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        onCheckout={beginCheckout}
        onAuthenticate={() => requireAuthentication(() => beginCheckout())}
        deliveryFee={deliveryFee}
        canCheckout={items.length > 0}
        checkoutError={error}
      />
    </div>
  );
}
