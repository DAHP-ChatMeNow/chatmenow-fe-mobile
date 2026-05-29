"use client";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useSearchParams } from "next/navigation";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const isChatting = !!searchParams.get("conversationId");

  return (
    <div className="flex h-full min-h-0 w-full bg-gradient-to-br from-white to-slate-50/30 overflow-hidden">
      <aside
        className={`
        ${isChatting ? "hidden" : "flex"} 
        md:flex w-full md:w-[360px] lg:w-[400px] xl:w-[420px] shrink-0 border-r border-slate-200/60 flex-col h-full shadow-xl
      `}
      >
        <ChatSidebar />
      </aside>

      <section
        className={`
        ${!isChatting ? "hidden md:flex" : "flex"} 
        flex-1 h-full min-h-0 min-w-0 relative bg-white
      `}
      >
        {children}
      </section>
    </div>
  );
}
