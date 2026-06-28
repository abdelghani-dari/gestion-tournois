import { useState } from "react";

type Tab = "monthly" | "quarterly" | "annually";

export default function ChartTab({ onChange }: { onChange?: (tab: Tab) => void }) {
  const [selected, setSelected] = useState<Tab>("monthly");

  const select = (tab: Tab) => {
    setSelected(tab);
    onChange?.(tab);
  };

  const cls = (tab: Tab) =>
    selected === tab
      ? "bg-white/[0.08] text-white shadow-sm"
      : "text-slate-500 hover:text-slate-300";

  return (
    <div className="flex items-center gap-0.5 rounded-md bg-white/[0.03] p-0.5">
      {(["monthly", "quarterly", "annually"] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => select(tab)}
          className={`rounded-sm px-3 py-1.5 text-xs font-medium capitalize transition-colors ${cls(tab)}`}
        >
          {tab === "monthly" ? "Mensuel" : tab === "quarterly" ? "Trimestriel" : "Annuel"}
        </button>
      ))}
    </div>
  );
}
