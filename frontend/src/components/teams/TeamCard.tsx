import { Link } from "react-router";
import { clsx } from "clsx";
import Badge from "../ui/Badge";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import type { Team } from "../types";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const t = useThemeTokens();
  const { getPlayersByTeam } = useSeasonData();
  const roster = getPlayersByTeam(team.id);
  const preview = roster.slice(0, 5);
  const topScorer = [...roster].sort((a, b) => b.goals - a.goals)[0];

  return (
    <div className={clsx("flex h-full flex-col rounded-md border p-6 transition-all duration-200", t.card, t.cardHover)}>
      <div className="flex items-start gap-4">
        <img src={team.logo_url} alt={team.name} className="h-16 w-16 shrink-0 object-contain" />
        <div className="min-w-0 flex-1">
          <Link to={`/teams/${team.id}`} className={clsx("block truncate text-base font-semibold hover:text-brand-500", t.textPrimary)}>
            {team.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge color="info">{roster.length} joueurs</Badge>
            {topScorer && topScorer.goals > 0 && (
              <Badge color="success">{topScorer.goals} buts</Badge>
            )}
          </div>
        </div>
      </div>

      <div className={clsx("mt-5 border-t pt-4", t.borderSubtle)}>
        <p className={clsx("mb-3 text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Effectif</p>
        <ul className="space-y-2">
          {preview.map((player) => (
            <li key={player.id} className="flex items-center gap-2.5">
              <span className={clsx("w-6 text-center font-mono text-xs", t.textMuted)}>{player.shirt_number}</span>
              <img src={player.flag_url} alt="" className="h-3.5 w-5 shrink-0 object-cover" />
              <span className={clsx("min-w-0 flex-1 truncate text-sm", t.textSecondary)}>{player.name}</span>
              <span className={clsx("text-xs", t.textMuted)}>{player.position}</span>
            </li>
          ))}
        </ul>
        {roster.length > 5 && (
          <p className={clsx("mt-3 text-xs", t.textMuted)}>+{roster.length - 5} autres joueurs</p>
        )}
      </div>

      <div className={clsx("mt-auto flex gap-3 border-t pt-4", t.borderSubtle)}>
        <Link
          to={`/players?team=${team.id}`}
          className="text-xs font-medium text-brand-500 hover:text-brand-400"
        >
          Fiche équipe
        </Link>
        <Link to={`/teams/${team.id}/statistics`} className={clsx("text-xs hover:text-brand-500", t.textMuted)}>
          Statistiques
        </Link>
      </div>
    </div>
  );
}
