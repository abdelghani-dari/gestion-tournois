import { clsx } from "clsx";
import SearchableSelect, { type SearchableSelectOption } from "./SearchableSelect";
import { useThemeTokens } from "../theme/useThemeTokens";

interface FormSearchableSelectProps {
  id: string;
  label: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  emptyOptionLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  expandedOptions?: SearchableSelectOption[];
}

export default function FormSearchableSelect({
  id,
  label,
  value,
  options,
  onChange,
  emptyOptionLabel,
  placeholder,
  searchPlaceholder,
  disabled,
  searchable,
  className,
  expandedOptions,
}: FormSearchableSelectProps) {
  const t = useThemeTokens();

  return (
    <div className={className}>
      <label htmlFor={id} className={clsx("mb-1 block text-xs", t.textSecondary)}>
        {label}
      </label>
      <SearchableSelect
        selectId={id}
        variant="form"
        panelLabel={label.replace(/\s*\*$/, "").toUpperCase()}
        value={value}
        options={options}
        onChange={onChange}
        emptyOptionLabel={emptyOptionLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        disabled={disabled}
        searchable={searchable}
        expandedOptions={expandedOptions}
      />
    </div>
  );
}
