"use client";

import { useState } from "react";
import { X, Send, Heart } from "lucide-react";

export default function CommentSheet({ open, onClose, onSubmit, reelId }) {
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState([
    { id: "c1", user: "Priya Sharma", avatar: "👩‍💼", text: "The coastal curry looks amazing! Ordering for lunch today. 😋", time: "2h ago", likes: 12 },
    { id: "c2", user: "Rahul Verma", avatar: "🧑‍💻", text: "Zero preservatives and authentic Aagri spices. Best tiffin in Ghansoli! 🔥", time: "4h ago", likes: 8 },
  ]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `c_${Date.now()}`,
      user: "You (Customer)",
      avatar: "🍱",
      text: commentText.trim(),
      time: "Just now",
      likes: 0,
    };

    setCommentsList((prev) => [newComment, ...prev]);
    onSubmit?.(reelId, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Community Comments</h3>
            <p className="text-xs text-slate-500">{commentsList.length} thoughts shared</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Comments Thread List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {commentsList.map((c) => (
            <div key={c.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs shrink-0">{c.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{c.user}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{c.time}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Post Comment Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-xs disabled:opacity-40 transition"
          >
            <span>Post</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
