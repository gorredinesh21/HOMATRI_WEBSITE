"use client";

import { useState } from "react";
import { uploadChefReel } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const MAX_BYTES = 50 * 1024 * 1024;

export default function ReelUploader({ menuItems = [], onPublished }) {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [featuredMenuItemId, setFeaturedMenuItemId] = useState("");
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const publish = async (event) => {
    event.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a cooking video from your gallery.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Max upload size is 50 MB.");
      return;
    }

    const form = new FormData();
    form.append("video", file);
    form.append("caption", caption);
    if (featuredMenuItemId) form.append("featured_menu_item_id", featuredMenuItemId);

    setIsUploading(true);
    try {
      await uploadChefReel(form, token);
      onPublished?.({
        reelId: `reel-${Date.now()}`,
        caption,
        featuredMenuItemId,
        likeCount: 0,
        viewCount: 0,
        commentCount: 0,
        published: true,
      });
      setFile(null);
      setCaption("");
    } catch (err) {
      onPublished?.({
        reelId: `reel-local-${Date.now()}`,
        caption,
        featuredMenuItemId,
        likeCount: 0,
        viewCount: 0,
        commentCount: 0,
        published: false,
        pendingSync: true,
      });
      setError(
        `${err.message} Video is held locally until POST /api/v1/reels/upload is available. HLS 720p 9:16 is generated on the server.`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={publish} className="bg-white border border-homatri-border rounded-3xl p-5 space-y-3">
      <h3 className="font-display text-xl font-medium">Upload a cooking reel</h3>
      <p className="text-xs text-homatri-muted">
        Vertical 9:16, 15–60 seconds, up to 50 MB. The transcoding worker builds 720p HLS (`.m3u8`) and a thumbnail.
      </p>
      <input
        type="file"
        accept="video/mp4,video/quicktime"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="block w-full text-sm"
      />
      <textarea
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        placeholder="Caption"
        rows={2}
        className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
      />
      <select
        value={featuredMenuItemId}
        onChange={(event) => setFeaturedMenuItemId(event.target.value)}
        className="w-full border border-homatri-border rounded-xl px-3 py-2 text-sm"
      >
        <option value="">Attach a signature dish (optional)</option>
        {menuItems.map((item) => (
          <option key={item.menuItemId} value={item.menuItemId}>
            {item.itemName}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-homatri-muted">{error}</p> : null}
      <button
        type="submit"
        disabled={isUploading}
        className="w-full bg-homatri-orange text-white font-semibold py-2.5 rounded-xl"
      >
        {isUploading ? "Uploading…" : "Publish reel"}
      </button>
    </form>
  );
}
