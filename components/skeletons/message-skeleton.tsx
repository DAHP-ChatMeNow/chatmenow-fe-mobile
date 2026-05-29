import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
  const items = Array.from({ length: 6 });

  return (
    <div className="space-y-4">
      {items.map((_, idx) => {
        const isMe = idx % 2 === 1;
        return (
          <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start space-x-2 max-w-[80%]">
              {!isMe && <Skeleton className="h-8 w-8 rounded-full" />}
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              {isMe && <Skeleton className="h-8 w-8 rounded-full" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
