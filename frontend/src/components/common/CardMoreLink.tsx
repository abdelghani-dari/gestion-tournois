import { Link } from "react-router";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import { useThemeTokens } from "../theme/useThemeTokens";

export default function CardMoreLink({ to, label = "Voir plus" }: { to: string; label?: string }) {
  const t = useThemeTokens();
  return (
    <Link
      to={to}
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
        t.metricBg,
        "text-brand-500 hover:text-brand-400",
      )}
    >
      <span>{label}</span>
      <ChevronRight className="size-3.5 shrink-0 opacity-80" />
    </Link>
  );
}
