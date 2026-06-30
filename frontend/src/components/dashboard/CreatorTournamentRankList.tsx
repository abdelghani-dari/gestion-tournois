import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import EntityImage from "../common/EntityImage";
import type { TournamentPreviewItem } from "../../api";

type CreatorTournamentRankListProps = {
  items: TournamentPreviewItem[];
};

export default function CreatorTournamentRankList({ items }: CreatorTournamentRankListProps) {
  const t = useThemeTokens();

  if (items.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun tournoi créé pour le moment.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <Link
          key={item.id}
          to={`/tournaments/${item.id}`}
          className={clsx(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
            t.border,
            t.navHover,
          )}
        >
          <span
            className={clsx(
              "w-5 shrink-0 text-center text-xs font-bold tabular-nums",
              index < 3 ? "text-amber-400" : t.textMuted,
            )}
          >
            {index + 1}
          </span>
          <EntityImage src={item.banner_path} name={item.name} className="h-10 w-10 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className={clsx("truncate text-sm font-semibold", t.textPrimary)}>{item.name}</p>
            <p className={clsx("text-xs", t.textMuted)}>
              {item.team_count} équipe{item.team_count !== 1 ? "s" : ""}
              {item.approval_status === "pending" ? " · En attente" : ""}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold tabular-nums text-emerald-400">{item.total_goals ?? 0}</p>
            <p className={clsx("text-[10px] uppercase tracking-wide", t.textMuted)}>buts</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
