"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DualTabHeader from "./_components/DualTabHeader";
import ServingFilterBar from "./_components/ServingFilterBar";
import SwipeCardDeck from "./_components/SwipeCardDeck";
import ExpandedHingeProfile from "./_components/ExpandedHingeProfile";
import CartDrawer from "./_components/CartDrawer";
import CommentSheet from "./_components/CommentSheet";
import ReelFeed from "./_components/ReelFeed";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import {
  KITCHENS,
  filterKitchens,
  findMenuItem,
  getCommunityReels,
  getKitchenById,
} from "@/lib/catalog";
import { fetchPublicChefs, fetchPublicReels } from "@/lib/api";

export default function OrderPortalPage() {
  const searchParams = useSearchParams();
  const { locationLabel, setCluster, activeCluster } = useLocation();
  const { isAuthenticated, requireAuthentication, setIsAuthModalOpen, customerPhone } = useAuth();
  const { items, addItem, openCart, closeCart, isOpen, beginCheckout, deliveryFee, error, mealWindow } = useCart();

  const [activeTab, setActiveTab] = useState("KITCHENS");
  const [kitchens, setKitchens] = useState(KITCHENS);
  const [reels, setReels] = useState(getCommunityReels());
  const [activeIndex, setActiveIndex] = useState(0);
  const [openChefId, setOpenChefId] = useState(null);
  const [currentlyServing, setCurrentlyServing] = useState(false);
  const [mealFilter, setMealFilter] = useState("ALL");
  const [dietary, setDietary] = useState("All");
  const [cuisine, setCuisine] = useState(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentReelId, setCommentReelId] = useState(null);

  useEffect(() => {
    const location = searchParams.get("location");
    if (location) setCluster(location);
  }, [searchParams, setCluster]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchPublicChefs();
        const list = Array.isArray(remote) ? remote : remote?.chefs || remote?.data;
        if (!cancelled && Array.isArray(list) && list.length) {
          setKitchens(list);
        }
      } catch {
        if (!cancelled) setKitchens(KITCHENS);
      }
      try {
        const remoteReels = await fetchPublicReels();
        const list = Array.isArray(remoteReels) ? remoteReels : remoteReels?.reels || remoteReels?.data;
        if (!cancelled && Array.isArray(list) && list.length) {
          setReels(list);
        }
      } catch {
        if (!cancelled) setReels(getCommunityReels());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      filterKitchens(kitchens, {
        currentlyServing,
        mealWindow: mealFilter === "ALL" ? null : mealFilter,
        dietary,
        cuisine,
      }),
    [kitchens, currentlyServing, mealFilter, dietary, cuisine]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [currentlyServing, mealFilter, dietary, cuisine, activeCluster]);

  const selectedChef = openChefId
    ? getKitchenById(openChefId) || kitchens.find((kitchen) => kitchen.chefId === openChefId)
    : null;

  const guard = useCallback(
    (action) => {
      requireAuthentication(action);
    },
    [requireAuthentication]
  );

  const handleOrderItem = useCallback(
    (menuItemId, quantity, note, extras) => {
      const resolved = extras?.item && extras?.chef
        ? { item: extras.item, kitchen: extras.chef }
        : findMenuItem(menuItemId);
      if (!resolved?.item) return;

      const run = () => {
        const windowForItem = extras?.mealWindow || mealWindow || (mealFilter === "DINNER" ? "DINNER" : "LUNCH");
        addItem({
          menuItemId: resolved.item.menuItemId,
          chefId: resolved.kitchen.chefId,
          itemName: resolved.item.itemName,
          quantity,
          mealWindow: windowForItem,
          unitPriceDisplay: resolved.item.price,
          lineTotalDisplay: resolved.item.price * quantity,
          customNote: note,
        });
      };
      guard(run);
    },
    [addItem, guard, mealFilter, mealWindow]
  );

  const handleOrderDishFromReel = useCallback(
    (reelId) => {
      const reel = reels.find((entry) => entry.reelId === reelId);
      if (!reel) return;
      const resolved = reel.featuredMenuItemId
        ? findMenuItem(reel.featuredMenuItemId)
        : { item: { menuItemId: reel.reelId, itemName: reel.dishName, price: reel.dishPrice }, kitchen: { chefId: reel.chefId } };
      if (!resolved?.item) return;
      guard(() => {
        addItem({
          menuItemId: resolved.item.menuItemId,
          chefId: resolved.kitchen.chefId || reel.chefId,
          itemName: resolved.item.itemName || reel.dishName,
          quantity: 1,
          mealWindow: mealWindow || "LUNCH",
          unitPriceDisplay: resolved.item.price || reel.dishPrice || 0,
          lineTotalDisplay: resolved.item.price || reel.dishPrice || 0,
        });
      });
    },
    [addItem, guard, mealWindow, reels]
  );

  const onNext = () => setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
  const onPrevious = () => setActiveIndex((index) => Math.max(0, index - 1));

  return (
    <div className="min-h-screen bg-homatri-cream">
      <DualTabHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={openCart}
        locationLabel={locationLabel}
        isAuthenticated={isAuthenticated}
        onAuthClick={() => {
          if (!isAuthenticated) setIsAuthModalOpen(true);
        }}
      />

      {activeTab === "KITCHENS" ? (
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <ServingFilterBar
            currentlyServing={currentlyServing}
            onCurrentlyServingChange={setCurrentlyServing}
            mealWindow={mealFilter}
            onMealWindowChange={setMealFilter}
            dietary={dietary}
            onDietaryChange={setDietary}
            cuisine={cuisine}
            onCuisineChange={setCuisine}
          />
          <SwipeCardDeck
            kitchens={filtered}
            activeIndex={Math.min(activeIndex, Math.max(0, filtered.length - 1))}
            onCardOpen={setOpenChefId}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        </main>
      ) : (
        <ReelFeed
          reels={reels}
          activeIndex={activeReelIndex}
          onActiveChange={setActiveReelIndex}
          onLike={(reelId) =>
            guard(() => {
              setReels((prev) =>
                prev.map((entry) =>
                  entry.reelId === reelId
                    ? { ...entry, isLiked: true, likeCount: (entry.likeCount || 0) + 1 }
                    : entry
                )
              );
            })
          }
          onComment={(reelId) =>
            guard(() => {
              setCommentReelId(reelId);
              setCommentOpen(true);
            })
          }
          onFollow={() => guard(() => {})}
          onOrderDish={handleOrderDishFromReel}
        />
      )}

      {selectedChef ? (
        <ExpandedHingeProfile
          chef={selectedChef}
          onClose={() => setOpenChefId(null)}
          onOrderItem={handleOrderItem}
          onFollow={() => guard(() => {})}
        />
      ) : null}

      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        onCheckout={beginCheckout}
        onAuthenticate={() => requireAuthentication(() => beginCheckout())}
        deliveryFee={deliveryFee}
        canCheckout={items.length > 0}
        checkoutError={error}
      />
      <CommentSheet
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        reelId={commentReelId}
        onSubmit={() => setCommentOpen(false)}
      />
      {isAuthenticated && customerPhone ? (
        <p className="sr-only">Signed in as {customerPhone}</p>
      ) : null}
    </div>
  );
}
