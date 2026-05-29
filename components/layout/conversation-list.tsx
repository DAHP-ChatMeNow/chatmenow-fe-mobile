"use client";

import { Search, Edit, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const CONVERSATIONS = [
  {
    id: "1",
    name: "Mom",
    avatar: "/avatars/mom.png",
    lastMsg: "Typing...",
    time: "Now",
    unread: 0,
    online: true,
    pinned: true,
  },
  {
    id: "2",
    name: "Teamm Alpha",
    avatar: "",
    lastMsg: "Meeting at 5? Don't forget...",
    time: "10:42 AM",
    unread: 2,
    online: false,
    pinned: true,
  },
  {
    id: "3",
    name: "John Doe",
    avatar: "",
    lastMsg: "You: Sent a photo 📷",
    time: "10:30 AM",
    unread: 0,
    online: true,
    pinned: false,
  },
  {
    id: "4",
    name: "Service Support",
    avatar: "",
    lastMsg: "Your ticket #9283 has been...",
    time: "Yesterday",
    unread: 0,
    online: false,
    pinned: false,
  },
];

export function ConversationList() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header của danh sách Chat */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Messages
        </h1>
        <div className="flex gap-1">
          <button className="p-2 transition-colors rounded-full hover:bg-slate-100 text-slate-600">
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar - Tinh gọn đúng chất Professional */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <Input
            placeholder="Search messages, friends..."
            className="h-10 border-none pl-9 bg-slate-100/50 focus-visible:ring-1 focus-visible:ring-slate-200"
          />
        </div>
      </div>

      {/* Danh sách cuộn */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {/* Section: PINNED */}
          <div className="px-3 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pinned
            </span>
          </div>
          {CONVERSATIONS.filter((c) => c.pinned).map((chat) => (
            <ChatCard key={chat.id} chat={chat} />
          ))}

          {/* Section: RECENT */}
          <div className="px-3 mt-6 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recent
            </span>
          </div>
          {CONVERSATIONS.filter((c) => !c.pinned).map((chat) => (
            <ChatCard key={chat.id} chat={chat} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Component con: Thẻ hiển thị từng hội thoại
function ChatCard({ chat }: { chat: (typeof CONVERSATIONS)[0] }) {
  return (
    <div className="relative flex items-center gap-3 p-3 transition-all cursor-pointer hover:bg-slate-50 rounded-xl group">
      <div className="relative">
        <Avatar className="w-12 h-12 border border-slate-100">
          <AvatarImage src={chat.avatar} />
          <AvatarFallback className="text-xs font-semibold bg-slate-200 text-slate-600">
            {chat.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {chat.online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="font-semibold text-[14.5px] text-slate-900 truncate uppercase">
            {chat.name}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {chat.time}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-[13px] truncate pr-2 ${chat.unread > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}
          >
            {chat.lastMsg}
          </p>
          {chat.unread > 0 && (
            <Badge className="bg-blue-600 hover:bg-blue-600 h-5 min-w-[20px] px-1 rounded-full text-[10px] flex items-center justify-center">
              {chat.unread}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
