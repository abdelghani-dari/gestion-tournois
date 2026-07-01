import { clsx } from "clsx";
import { useThemeTokens } from "../../theme/useThemeTokens";
import { Skeleton } from "./Skeleton";

export default function TeamCardSkeleton() {
  const t = useThemeTokens();
  return (
    <div className={clsx("flex h-full flex-col rounded-md border p-6", t.card)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className={clsx("mt-5 border-t pt-4", t.borderSubtle)}>
        <Skeleton className="mb-3 h-3 w-16" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-3.5 w-5" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className={clsx("mt-auto flex flex-row flex-wrap items-center gap-3 border-t pt-4", t.borderSubtle)}>
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
