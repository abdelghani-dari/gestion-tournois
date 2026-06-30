import { clsx } from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useThemeTokens } from "../theme/useThemeTokens";

type SortableThProps = {
  label: string;
  column: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
};

export default function SortableTh({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  className,
  align = "left",
}: SortableThProps) {
  const t = useThemeTokens();
  const active = sortBy === column;

  return (
    <th className={clsx("px-4 py-3", align === "center" && "text-center", align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={clsx(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors",
          active ? "text-brand-400" : t.textMuted,
          "hover:text-brand-400",
        )}
      >
        {label}
        {active ? (
          sortDir === "asc" ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
        ) : (
          <ChevronDown className="size-3.5 opacity-30" />
        )}
      </button>
    </th>
  );
}
