"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { PresignedAvatar } from "@/components/ui/presigned-avatar";
import { PostMedia } from "@/types/post";

type LightboxAuthor = {
  displayName?: string | null;
  avatar?: string | null;
};

type PostMediaLightboxProps = {
  open: boolean;
  media: PostMedia[];
  initialIndex: number;
  author?: LightboxAuthor;
  content?: string;
  createdAt?: string | Date;
  likesCount?: number;
  commentsCount?: number;
  onClose: () => void;
};

const formatPostTime = (date?: string | Date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function PostMediaLightbox({
  open,
  media,
  initialIndex,
  author,
  content,
  createdAt,
  likesCount,
  commentsCount,
  onClose,
}: PostMediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const likeCount = likesCount ?? 0;
  const commentCount = commentsCount ?? 0;
  const hasStats = likeCount > 0 || commentCount > 0;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft")
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      if (event.key === "ArrowRight")
        setCurrentIndex((prev) => Math.min(media.length - 1, prev + 1));
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, media.length, onClose]);

  const currentMedia = useMemo(
    () => media[currentIndex],
    [media, currentIndex],
  );

  if (!open || !currentMedia) return null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < media.length - 1;

  const mediaType = String(currentMedia.type || "")
    .trim()
    .toLowerCase();
  const mediaUrl = String(currentMedia.url || "").toLowerCase();
  const isVideo =
    mediaType === "video" ||
    mediaType.startsWith("video/") ||
    /\.(mp4|mov|avi|mkv|webm|m4v)(\?|#|$)/i.test(mediaUrl);

  const openVideoFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    const videoElement = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };

    const containerElement = video.parentElement as
      | (HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        })
      | null;

    if (videoElement.requestFullscreen) {
      void videoElement.requestFullscreen().catch(() => undefined);
      return;
    }

    if (containerElement?.requestFullscreen) {
      void containerElement.requestFullscreen().catch(() => undefined);
      return;
    }

    if (containerElement?.webkitRequestFullscreen) {
      void containerElement.webkitRequestFullscreen();
      return;
    }

    if (videoElement.webkitEnterFullscreen) {
      videoElement.webkitEnterFullscreen();
    }
  };

  const handleVideoTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      openVideoFullscreen();
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
  };

  const renderMedia = () => {
    if (isVideo) {
      return (
        <video
          ref={videoRef}
          src={currentMedia.url}
          controls
          autoPlay
          playsInline
          onDoubleClick={openVideoFullscreen}
          onTouchEnd={handleVideoTouchEnd}
          className="object-contain max-w-full max-h-full"
        />
      );
    }

    return (
      <img
        src={currentMedia.url}
        alt="media"
        className="object-contain max-w-full max-h-full"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute z-[90] flex items-center justify-center w-10 h-10 text-white rounded-full top-4 left-4 bg-black/40 hover:bg-black/60"
        aria-label="Đóng"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        type="button"
        className="absolute z-[90] flex items-center justify-center w-10 h-10 text-white rounded-full top-4 right-4 bg-black/40 hover:bg-black/60 md:hidden"
        aria-label="Thêm tùy chọn"
      >
        <MoreHorizontal className="w-6 h-6" />
      </button>

      <div className="flex flex-col h-full md:flex-row">
        <div className="relative flex items-center justify-center flex-1 min-w-0 min-h-0 px-2 pt-16 pb-36 md:p-6 md:pb-6">
          {renderMedia()}

          {canGoPrev && (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="absolute z-[90] hidden text-white -translate-y-1/2 rounded-full md:flex left-4 top-1/2 w-11 h-11 items-center justify-center bg-black/45 hover:bg-black/65"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {canGoNext && (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="absolute z-[90] hidden text-white -translate-y-1/2 rounded-full md:flex right-4 top-1/2 w-11 h-11 items-center justify-center bg-black/45 hover:bg-black/65"
              aria-label="Ảnh kế"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 md:hidden">
            {media.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Mở media ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <aside className="hidden md:flex md:w-[360px] lg:w-[420px] h-full bg-white text-slate-900 flex-col border-l border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center min-w-0 gap-3">
              <PresignedAvatar
                avatarKey={author?.avatar}
                displayName={author?.displayName ?? undefined}
                className="w-10 h-10"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {author?.displayName || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {formatPostTime(createdAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="p-2 transition-colors rounded-full hover:bg-slate-100"
              aria-label="Thêm tùy chọn"
            >
              <MoreHorizontal className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {content ? (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {content}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Không có nội dung bài viết
              </p>
            )}
          </div>

          <div className="p-4 space-y-3 border-t border-slate-200">
            {hasStats && (
              <div className="flex items-center justify-between text-sm text-slate-500">
                {likeCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    {likeCount}
                  </span>
                ) : (
                  <span />
                )}
                {commentCount > 0 ? (
                  <span>{commentCount} bình luận</span>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                <Heart className="w-4 h-4" />
                Thích
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                <MessageCircle className="w-4 h-4" />
                Bình luận
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:hidden bg-gradient-to-t from-black via-black/95 to-transparent">
        <p className="text-xl font-semibold truncate">
          {author?.displayName || "User"}
        </p>
        <p className="text-sm text-white/75">{formatPostTime(createdAt)}</p>
        {content ? (
          <p className="mt-2 text-[15px] leading-relaxed line-clamp-2">
            {content}
          </p>
        ) : null}
        {hasStats && (
          <div className="flex items-center gap-6 mt-3 text-2xl">
            {likeCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold">
                <Heart className="w-6 h-6 text-blue-500 fill-blue-500" />
                {likeCount}
              </span>
            ) : null}
            {commentCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold">
                <MessageCircle className="w-6 h-6" />
                {commentCount}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
