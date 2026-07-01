import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

interface FilterTabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}

export default function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  const t = useThemeTokens();

  return (
    <div className={clsx("inline-flex flex-wrap gap-1 rounded-md border p-1", t.border)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200",
            active === tab.id ? t.tabActive : t.tabInactive
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 opacity-70">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
