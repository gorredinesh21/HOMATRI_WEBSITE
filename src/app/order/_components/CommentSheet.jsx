"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function CommentSheet({ open, onClose, onSubmit, reelId }) {
  const [comment, setComment] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-homatri-dark/40">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-medium text-homatri-dark">Comments</h3>
          <button type="button" onClick={onClose} aria-label="Close comments">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!comment.trim()) return;
            onSubmit?.(reelId, comment.trim());
            setComment("");
          }}
        >
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write a comment…"
            rows={3}
            className="w-full border border-homatri-border rounded-2xl px-3 py-2 text-sm"
          />
          <button type="submit" className="w-full bg-homatri-orange text-white font-bold py-2.5 rounded-xl">
            Post comment
          </button>
        </form>
      </div>
    </div>
  );
}
