import { useState, useMemo, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useOptionalDropdownGroup } from "../context/DropdownGroupContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { CheckLineIcon } from "../../icons";

export interface FilterOption {
  id: number | null;
  label: string;
}

interface SearchableFilterProps {
  filterId: string;
  label: string;
  value: number | null;
  options: FilterOption[];
  onChange: (id: number | null) => void;
  allLabel?: string;
  searchPlaceholder?: string;
}

export default function SearchableFilter({
  filterId,
  label,
  value,
  options,
  onChange,
  allLabel = "Tous",
  searchPlaceholder = "Rechercher…",
}: SearchableFilterProps) {
  const t = useThemeTokens();
  const group = useOptionalDropdownGroup(filterId);
  const [localOpen, setLocalOpen] = useState(false);
  const open = group ? group.open : localOpen;
  const toggle = group ? group.toggle : () => setLocalOpen((v) => !v);
  const close = group ? group.close : () => setLocalOpen(false);

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value === null ? allLabel : options.find((o) => o.id === value)?.label ?? allLabel;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div className="relative min-w-[108px] max-w-[148px] shrink-0">
      <button
        type="button"
        onClick={toggle}
        className={clsx(
          "dropdown-toggle flex h-8 w-full items-center gap-1.5 rounded-md border px-2 text-left transition-colors",
          t.headerIconBtn
        )}
      >
        <span className={clsx("min-w-0 flex-1 truncate text-xs font-medium", t.textPrimary)}>{selected}</span>
        <svg className={clsx("size-3 shrink-0 opacity-50", open && "rotate-180")} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        align="left"
        className={clsx("w-44 border p-1.5", t.headerDropdown)}
      >
        <p className={clsx("px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", t.textMuted)}>{label}</p>
        <div className={clsx("mx-0.5 mb-1.5 mt-0.5 rounded border px-2 py-1", t.border, t.metricBg)}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={clsx("w-full bg-transparent text-xs outline-none placeholder:opacity-50", t.textPrimary)}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            onChange(null);
            close();
          }}
          className={clsx(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
            value === null ? t.dropdownActive : clsx(t.textSecondary, t.navHover)
          )}
        >
          <span className="min-w-0 flex-1 truncate font-medium">{allLabel}</span>
          {value === null && <CheckLineIcon className="size-3 shrink-0" />}
        </button>

        <div className="x-scroll max-h-40 overflow-y-auto">
          {filtered.map((opt) => {
            const active = value === opt.id;
            return (
              <button
                key={opt.id ?? "null"}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  close();
                }}
                className={clsx(
                  "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  active ? t.dropdownActive : clsx(t.textSecondary, t.navHover)
                )}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{opt.label}</span>
                {active && <CheckLineIcon className="size-3 shrink-0" />}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className={clsx("px-2 py-1.5 text-[10px]", t.textMuted)}>Aucun résultat</p>
          )}
        </div>
      </Dropdown>
    </div>
  );
}

/** Re-export for pages that need the provider wrapper. */
export { DropdownGroupProvider } from "../context/DropdownGroupContext";
