import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function FilterSearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
}: FilterSearchInputProps) {
  const t = useThemeTokens();

  return (
    <div className={clsx("relative min-w-[140px] max-w-[200px] flex-1 sm:max-w-[220px]", className)}>
      <svg
        className={clsx("pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 opacity-40", t.textMuted)}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "h-8 w-full rounded-md border py-0 pl-7 pr-2 text-xs outline-none transition-colors",
          "placeholder:opacity-50 focus:border-brand-500/40",
          t.border,
          t.metricBg,
          t.textPrimary
        )}
      />
    </div>
  );
}
