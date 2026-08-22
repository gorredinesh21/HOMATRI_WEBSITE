"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, UserPlus, Volume2, VolumeX } from "lucide-react";

export default function VerticalReelPlayer({
  reel,
  onView,
  onLike,
  onComment,
  onFollow,
  onOrderDish,
  isActive,
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [hasRegisteredInitialView, setHasRegisteredInitialView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
      if (!hasRegisteredInitialView) {
        setHasRegisteredInitialView(true);
        onView?.(reel?.reelId);
      }
    } else {
      video.pause();
    }
  }, [isActive, hasRegisteredInitialView, onView, reel?.reelId]);

  if (!reel) return null;

  const progress = durationSeconds ? Math.min(100, (progressSeconds / durationSeconds) * 100) : 0;

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        className="absolute inset-0 h-full w-full object-cover"
        onTimeUpdate={(event) => setProgressSeconds(event.currentTarget.currentTime || 0)}
        onLoadedMetadata={(event) => setDurationSeconds(event.currentTarget.duration || 0)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full bg-homatri-orange" style={{ width: `${progress}%` }} />
      </div>

      <button
        type="button"
        onClick={() => setIsMuted((value) => !value)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 text-white">
        <button type="button" onClick={() => onLike?.(reel.reelId)} className="flex flex-col items-center gap-1">
          <span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
            <Heart className={`w-5 h-5 ${reel.isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </span>
          <span className="text-[11px] font-semibold">{reel.likeCount ?? 0}</span>
        </button>
        <button type="button" onClick={() => onComment?.(reel.reelId)} className="flex flex-col items-center gap-1">
          <span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-semibold">Comment</span>
        </button>
        <button type="button" onClick={() => onFollow?.(reel.chefId)} className="flex flex-col items-center gap-1">
          <span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-semibold">{reel.isFollowed ? "Following" : "Follow"}</span>
        </button>
      </div>

      <div className="absolute left-4 right-20 bottom-8 text-white space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{reel.kitchenName}</p>
        <h3 className="font-display text-xl font-medium leading-tight">{reel.chefName}</h3>
        {reel.dishName ? (
          <p className="text-sm text-white/90">
            {reel.dishName}
            {reel.dishPrice != null ? ` · ₹${reel.dishPrice}` : ""}
          </p>
        ) : null}
        {reel.dishName ? (
          <button
            type="button"
            onClick={() => onOrderDish?.(reel.reelId)}
            className="bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold text-sm px-4 py-2.5 rounded-xl"
          >
            Order {reel.dishName}{reel.dishPrice != null ? ` - ₹${reel.dishPrice}` : ""}
          </button>
        ) : null}
      </div>
    </div>
  );
}
