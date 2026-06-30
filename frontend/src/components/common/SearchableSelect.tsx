import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useOptionalDropdownGroup } from "../context/DropdownGroupContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { CheckLineIcon } from "../../icons";

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchText?: string;
  content?: React.ReactNode;
}

interface SearchableSelectProps {
  selectId: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  /** Uppercase label shown at the top of the dropdown panel */
  panelLabel?: string;
  /** Adds a selectable row with an empty value (filters / optional fields) */
  emptyOptionLabel?: string;
  /** Trigger label when value is empty and no empty option label is set */
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  variant?: "filter" | "form";
  className?: string;
  /** When the user searches, options are taken from this list instead of `options`. */
  expandedOptions?: SearchableSelectOption[];
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={clsx("size-3.5 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SearchableSelect({
  selectId,
  value,
  options,
  onChange,
  panelLabel,
  emptyOptionLabel,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  disabled = false,
  searchable = true,
  variant = "form",
  className,
  expandedOptions,
}: SearchableSelectProps) {
  const t = useThemeTokens();
  const group = useOptionalDropdownGroup(selectId);
  const [localOpen, setLocalOpen] = useState(false);
  const open = group ? group.open : localOpen;
  const toggle = group ? group.toggle : () => setLocalOpen((current) => !current);
  const close = group ? group.close : () => setLocalOpen(false);

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");

  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel =
    value === ""
      ? emptyOptionLabel ?? placeholder
      : selectedOption?.label ?? placeholder;
  const selectedContent: ReactNode | undefined =
    value === "" ? undefined : selectedOption?.content;

  const filtered = useMemo(() => {
    const source = query.trim() && expandedOptions ? expandedOptions : options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return source.filter((option) => (option.searchText ?? option.label).toLowerCase().includes(q));
  }, [options, expandedOptions, query]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setPlacement(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? "top" : "bottom");
  }, [open, filtered.length]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setDropdownWidth(triggerRef.current?.offsetWidth);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const isFilter = variant === "filter";

  const pick = (next: string) => {
    onChange(next);
    close();
  };

  const optionButtonClass = (active: boolean) =>
    clsx(
      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
      active ? t.dropdownActive : clsx(t.textSecondary, t.navHover),
    );

  return (
    <div
      className={clsx(
        "relative",
        isFilter ? "min-w-[120px] max-w-[200px] shrink-0" : "w-full",
        open && "z-[9999]",
        className,
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={clsx(
          "dropdown-toggle flex w-full items-center gap-2 rounded-lg border text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          isFilter ? "h-9 px-2.5" : "px-4 py-2.5",
          t.headerIconBtn,
        )}
      >
        <span className={clsx("min-w-0 flex-1 truncate font-medium", isFilter ? "text-xs" : "text-sm", t.textPrimary)}>
          {selectedContent ?? selectedLabel}
        </span>
        <ChevronIcon open={open} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        align={isFilter ? "right" : "left"}
        placement={placement}
        className={clsx(
          "border p-2 shadow-2xl backdrop-blur-xl",
          t.headerDropdown,
          isFilter ? "w-56" : "min-w-[320px]",
        )}
        style={!isFilter && dropdownWidth ? { width: dropdownWidth } : undefined}
      >
        {panelLabel && (
          <p className={clsx("px-2 py-1 text-[10px] font-semibold uppercase tracking-wider", t.textMuted)}>
            {panelLabel}
          </p>
        )}

        {searchable && (isFilter || options.length > 5) && (
          <div className={clsx("mx-1 mb-2 rounded-lg border px-3 py-2", t.border, t.metricBg)}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className={clsx("w-full bg-transparent text-sm outline-none placeholder:opacity-50", t.textPrimary)}
            />
          </div>
        )}

        <div className="x-scroll max-h-64 space-y-0.5 overflow-y-auto pr-0.5">
          {emptyOptionLabel !== undefined && (
            <button type="button" onClick={() => pick("")} className={optionButtonClass(value === "")}>
              <span className="min-w-0 flex-1 truncate font-medium">{emptyOptionLabel}</span>
              {value === "" && <CheckLineIcon className="size-3.5 shrink-0" />}
            </button>
          )}

          {filtered.map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option.value)}
                className={clsx(optionButtonClass(active), option.content && "items-center py-2.5")}
              >
                {option.content ? (
                  <span className="min-w-0 flex-1">{option.content}</span>
                ) : (
                  <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
                )}
                {active && <CheckLineIcon className="size-3.5 shrink-0" />}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className={clsx("px-2.5 py-2 text-xs", t.textMuted)}>Aucun résultat</p>
          )}
        </div>
      </Dropdown>
    </div>
  );
}
