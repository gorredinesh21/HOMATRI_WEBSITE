"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Send, CornerDownRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchReelComments, postReelComment } from "@/lib/api";

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function CommentRow({ comment, onReply, isReply = false }) {
  const initial = (comment.username || "F").trim().charAt(0).toUpperCase();
  return (
    <div className={isReply ? "flex items-start gap-2 bg-white p-2.5 rounded-2xl border border-slate-200/60" : "flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60"}>
      {isReply ? (
        <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
      ) : null}
      <span className="w-8 h-8 rounded-full bg-homatri-orange-light border border-homatri-orange/30 text-homatri-orange font-bold flex items-center justify-center text-xs shrink-0">
        {initial}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900">{comment.username || "Foodie"}</span>
          <span className="text-[10px] font-semibold text-slate-400">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed break-words">{comment.text}</p>
        {!isReply ? (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="mt-1 text-[10px] font-bold text-homatri-orange hover:text-homatri-orange-dark"
          >
            Reply
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function CommentSheet({ open, onClose, reelId }) {
  const { requireAuthentication, customerPhone, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const loadComments = useCallback(async () => {
    if (!reelId) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const rows = await fetchReelComments(reelId);
      setComments(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setLoadError(err?.message || "Could not load comments.");
    } finally {
      setIsLoading(false);
    }
  }, [reelId]);

  useEffect(() => {
    if (!open) return;
    setCommentText("");
    setReplyTo(null);
    setPostError("");
    loadComments();
  }, [open, loadComments]);

  const threads = useMemo(() => {
    const topLevel = comments.filter((c) => !c.parent_comment_id);
    const replies = comments.filter((c) => c.parent_comment_id);
    return topLevel.map((parent) => ({
      parent,
      replies: replies.filter((r) => r.parent_comment_id === parent.comment_id),
    }));
  }, [comments]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || !reelId || isPosting) return;

    requireAuthentication(async () => {
      setIsPosting(true);
      setPostError("");
      try {
        const result = await postReelComment({
          reelId,
          text,
          parentCommentId: replyTo?.comment_id || null,
          phone: customerPhone,
          fullName: user?.full_name || user?.name || null,
          avatarUrl: user?.avatar_url || null,
        });
        const posted = result?.comment;
        if (posted) {
          setComments((prev) => [...prev, posted]);
        } else {
          await loadComments();
        }
        setCommentText("");
        setReplyTo(null);
      } catch (err) {
        setPostError(err?.message || "Could not post your comment.");
      } finally {
        setIsPosting(false);
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Community Comments</h3>
            <p className="text-xs text-slate-500">{comments.length} thoughts shared</p>
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

        {/* Comments Thread List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl space-y-2">
                  <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs font-semibold text-red-600">{loadError}</p>
              <button
                type="button"
                onClick={loadComments}
                className="text-xs font-bold text-homatri-orange hover:text-homatri-orange-dark"
              >
                Try again
              </button>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-slate-700">No comments yet — be the first</p>
              <p className="text-xs text-slate-500 mt-1">Share what you think about this kitchen.</p>
            </div>
          ) : (
            threads.map(({ parent, replies }) => (
              <div key={parent.comment_id} className="space-y-2">
                <CommentRow comment={parent} onReply={setReplyTo} />
                {replies.length ? (
                  <div className="pl-6 space-y-2">
                    {replies.map((reply) => (
                      <CommentRow key={reply.comment_id} comment={reply} onReply={setReplyTo} isReply />
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        {/* Post Comment Input Form */}
        <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-100 space-y-2">
          {replyTo ? (
            <div className="flex items-center justify-between bg-homatri-orange-light/50 border border-homatri-orange/20 rounded-xl px-3 py-1.5">
              <p className="text-[10px] font-bold text-homatri-dark truncate">
                Replying to {replyTo.username || "foodie"}
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-[10px] font-bold text-homatri-muted hover:text-homatri-dark"
              >
                Cancel
              </button>
            </div>
          ) : null}
          {postError ? <p className="text-[11px] font-semibold text-red-600">{postError}</p> : null}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo.username || "foodie"}…` : "Add a comment…"}
              maxLength={500}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isPosting}
              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-xs disabled:opacity-40 transition"
            >
              <span>{isPosting ? "Posting…" : "Post"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
