"use client";

import { Bell, UserPlus, MessageSquare, Heart, Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PresignedAvatar } from "@/components/ui/presigned-avatar";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useApproveGroupMemberRequest,
} from "@/hooks/use-notification";
import { Notification } from "@/types/notification";
import {
  useAcceptFriendRequest as useAcceptFriendRequestContact,
  useRejectFriendRequest as useRejectFriendRequestContact,
} from "@/hooks/use-contact";
import { useState } from "react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "friend_request":
      return <UserPlus className="w-3 h-3 text-white" />;
    case "like":
    case "post_like":
      return <Heart className="w-3 h-3 text-white" />;
    case "message":
      return <MessageSquare className="w-3 h-3 text-white" />;
    case "group_member_request":
      return <UserPlus className="w-3 h-3 text-white" />;
    default:
      return <Bell className="w-3 h-3 text-white" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case "friend_request":
      return "bg-orange-500";
    case "like":
    case "post_like":
      return "bg-red-500";
    case "message":
      return "bg-blue-500";
    case "group_member_request":
      return "bg-violet-500";
    default:
      return "bg-slate-500";
  }
};

export default function NotificationsPage() {
  const router = useRouter();

  const getSenderName = (noti: Notification) => {
    if (noti.senderName) return noti.senderName;
    if (typeof noti.senderId === "object" && noti.senderId?.displayName) {
      return noti.senderId.displayName;
    }
    return "Người dùng";
  };

  const getSenderAvatar = (noti: Notification) => {
    if (noti.senderAvatar) return noti.senderAvatar;
    if (typeof noti.senderId === "object" && noti.senderId?.avatar) {
      return noti.senderId.avatar;
    }
    return undefined;
  };

  const getReferencedId = (noti: Notification) => {
    if (!noti.referenced) return "";
    if (typeof noti.referenced === "string") return noti.referenced;
    return noti.referenced.id || noti.referenced._id || "";
  };

  const handleOpenNotification = (noti: Notification) => {
    if (!noti.isRead) {
      markAsRead(noti.id);
    }

    if (!noti.targetUrl) return;
    router.push(noti.targetUrl);
  };

  const { data: notificationsData, isLoading, error } = useNotifications();
  const { mutate: markAllAsRead, isPending: isMarkingAll } =
    useMarkAllNotificationsAsRead();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: approveGroupMemberRequest } = useApproveGroupMemberRequest();
  const { mutate: acceptFriendRequest } = useAcceptFriendRequestContact();
  const { mutate: rejectFriendRequest } = useRejectFriendRequestContact();
  const [acceptingIds, setAcceptingIds] = useState<string[]>([]);
  const [rejectingIds, setRejectingIds] = useState<string[]>([]);
  const [approvingIds, setApprovingIds] = useState<string[]>([]);
  const notifications = notificationsData?.notifications || [];
  const unreadNotifications = notifications.filter((noti) => !noti.isRead);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  const handleAcceptFriendRequest = (
    notificationId: string,
    requestId: string,
  ) => {
    if (!requestId) {
      return;
    }
    setAcceptingIds([...acceptingIds, notificationId]);
    acceptFriendRequest(requestId, {
      onSuccess: (result) => {
        if (result?.conversationId) {
          router.push(`/messages?conversationId=${result.conversationId}`);
        }
      },
      onSettled: () => {
        setAcceptingIds(acceptingIds.filter((id) => id !== notificationId));
      },
    });
  };

  const handleRejectFriendRequest = (
    notificationId: string,
    requestId: string,
  ) => {
    if (!requestId) {
      return;
    }
    setRejectingIds([...rejectingIds, notificationId]);
    rejectFriendRequest(requestId, {
      onSettled: () => {
        setRejectingIds(rejectingIds.filter((id) => id !== notificationId));
      },
    });
  };

  const handleApproveGroupMemberRequest = (notificationId: string) => {
    setApprovingIds((prev) => [...prev, notificationId]);
    approveGroupMemberRequest(notificationId, {
      onSettled: () => {
        setApprovingIds((prev) => prev.filter((id) => id !== notificationId));
      },
    });
  };

  const formatTime = (date: string | Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(date).toLocaleDateString("vi-VN");
  };
  return (
    <div className="flex flex-col w-full h-full bg-white">
      <header className="h-[70px] border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 bg-white z-10 w-full">
        <h1 className="text-xl font-bold text-slate-900">Thông báo</h1>
        <Button
          variant="ghost"
          size="sm"
          className="font-medium text-blue-600"
          onClick={() => markAllAsRead()}
          disabled={isMarkingAll || !hasUnreadNotifications}
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </header>

      <ScrollArea className="flex-1 w-full">
        <div className="w-full p-4 space-y-2 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-slate-500">
              Không thể tải thông báo
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((noti, index) => (
              <div
                key={`${noti.id}-${index}`}
                className={`flex items-start gap-4 rounded-[22px] px-4 py-4 transition-all ${
                  noti.targetUrl ? "cursor-pointer" : ""
                } ${
                  noti.isRead
                    ? "bg-white hover:bg-slate-50/80"
                    : "bg-sky-50/90 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)]"
                }`}
                onClick={() => handleOpenNotification(noti)}
                role={noti.targetUrl ? "button" : undefined}
                tabIndex={noti.targetUrl ? 0 : -1}
                onKeyDown={(event) => {
                  if (!noti.targetUrl) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenNotification(noti);
                  }
                }}
              >
                <div className="relative shrink-0">
                  <PresignedAvatar
                    avatarKey={getSenderAvatar(noti)}
                    displayName={getSenderName(noti)}
                    className="h-14 w-14 border border-white shadow-sm"
                    fallbackClassName="bg-slate-100 font-bold text-slate-700"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 rounded-full border-2 border-white p-1.5 ${getNotificationBgColor(noti.type)}`}
                  >
                    {getNotificationIcon(noti.type)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[15px] leading-6 text-slate-900 ${
                      noti.isRead ? "font-medium" : "font-semibold"
                    }`}
                  >
                    <span className="font-bold">{getSenderName(noti)} </span>
                    {noti.displayText || noti.message}
                  </p>
                  <p
                    className={`mt-1 text-sm ${
                      noti.isRead ? "text-slate-500" : "text-slate-600"
                    }`}
                  >
                    {formatTime(noti.createdAt)}
                  </p>

                  {noti.type === "friend_request" && !noti.isRead && (
                    <div className="mt-4 flex gap-3">
                      <Button
                        size="sm"
                        className="h-10 min-w-[132px] rounded-xl bg-blue-600 px-5 text-sm font-semibold hover:bg-blue-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptFriendRequest(
                            noti.id,
                            getReferencedId(noti),
                          );
                        }}
                        disabled={acceptingIds.includes(noti.id)}
                      >
                        {acceptingIds.includes(noti.id) ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          "Chấp nhận"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 min-w-[132px] rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRejectFriendRequest(
                            noti.id,
                            getReferencedId(noti),
                          );
                        }}
                        disabled={rejectingIds.includes(noti.id)}
                      >
                        {rejectingIds.includes(noti.id) ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          "Từ chối"
                        )}
                      </Button>
                    </div>
                  )}

                  {noti.type === "group_member_request" &&
                  noti.metadata?.status !== "approved" ? (
                    <div className="mt-4 flex gap-3">
                      <Button
                        size="sm"
                        className="h-10 rounded-xl bg-violet-600 px-5 text-sm font-semibold hover:bg-violet-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleApproveGroupMemberRequest(noti.id);
                        }}
                        disabled={approvingIds.includes(noti.id)}
                      >
                        {approvingIds.includes(noti.id) ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          "Duyệt"
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>

                {!noti.isRead && (
                  <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">
              Bạn không có thông báo nào
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
