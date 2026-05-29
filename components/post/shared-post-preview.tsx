"use client";

import { Lock } from "lucide-react";
import { PresignedAvatar } from "@/components/ui/presigned-avatar";
import { SharedPostReference } from "@/types/post";
import { formatPostTime } from "@/lib/utils";

const getAuthorMeta = (post?: SharedPostReference | null) => {
  if (!post) return { displayName: "Người dùng", avatar: undefined as string | undefined };
  const author = post.author;
  const authorId = post.authorId;
  const displayName =
    author?.displayName ||
    (typeof authorId === "object" ? authorId?.displayName : undefined) ||
    "Người dùng";
  const avatar =
    author?.avatar ||
    (typeof authorId === "object" ? authorId?.avatar : undefined);
  return { displayName, avatar };
};

const getMediaType = (type?: string, url?: string) => {
  const t = String(type || "").toLowerCase();
  if (t.startsWith("video")) return "video";
  const u = String(url || "").toLowerCase();
  if (/\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(u)) return "video";
  return "image";
};

export function SharedPostPreview({
  post,
  onClick,
  className = "",
  isMe = false,
  compact = false,
}: {
  post?: SharedPostReference | null;
  onClick?: () => void;
  className?: string;
  isMe?: boolean;
  compact?: boolean;
}) {
  if (!post) return null;

  if (post.isAccessible === false) {
    return (
      <div
        className={`rounded-xl border px-3 py-2 text-sm ${
          isMe
            ? "border-blue-300/40 bg-blue-500/25 text-blue-50"
            : "border-slate-200 bg-slate-50 text-slate-600"
        } ${className}`}
      >
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4" />
          Bài viết gốc không còn khả dụng
        </div>
      </div>
    );
  }

  const { displayName, avatar } = getAuthorMeta(post);
  const firstMedia = post.media?.[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full overflow-hidden rounded-2xl text-left transition-all hover:opacity-95 flex flex-col group block ${
        isMe
          ? "bg-white/95 text-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-transparent"
          : "bg-white text-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100"
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <PresignedAvatar
          avatarKey={avatar}
          displayName={displayName}
          className="h-9 w-9 ring-1 ring-black/5"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight group-hover:text-blue-600 transition-colors">{displayName}</p>
          {post.createdAt ? (
            <p className="truncate text-[11px] font-medium text-gray-500 mt-0.5">
              {formatPostTime(post.createdAt)}
            </p>
          ) : null}
        </div>
      </div>

      {post.content ? (
        <div className="px-3.5 pb-3">
          <p
            className={`text-[13px] text-gray-700 leading-relaxed overflow-hidden ${
              compact ? "line-clamp-2" : "max-h-[160px]"
            }`}
          >
            {post.content}
          </p>
        </div>
      ) : null}

      {firstMedia?.url ? (
        <div
          className={`w-full overflow-hidden bg-gray-100 relative ${
            compact ? "h-[140px]" : "h-[220px] sm:h-[280px]"
          }`}
        >
          {getMediaType(firstMedia.type, firstMedia.url) === "video" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <video
                src={firstMedia.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-900 border-b-[6px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={firstMedia.url}
              alt="shared-post"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ) : null}
    </button>
  );
}
