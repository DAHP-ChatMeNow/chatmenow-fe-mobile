"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Edit, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PresignedAvatar } from "@/components/ui/presigned-avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useParams, useSearchParams } from "next/navigation";
import {
  useAiConversation,
  useConversations,
  useCreateConversation,
} from "@/hooks/use-chat";
import { useContacts, useRestrictedUsers } from "@/hooks/use-contact";
import { useAuthStore } from "@/store/use-auth-store";
import { ChatListSkeleton } from "@/components/skeletons/chat-list-skeleton";
import { ConversationItemDisplay } from "./conversation-item-display";
import { Conversation } from "@/types/conversation";

type ChatConversation = Conversation & {
  isAI?: boolean;
  isAi?: boolean;
  isAiAssistant?: boolean;
};

const isPendingConversation = (conversation: ChatConversation) => {
  return (
    conversation.listCategory === "pending" ||
    (conversation.isMessageRequestPending === true &&
      conversation.isMessageRequestSentByViewer !== true)
  );
};

export function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [mailboxFilter, setMailboxFilter] = useState<"inbox" | "pending">(
    "inbox",
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "private" | "group">(
    "all",
  );
  const params = useParams();
  const searchParams = useSearchParams();
  const currentId = (params?.id as string) || searchParams.get("conversationId") || "";
  const user = useAuthStore((state) => state.user);
  const { data: conversationsData, isLoading, error } = useConversations();
  const { data: aiConversationData } = useAiConversation();
  const conversations = useMemo(() => {
    const merged = new Map<string, ChatConversation>();
    const getConversationKey = (conversation: ChatConversation) =>
      String(conversation?.id || conversation?._id || "");

    (conversationsData?.conversations || []).forEach((conversation) => {
      const key = getConversationKey(conversation);
      if (!key) return;
      merged.set(key, conversation);
    });

    const aiConversation = aiConversationData?.conversation;
    if (aiConversation) {
      const key = getConversationKey(aiConversation);
      if (key) {
        merged.set(key, aiConversation);
      }
    }

    const toTimestamp = (value: unknown) => {
      if (!value) return 0;
      const timestamp = new Date(value as string | number | Date).getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    const isAiConversation = (conversation: ChatConversation) => {
      const type = String(conversation?.type || "").toLowerCase();
      return (
        type === "ai" ||
        Boolean(conversation?.isAI) ||
        Boolean(conversation?.isAi) ||
        Boolean(conversation?.isAiAssistant)
      );
    };

    const getActivityTimestamp = (conversation: ChatConversation) => {
      const lastMessageAt = toTimestamp(conversation.lastMessage?.createdAt);
      if (lastMessageAt > 0) return lastMessageAt;
      return toTimestamp(conversation.createdAt);
    };

    const sortedConversations = Array.from(merged.values()).sort((left, right) => {
      return getActivityTimestamp(right) - getActivityTimestamp(left);
    });

    const firstAiConversation = sortedConversations.find((conversation) =>
      isAiConversation(conversation),
    );
    const firstAiConversationKey = firstAiConversation
      ? getConversationKey(firstAiConversation)
      : "";

    return sortedConversations.filter((conversation) => {
      if (!isAiConversation(conversation)) {
        return true;
      }

      return getConversationKey(conversation) === firstAiConversationKey;
    });
  }, [conversationsData, aiConversationData]);
  const { data: contactsData } = useContacts();
  const { data: restrictedUsersData } = useRestrictedUsers();
  const contacts = contactsData?.contacts || [];
  const createMutation = useCreateConversation();

  const currentUserId = user?.id || user?._id;
  const restrictedUserIdSet = useMemo(() => {
    const restrictedUsers = restrictedUsersData?.restrictedUsers || [];
    return new Set(
      restrictedUsers
        .map((restrictedUser) =>
          String(restrictedUser?.id || restrictedUser?._id || ""),
        )
        .filter(Boolean),
    );
  }, [restrictedUsersData?.restrictedUsers]);
  const isConversationRestricted = useCallback(
    (conversation: ChatConversation) => {
      if (conversation.type !== "private") return false;
      if (!currentUserId) return false;
      const partnerId =
        conversation.members
          ?.map((member) => {
            const raw = member?.userId as
              | string
              | { _id?: string; id?: string }
              | undefined;
            return typeof raw === "string"
              ? raw
              : String(raw?._id || raw?.id || "");
          })
          .find((memberId) => memberId && memberId !== currentUserId) || "";

      return Boolean(partnerId && restrictedUserIdSet.has(partnerId));
    },
    [currentUserId, restrictedUserIdSet],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const pendingConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          isPendingConversation(conversation) &&
          !isConversationRestricted(conversation),
      ),
    [conversations, isConversationRestricted],
  );
  const inboxConversations = useMemo(
    () => conversations.filter((conversation) => !isPendingConversation(conversation)),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const isAiConversation = (conversation: ChatConversation) => {
      const type = String(conversation?.type || "").toLowerCase();
      return (
        type === "ai" ||
        Boolean(conversation?.isAI) ||
        Boolean(conversation?.isAi) ||
        Boolean(conversation?.isAiAssistant)
      );
    };

    return conversations.filter((conversation) => {
      const matchMailbox =
        mailboxFilter === "pending"
          ? isPendingConversation(conversation) &&
            !isConversationRestricted(conversation)
          : !isPendingConversation(conversation);

      if (!matchMailbox) return false;

      const matchType =
        typeFilter === "all"
          ? true
          : typeFilter === "private"
            ? conversation.type === "private"
            : conversation.type === "group";

      if (!matchType) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        conversation.name,
        conversation.lastMessage?.content,
        isAiConversation(conversation) ? "ai chat" : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [conversations, mailboxFilter, normalizedQuery, typeFilter]);

  useEffect(() => {
    if (mailboxFilter !== "pending") return;
    if (pendingConversations.length > 0) return;
    setMailboxFilter("inbox");
  }, [mailboxFilter, pendingConversations.length]);

  const filterBtnClass = (isActive: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-700"
    }`;

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-slate-200/70 bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 md:px-5 md:pt-4">
        <div className="min-w-0">
          <h2 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-xl font-extrabold leading-tight text-transparent">
            Tin nhắn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredConversations.length}/
            {mailboxFilter === "pending"
              ? pendingConversations.length
              : inboxConversations.length}{" "}
            cuộc hội thoại
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              aria-label="Tạo cuộc trò chuyện"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/80 hover:shadow"
            >
              <Edit className="w-5 h-5 text-slate-700" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo nhóm chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Tên nhóm
                </label>
                <Input
                  placeholder="Nhập tên nhóm"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Chọn thành viên (ít nhất 2)
                </label>
                <div className="mt-2 overflow-auto border rounded-md max-h-56 border-slate-200/80">
                  {contacts.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">
                      Chưa có danh bạ
                    </div>
                  ) : (
                    contacts.map((c) => {
                      const id = c._id || c.id;
                      const checked = selectedIds.includes(id);
                      return (
                        <label
                          key={id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedIds((prev) =>
                                e.target.checked
                                  ? [...prev, id]
                                  : prev.filter((x) => x !== id),
                              );
                            }}
                          />
                          <div className="flex items-center gap-3">
                            <PresignedAvatar
                              avatarKey={c.avatar}
                              displayName={c.displayName}
                              className="w-6 h-6"
                              fallbackClassName="bg-slate-200 text-slate-600 text-[10px]"
                            />
                            <div className="text-sm text-slate-800">
                              {c.displayName}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (!groupName || selectedIds.length < 2) return;
                  createMutation.mutate(
                    { name: groupName, memberIds: selectedIds },
                    {
                      onSuccess: () => {
                        setGroupName("");
                        setSelectedIds([]);
                        setOpen(false);
                      },
                    },
                  );
                }}
                disabled={
                  !groupName ||
                  selectedIds.length < 2 ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo nhóm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 pb-2 md:px-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMailboxFilter("inbox")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mailboxFilter === "inbox"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
            }`}
          >
            Hộp thư
          </button>
          <button
            type="button"
            onClick={() => setMailboxFilter("pending")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mailboxFilter === "pending"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
            }`}
          >
            Danh sách chờ
            {pendingConversations.length > 0 ? ` (${pendingConversations.length})` : ""}
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 md:px-5">
        <div className="relative">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3.5 top-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="h-11 rounded-2xl border border-slate-200/80 bg-white/95 pl-10 pr-10 shadow-sm focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          />
          {query ? (
            <button
              type="button"
              aria-label="Xóa từ khóa"
              onClick={() => setQuery("")}
              className="absolute p-1 -translate-y-1/2 rounded-full right-2 top-1/2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-2.5 md:px-5 border-b border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={filterBtnClass(typeFilter === "all")}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("private")}
            className={filterBtnClass(typeFilter === "private")}
          >
            Cá nhân
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("group")}
            className={filterBtnClass(typeFilter === "group")}
          >
            Nhóm
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="px-3 pt-2 pb-4">
            <ChatListSkeleton />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-sm text-center text-slate-500">
            Không thể tải danh sách hội thoại
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="flex flex-col gap-1.5 pt-2 pb-3">
            {filteredConversations.map((chat) => (
              <ConversationItemDisplay
                key={chat.id}
                conversation={chat}
                currentUserId={currentUserId}
                isActive={currentId === chat.id}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-sm text-center text-slate-500">
            {mailboxFilter === "pending"
              ? "Không có cuộc hội thoại nào trong danh sách chờ"
              : "Không có cuộc hội thoại phù hợp"}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
