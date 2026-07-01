import { clsx } from "clsx";
import { useThemeTokens } from "../../theme/useThemeTokens";

export function Skeleton({ className }: { className?: string }) {
  const t = useThemeTokens();
  return (
    <div
      className={clsx("animate-pulse rounded-md opacity-60", t.metricBg, className)}
      aria-hidden
    />
  );
}
