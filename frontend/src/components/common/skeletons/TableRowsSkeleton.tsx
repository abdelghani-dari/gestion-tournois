import { clsx } from "clsx";
import { useThemeTokens } from "../../theme/useThemeTokens";

interface TableRowsSkeletonProps {
  rows?: number;
  compact?: boolean;
  className?: string;
}

export default function TableRowsSkeleton({ rows = 10, compact = false, className }: TableRowsSkeletonProps) {
  const t = useThemeTokens();
  const rowClass = compact ? "h-11" : "h-14";

  return (
    <div className={clsx("overflow-hidden rounded-md border", t.border, className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            rowClass,
            "border-b last:border-b-0",
            t.borderSubtle,
            index % 2 === 0 ? "bg-white/[0.03]" : "bg-white/[0.015]",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
