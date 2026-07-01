import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";

interface TopScorersCardProps {
  limit?: number;
  fill?: boolean;
}

export default function TopScorersCard({ limit = 5, fill = false }: TopScorersCardProps) {
  const t = useThemeTokens();
  const { topScorers, getTeamById } = useSeasonData();
  const list = topScorers.slice(0, limit);

  return (
    <div className={clsx(fill && "flex flex-1 flex-col gap-2")}>
      {list.map((p, i) => {
        const team = getTeamById(p.team_id);
        return (
          <Link
            key={p.id}
            to={`/players/${p.id}`}
            className={clsx(
              "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
              t.metricBg,
              t.navHover,
              fill && "flex-1"
            )}
          >
            <span className={clsx("w-5 shrink-0 text-center text-xs font-bold tabular-nums", i < 3 ? "text-amber-400" : t.textMuted)}>
              {i + 1}
            </span>
            <img src={p.photo_url} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className={clsx("truncate text-sm font-medium", t.textPrimary)}>{p.name}</p>
              <p className={clsx("truncate text-xs", t.textMuted)}>{team?.name}</p>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-500">{p.goals}</span>
          </Link>
        );
      })}
    </div>
  );
}
