import { clsx } from "clsx";
import { useThemeTokens } from "../../theme/useThemeTokens";
import { Skeleton } from "./Skeleton";

export default function MatchRowSkeleton({ rows = 6 }: { rows?: number }) {
  const t = useThemeTokens();
  return (
    <div className={clsx("min-w-[640px] divide-y", t.tableDivide)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-3">
          <div className="w-[4rem] shrink-0 space-y-1">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="ml-auto h-10 w-10 rounded-md" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-14 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-4 w-24" />
          <div className="ml-auto flex shrink-0 flex-row items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
