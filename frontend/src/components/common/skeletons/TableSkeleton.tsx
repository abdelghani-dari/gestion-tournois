import { clsx } from "clsx";
import { useThemeTokens } from "../../theme/useThemeTokens";
import { Skeleton } from "./Skeleton";

export default function TableSkeleton({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  const t = useThemeTokens();
  return (
    <div className="space-y-0">
      <div className={clsx("flex gap-4 border-b px-4 py-3", t.border)}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={clsx("flex items-center gap-4 border-b px-4 py-3 last:border-0", t.borderSubtle)}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
