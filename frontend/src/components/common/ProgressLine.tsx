import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

interface ProgressLineProps {
  value: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function ProgressLine({
  value,
  label,
  sublabel,
  showValue = true,
  size = "md",
  className,
}: ProgressLineProps) {
  const t = useThemeTokens();
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {label && (
              <p className={clsx("font-medium", size === "sm" ? "text-xs" : "text-sm", t.textPrimary)}>
                {label}
              </p>
            )}
            {sublabel && (
              <p className={clsx("mt-0.5", size === "sm" ? "text-[10px]" : "text-xs", t.textMuted)}>
                {sublabel}
              </p>
            )}
          </div>
          {showValue && (
            <span className={clsx("shrink-0 font-bold tabular-nums", size === "sm" ? "text-lg" : "text-2xl", t.textPrimary)}>
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div
        className={clsx(
          "relative overflow-hidden rounded-full",
          size === "sm" ? "h-1.5" : "h-2.5",
          t.metricBg
        )}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-all duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {!label && !showValue && sublabel && (
        <div className="mt-2 flex items-center justify-between">
          <span className={clsx("text-xs", t.textMuted)}>{sublabel}</span>
          <span className={clsx("text-sm font-bold tabular-nums", t.textPrimary)}>{clamped}%</span>
        </div>
      )}
    </div>
  );
}
