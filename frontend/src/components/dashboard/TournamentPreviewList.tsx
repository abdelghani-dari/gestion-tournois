import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import EntityImage from "../common/EntityImage";
import { statusLabel } from "../common/statusLabels";
import type { TournamentPreviewItem } from "../../api";

function tournamentStatusTone(status?: string | null) {
  if (status === "completed" || status === "finished") {
    return "bg-zinc-500/15 text-zinc-400";
  }
  if (status === "active" || status === "in_progress") {
    return "bg-emerald-500/15 text-emerald-400";
  }
  return "bg-amber-500/15 text-amber-400";
}

type TournamentPreviewListProps = {
  items: TournamentPreviewItem[];
};

export default function TournamentPreviewList({ items }: TournamentPreviewListProps) {
  const t = useThemeTokens();

  if (items.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun tournoi disponible.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/tournaments/${item.id}`}
          className={clsx(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
            t.border,
            t.navHover,
          )}
        >
          <EntityImage src={item.banner_path} name={item.name} className="h-10 w-10 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className={clsx("truncate text-sm font-semibold", t.textPrimary)}>{item.name}</p>
            <p className={clsx("text-xs", t.textMuted)}>
              {item.team_count} équipe{item.team_count !== 1 ? "s" : ""}
            </p>
          </div>
          <span className={clsx("shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", tournamentStatusTone(item.status))}>
            {statusLabel(item.status) || "En cours"}
          </span>
        </Link>
      ))}
    </div>
  );
}
