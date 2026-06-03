import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useSwipeBack() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only enable swipe-back on detail/sub-pages
    const isProfile = pathname === "/profile";
    const isSettings = pathname === "/settings";
    const isJoinGroup = pathname === "/join-group";

    let isChatConversation = false;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      isChatConversation = pathname === "/messages" && urlParams.has("conversationId");
    }

    const isDetailView = isProfile || isSettings || isJoinGroup || isChatConversation;

    if (!isDetailView) {
      return;
    }

    let startX = 0;
    let startY = 0;
    let isSwipeCandidate = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Only track touch starting from the left edge (within 40 pixels)
      if (touch.clientX < 40) {
        startX = touch.clientX;
        startY = touch.clientY;
        isSwipeCandidate = true;
      } else {
        isSwipeCandidate = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeCandidate || e.touches.length !== 1) return;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwipeCandidate) return;
      isSwipeCandidate = false;

      if (e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Swipe right by more than 120px, with horizontal movement being larger than vertical movement
      if (deltaX > 120 && Math.abs(deltaY) < 60) {
        router.back();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router, pathname]);
}
