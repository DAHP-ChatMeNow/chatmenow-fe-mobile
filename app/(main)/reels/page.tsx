"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ReelFeed } from "@/components/reel/reel-feed";
import { CreateReelModal } from "@/components/reel/create-reel-modal";

export default function ReelsPage() {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <>
            <title>Reels — ChatMeNow</title>
            {/*
        Desktop: dark blurred background, centered container
        Mobile: full screen
      */}
            <div className="relative w-full h-full bg-slate-900 overflow-hidden flex justify-center">
                <div className="relative w-full h-full md:max-w-[450px] md:h-[calc(100vh-2rem)] md:my-4 md:rounded-2xl overflow-hidden shadow-2xl bg-black">
                    <ReelFeed />

                    {/* Create Reel FAB */}
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="absolute bottom-6 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all active:scale-95"
                        aria-label="Tạo Reel mới"
                    >
                        <Plus className="w-6 h-6 text-primary-foreground" />
                    </button>
                </div>
            </div>

            <CreateReelModal open={createOpen} onClose={() => setCreateOpen(false)} />
        </>
    );
}
