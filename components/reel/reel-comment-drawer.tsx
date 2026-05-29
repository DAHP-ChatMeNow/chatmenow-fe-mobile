"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, MessageCircle, Reply } from "lucide-react";
import { useReelComments, useAddReelComment } from "@/hooks/use-reel";
import { ReelComment } from "@/types/reel";
import { PresignedAvatar } from "@/components/ui/presigned-avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ReelCommentDrawerProps {
    reelId: string;
    open: boolean;
    onClose: () => void;
}

function timeAgo(date: Date | string) {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
        return "";
    }
}

export function ReelCommentDrawer({ reelId, open, onClose }: ReelCommentDrawerProps) {
    const [content, setContent] = useState("");
    const [replyTo, setReplyTo] = useState<ReelComment | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useReelComments(open ? reelId : undefined);

    const { mutate: addComment, isPending: isSending } = useAddReelComment(reelId);

    const comments = data?.pages.flatMap((p) => p.comments) ?? [];

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    const handleSend = () => {
        const text = content.trim();
        if (!text || isSending) return;

        addComment(
            {
                content: text,
                replyToCommentId: replyTo?._id,
            },
            {
                onSuccess: () => {
                    setContent("");
                    setReplyTo(null);
                    // Scroll to bottom
                    setTimeout(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = listRef.current.scrollHeight;
                        }
                    }, 100);
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-[9990] bg-black/40"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[9991] flex flex-col bg-gray-950 border-t border-white/10 rounded-t-3xl shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ maxHeight: "70vh" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-white/60" />
                        <span className="text-sm font-semibold text-white">Bình luận</span>
                        {comments.length > 0 && (
                            <span className="text-xs text-white/40">({comments.length})</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/60"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Comment list */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-white/30 text-sm">Chưa có bình luận nào</p>
                            <p className="text-white/20 text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
                        </div>
                    ) : (
                        comments.map((comment) => {
                            const user = comment.user;
                            const name = user?.displayName || "User";
                            return (
                                <div key={comment._id} className="flex gap-2.5">
                                    <PresignedAvatar
                                        avatarKey={user?.avatar}
                                        displayName={name}
                                        className="w-8 h-8 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white/6 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
                                            <p className="text-xs font-semibold text-white/80 mb-0.5">{name}</p>
                                            <p className="text-sm text-white/90 break-words">{comment.content}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 ml-1">
                                            <span className="text-[11px] text-white/30">{timeAgo(comment.createdAt)}</span>
                                            <button
                                                onClick={() => {
                                                    setReplyTo(comment);
                                                    inputRef.current?.focus();
                                                }}
                                                className="text-[11px] text-white/40 hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                <Reply className="w-3 h-3" />
                                                Trả lời
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Load more */}
                    {hasNextPage && (
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="w-full text-xs text-primary hover:text-primary/80 py-2 transition-colors"
                        >
                            {isFetchingNextPage ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                "Xem thêm bình luận"
                            )}
                        </button>
                    )}
                </div>

                {/* Reply indicator */}
                {replyTo && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-t border-primary/20">
                        <Reply className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs text-primary/80 flex-1 truncate">
                            Trả lời <strong>{replyTo.user?.displayName || "User"}</strong>: {replyTo.content}
                        </span>
                        <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-white/10 bg-gray-950">
                    <input
                        ref={inputRef}
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={replyTo ? `Trả lời ${replyTo.user?.displayName || "User"}...` : "Viết bình luận..."}
                        maxLength={500}
                        className="flex-1 bg-white/8 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/60 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!content.trim() || isSending}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                        aria-label="Gửi bình luận"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
