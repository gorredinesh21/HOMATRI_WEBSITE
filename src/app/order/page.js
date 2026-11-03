"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import DualTabHeader from "./_components/DualTabHeader";
import ServingFilterBar from "./_components/ServingFilterBar";
import SwipeCardDeck from "./_components/SwipeCardDeck";
import ExpandedHingeProfile from "./_components/ExpandedHingeProfile";
import CommentSheet from "./_components/CommentSheet";
import ReelFeed from "./_components/ReelFeed";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import LocationGate from "@/components/LocationGate";
import { filterKitchens } from "@/lib/catalog";
import { API_BASE_URL, fetchPublicChefs, fetchPublicReels, likeReel } from "@/lib/api";

function toMediaUrl(url) {
  return url && url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}

function normalizeReel(raw) {
  const videoUrl = raw.video_url ?? raw.videoUrl ?? "";
  const thumbnailUrl = raw.thumbnail_url ?? raw.thumbnailUrl ?? videoUrl;
  return {
    reelId: raw.reel_id ?? raw.reelId,
    chefId: raw.chef_phone ?? raw.chefId ?? raw.chef_id,
    chefName: raw.chef_name ?? raw.chefName,
    kitchenName: raw.kitchen_name ?? raw.kitchenName,
    caption: raw.caption ?? raw.title ?? "",
    videoUrl: toMediaUrl(videoUrl),
    thumbnailUrl: toMediaUrl(thumbnailUrl),
    likeCount: raw.likes_count ?? raw.likeCount ?? 0,
    commentCount: raw.comments_count ?? raw.commentCount ?? 0,
    isLiked: Boolean(raw.is_liked ?? raw.isLiked),
    dishName: raw.dish_tag_name ?? raw.dishName ?? raw.dish_name ?? null,
    dishPrice: raw.dish_tag_price ?? raw.dishPrice ?? raw.dish_price ?? null,
    featuredMenuItemId: raw.featured_menu_item_id ?? raw.featuredMenuItemId ?? null,
  };
}

export default function OrderPortalPage() {
  const searchParams = useSearchParams();
  const {
    locationLabel,
    setCluster,
    activeCluster,
    latitude,
    longitude,
    hasCoords,
    hydrated,
    clearLocation,
  } = useLocation();
  const { isAuthenticated, requireAuthentication, setIsAuthModalOpen, customerPhone, token } = useAuth();
  const { items, addItem, mealWindow } = useCart();

  const [activeTab, setActiveTab] = useState("KITCHENS");
  const [gateOpen, setGateOpen] = useState(false);
  const [kitchens, setKitchens] = useState([]);
  const [kitchensStatus, setKitchensStatus] = useState("LOADING");
  const [kitchensError, setKitchensError] = useState("");
  const [reels, setReels] = useState([]);
  const [reelsStatus, setReelsStatus] = useState("LOADING");
  const [reelsError, setReelsError] = useState("");
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
    const cuisineParam = searchParams.get("cuisine");
    if (cuisineParam) setCuisine(cuisineParam);
  }, [searchParams, setCluster]);

  const loadKitchens = useCallback(async () => {
    setKitchensStatus("LOADING");
    setKitchensError("");
    try {
      const remote = await fetchPublicChefs(
        hasCoords ? { latitude, longitude } : {}
      );
      const list = Array.isArray(remote) ? remote : remote?.chefs || remote?.data;
      setKitchens(Array.isArray(list) ? list : []);
      setKitchensStatus("READY");
    } catch (err) {
      setKitchens([]);
      setKitchensError(err?.message || "Could not load kitchens.");
      setKitchensStatus("ERROR");
    }
  }, [hasCoords, latitude, longitude]);

  const loadReels = useCallback(async () => {
    setReelsStatus("LOADING");
    setReelsError("");
    try {
      const remoteReels = await fetchPublicReels();
      const list = Array.isArray(remoteReels) ? remoteReels : remoteReels?.reels || remoteReels?.data;
      setReels(Array.isArray(list) ? list.map(normalizeReel) : []);
      setReelsStatus("READY");
    } catch (err) {
      setReels([]);
      setReelsError(err?.message || "Could not load reels.");
      setReelsStatus("ERROR");
    }
  }, []);

  useEffect(() => {
    // Wait for the saved delivery pin before fetching — kitchens are
    // filtered server-side by 5 km around it.
    if (hydrated && hasCoords) loadKitchens();
    loadReels();
  }, [hydrated, hasCoords, loadKitchens, loadReels]);

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

  const regionOptions = useMemo(
    () => [...new Set(kitchens.map((k) => k.regionalIdentity || k.hometownRegion).filter(Boolean))],
    [kitchens]
  );

  const selectedChef = openChefId
    ? kitchens.find((kitchen) => kitchen.chefId === openChefId || kitchen.chef_phone === openChefId)
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
        : (() => {
            for (const kitchen of kitchens) {
              const all = [...(kitchen.lunchMenu || []), ...(kitchen.dinnerMenu || []), ...(kitchen.menuItems || [])];
              const item = all.find((i) => i.menuItemId === menuItemId || i.menu_item_id === menuItemId);
              if (item) return { item, kitchen };
            }
            return null;
          })();
      if (!resolved?.item) return;

      // Two-click flow: no login at Add — the cart popup asks at Pay.
      const windowForItem = extras?.mealWindow || mealWindow || (mealFilter === "DINNER" ? "DINNER" : "LUNCH");
      addItem({
        menuItemId: resolved.item.menuItemId,
        chefId: resolved.kitchen.chefId,
        itemName: resolved.item.itemName,
        quantity,
        mealWindow: windowForItem,
        unitPriceDisplay: resolved.item.price,
        lineTotalDisplay: resolved.item.price * quantity,
        kitchenName: resolved.kitchen.kitchenName,
        customNote: note,
        comboId: extras?.combo?.comboId || null,
        comboName: extras?.combo?.name || null,
        comboDiscount: extras?.combo?.discount || 0,
      });
    },
    [addItem, mealWindow, mealFilter, kitchens]
  );

  const handleOrderDishFromReel = useCallback(
    (reelId) => {
      const reel = reels.find((entry) => entry.reelId === reelId);
      if (!reel) return;
      const resolved = reel.featuredMenuItemId
        ? (() => {
            for (const kitchen of kitchens) {
              const all = [...(kitchen.lunchMenu || []), ...(kitchen.dinnerMenu || []), ...(kitchen.menuItems || [])];
              const item = all.find((i) => i.menuItemId === reel.featuredMenuItemId);
              if (item) return { item, kitchen };
            }
            return null;
          })()
        : null;
      const item =
        resolved?.item ||
        (reel.dishName && reel.dishPrice != null
          ? { menuItemId: reel.reelId, itemName: reel.dishName, price: reel.dishPrice }
          : null);
      if (!item) return;
      // Two-click flow: reel orders also skip the login gate — Pay asks.
      addItem({
        menuItemId: item.menuItemId,
        chefId: resolved?.kitchen?.chefId || reel.chefId,
        itemName: item.itemName,
        quantity: 1,
        mealWindow: mealWindow || "LUNCH",
        unitPriceDisplay: item.price,
        lineTotalDisplay: item.price,
        kitchenName: reel.kitchenName,
      });
    },
    [addItem, mealWindow, reels, kitchens]
  );

  const onNext = () => setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
  const onPrevious = () => setActiveIndex((index) => Math.max(0, index - 1));

  const [followingMap, setFollowingMap] = useState({});

  const handleFollowChef = useCallback(
    (chefId) => {
      guard(() => {
        setFollowingMap((prev) => ({
          ...prev,
          [chefId]: !prev[chefId],
        }));
      });
    },
    [guard]
  );

  const handleLikeReel = useCallback(
    (reelId) => {
      guard(() => {
        setReels((prev) =>
          prev.map((entry) =>
            entry.reelId === reelId
              ? {
                  ...entry,
                  isLiked: !entry.isLiked,
                  likeCount: Math.max(0, (entry.likeCount || 0) + (entry.isLiked ? -1 : 1)),
                }
              : entry
          )
        );
        // Fire-and-forget: the backend like endpoint toggles and returns the
        // authoritative count, which we silently sync back to.
        likeReel(reelId, token)
          .then((result) => {
            if (result && typeof result.likes_count === "number") {
              setReels((prev) =>
                prev.map((entry) =>
                  entry.reelId === reelId
                    ? { ...entry, isLiked: Boolean(result.liked), likeCount: result.likes_count }
                    : entry
                )
              );
            }
          })
          .catch(() => {});
      });
    },
    [guard, token]
  );

  return (
    <div className="min-h-screen bg-homatri-cream">
      <DualTabHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => window.dispatchEvent(new Event("homatri:open-cart"))}
        locationLabel={locationLabel}
        isAuthenticated={isAuthenticated}
        onAuthClick={() => {
          if (!isAuthenticated) setIsAuthModalOpen(true);
        }}
      />

      {hydrated && (!hasCoords || gateOpen) ? (
        <LocationGate
          onDone={() => setGateOpen(false)}
        />
      ) : null}

      {activeTab === "KITCHENS" ? (
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-homatri-forest">
              <MapPin className="w-3.5 h-3.5" />
              Kitchens within 5 km of {locationLabel}
            </p>
            <button
              type="button"
              onClick={() => setGateOpen(true)}
              className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
            >
              Change location
            </button>
          </div>
          <ServingFilterBar
            currentlyServing={currentlyServing}
            onCurrentlyServingChange={setCurrentlyServing}
            mealWindow={mealFilter}
            onMealWindowChange={setMealFilter}
            dietary={dietary}
            onDietaryChange={setDietary}
            cuisine={cuisine}
            onCuisineChange={setCuisine}
            regions={regionOptions}
          />
          {kitchensStatus === "LOADING" ? (
            <div className="max-w-md mx-auto">
              <div className="h-[520px] rounded-3xl bg-white border border-homatri-border animate-pulse" />
            </div>
          ) : kitchensStatus === "ERROR" ? (
            <div className="rounded-3xl border border-dashed border-red-200 bg-white p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-red-600">{kitchensError}</p>
              <button
                type="button"
                onClick={loadKitchens}
                className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 && hasCoords ? (
            <div className="rounded-3xl border border-dashed border-homatri-border bg-white p-10 text-center space-y-3 max-w-md mx-auto">
              <MapPin className="w-8 h-8 mx-auto text-homatri-orange" />
              <p className="font-display text-xl text-homatri-dark">
                No kitchens within 5 km yet
              </p>
              <p className="text-sm text-homatri-muted leading-relaxed">
                We&apos;re adding new home kitchens every week. Try another location
                nearby, or tell us where you want us next.
              </p>
              <button
                type="button"
                onClick={() => setGateOpen(true)}
                className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Change location
              </button>
            </div>
          ) : (
            <SwipeCardDeck
              kitchens={filtered}
              activeIndex={Math.min(activeIndex, Math.max(0, filtered.length - 1))}
              onCardOpen={setOpenChefId}
              onNext={onNext}
              onPrevious={onPrevious}
              onOrderItem={handleOrderItem}
              cartItems={items}
            />
          )}
        </main>
      ) : reelsStatus === "LOADING" ? (
        <div className="h-[calc(100dvh-8.5rem)] flex items-center justify-center px-4">
          <div className="w-full max-w-sm aspect-[9/16] max-h-full rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      ) : reelsStatus === "ERROR" ? (
        <div className="h-[calc(100dvh-8.5rem)] flex items-center justify-center px-4">
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-10 text-center space-y-3 max-w-sm">
            <p className="text-sm font-semibold text-red-600">{reelsError}</p>
            <button
              type="button"
              onClick={loadReels}
              className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <ReelFeed
          reels={reels}
          activeIndex={activeReelIndex}
          onActiveChange={setActiveReelIndex}
          onLike={handleLikeReel}
          onComment={(reelId) =>
            guard(() => {
              setCommentReelId(reelId);
              setCommentOpen(true);
            })
          }
          onFollow={(chefId) => handleFollowChef(chefId || reels[activeReelIndex]?.chefId)}
          onOrderDish={handleOrderDishFromReel}
        />
      )}

      {selectedChef ? (
        <ExpandedHingeProfile
          chef={selectedChef}
          isFollowing={Boolean(followingMap[selectedChef.chefId])}
          onClose={() => setOpenChefId(null)}
          onOrderItem={handleOrderItem}
          onFollow={() => handleFollowChef(selectedChef.chefId)}
        />
      ) : null}

      <CommentSheet
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        reelId={commentReelId}
      />
      {isAuthenticated && customerPhone ? (
        <p className="sr-only">Signed in as {customerPhone}</p>
      ) : null}
    </div>
  );
}
