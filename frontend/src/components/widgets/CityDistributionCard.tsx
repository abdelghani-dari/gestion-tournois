import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";

export default function CityDistributionCard() {
  const t = useThemeTokens();
  const { teams } = useSeasonData();
  const max = Math.max(...teams.map((tm) => tm.player_count), 1);

  return (
    <div className="space-y-3">
      {teams.slice(0, 8).map((team) => (
        <div key={team.id} className="flex items-center gap-3">
          <img src={team.logo_url} alt="" className="h-6 w-6 shrink-0 object-contain" />
          <span className={clsx("w-28 shrink-0 truncate text-xs", t.textSecondary)}>{team.name}</span>
          <div className={clsx("h-2 flex-1 overflow-hidden rounded-full", t.metricBg)}>
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${(team.player_count / max) * 100}%` }}
            />
          </div>
          <span className={clsx("w-6 text-right text-xs font-medium", t.textMuted)}>{team.player_count}</span>
        </div>
      ))}
    </div>
  );
}
