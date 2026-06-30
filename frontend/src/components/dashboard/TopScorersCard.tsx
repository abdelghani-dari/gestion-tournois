import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import MediaImage from "../common/MediaImage";
import { resolvePlayerPhoto } from "../common/playerAssets";
import type { DashboardTopScorer } from "../../api";

type TopScorersCardProps = {
  scorers: DashboardTopScorer[];
  limit?: number;
  fill?: boolean;
};

function playerName(player: DashboardTopScorer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

export default function TopScorersCard({ scorers, limit = 5, fill = false }: TopScorersCardProps) {
  const t = useThemeTokens();
  const list = scorers.slice(0, limit);

  if (list.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun joueur disponible pour le moment.</p>;
  }

  return (
    <div className={clsx(fill && "flex flex-1 flex-col gap-2")}>
      {list.map((player, index) => (
        <Link
          key={player.id}
          to={`/players?highlight=${player.id}`}
          className={clsx(
            "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
            t.metricBg,
            t.navHover,
            fill && "flex-1",
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
          <MediaImage
            src={player.photo_path}
            fallback={resolvePlayerPhoto(null)}
            alt={playerName(player)}
            className="h-8 w-8 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className={clsx("truncate text-sm font-medium", t.textPrimary)}>{playerName(player)}</p>
            <p className={clsx("truncate text-xs", t.textMuted)}>{player.team?.name ?? "—"}</p>
          </div>
          <span
            className={clsx(
              "shrink-0 text-sm font-bold tabular-nums",
              (player.goals ?? 0) > 0 ? "text-emerald-500" : t.textMuted,
            )}
          >
            {player.goals ?? 0}
          </span>
        </Link>
      ))}
    </div>
  );
}
