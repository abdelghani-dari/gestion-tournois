import { clsx } from "clsx";
import { statusLabels } from "../data/mockData";

const colorMap: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  completed: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  upcoming: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  scheduled: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  live: "bg-rose-500/15 text-rose-400 border-rose-500/20 animate-pulse",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        colorMap[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/20"
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
