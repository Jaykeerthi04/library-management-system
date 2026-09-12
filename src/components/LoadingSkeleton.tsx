import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  type?: "table" | "cards" | "chart";
}

export default function LoadingSkeleton({ rows = 5, columns = 4, type = "table" }: LoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <Skeleton className="h-4 w-24 bg-secondary/50" />
            <Skeleton className="h-8 w-16 bg-secondary/50" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <Skeleton className="h-5 w-40 bg-secondary/50 mb-4" />
        <Skeleton className="h-64 w-full bg-secondary/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-4 w-32 bg-secondary/50" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-border/30">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1 bg-secondary/50" />
          ))}
        </div>
      ))}
    </div>
  );
}
