import SearchableSelect from "./SearchableSelect";

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
  return (
    <SearchableSelect
      selectId={filterId}
      variant="filter"
      panelLabel={label}
      value={value === null ? "" : String(value)}
      emptyOptionLabel={allLabel}
      searchPlaceholder={searchPlaceholder}
      options={options.map((option) => ({
        value: String(option.id),
        label: option.label,
      }))}
      onChange={(next) => onChange(next === "" ? null : Number(next))}
    />
  );
}

/** Re-export for pages that need the provider wrapper. */
export { DropdownGroupProvider } from "../context/DropdownGroupContext";
