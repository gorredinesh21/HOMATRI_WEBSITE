"use client";

import ReelUploader from "../_components/ReelUploader";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefStudioPage() {
  const { menuItems, reels, addReel } = useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Content studio</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Cooking vlogs</h1>
      </header>
      <ReelUploader menuItems={menuItems} onPublished={addReel} />
      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Engagement</h2>
        {reels.map((reel) => (
          <article key={reel.reelId} className="bg-white border border-homatri-border rounded-2xl p-4">
            <p className="font-medium text-sm text-homatri-dark">{reel.caption || "Untitled reel"}</p>
            <p className="text-xs text-homatri-muted mt-1">
              {reel.likeCount} likes · {reel.viewCount} views · {reel.commentCount || 0} comments
              {reel.pendingSync ? " · waiting for upload API" : ""}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
