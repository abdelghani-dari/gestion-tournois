import { Link } from "react-router";
import { clsx } from "clsx";
import StatusBadge from "../common/StatusBadge";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import type { MatchGame } from "../types";

interface MatchVersusCardProps {
  match: MatchGame;
}

function TeamSide({ teamId, score, align }: { teamId: number; score: number | null; align: "left" | "right" }) {
  const t = useThemeTokens();
  const { getTeamById } = useSeasonData();
  const team = getTeamById(teamId);

  return (
    <div className={clsx("flex flex-1 flex-col items-center gap-3 sm:flex-row", align === "right" && "sm:flex-row-reverse")}>
      <img src={team?.logo_url} alt={team?.name ?? ""} className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20" />
      <div className={clsx("min-w-0 text-center", align === "right" ? "sm:text-right" : "sm:text-left")}>
        <p className={clsx("truncate text-sm font-semibold sm:text-base", t.textPrimary)}>{team?.name ?? "—"}</p>
        {score !== null && (
          <p className={clsx("mt-1 font-mono text-2xl font-bold tabular-nums", t.textPrimary)}>{score}</p>
        )}
      </div>
    </div>
  );
}

export default function MatchVersusCard({ match }: MatchVersusCardProps) {
  const t = useThemeTokens();
  const { getChampionshipById, getTournamentById, formatDateTime } = useSeasonData();
  const competition =
    (match.championship_id && getChampionshipById(match.championship_id)?.name) ||
    (match.tournament_id && getTournamentById(match.tournament_id)?.name) ||
    "—";

  return (
    <div className={clsx("group rounded-md border p-5 transition-all duration-200 sm:p-6", t.card, t.cardHover)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <span className={clsx("text-xs", t.textMuted)}>{competition}</span>
        </div>
        <span className={clsx("text-xs font-medium", t.textSecondary)}>{formatDateTime(match.match_date)}</span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <TeamSide teamId={match.home_team_id} score={match.home_score} align="left" />
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span className={clsx("flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold tracking-wider", t.vsBadge)}>
            VS
          </span>
          {match.home_score !== null && match.away_score !== null && (
            <span className={clsx("hidden font-mono text-lg font-bold sm:block", t.textPrimary)}>
              {match.home_score} – {match.away_score}
            </span>
          )}
        </div>
        <TeamSide teamId={match.away_team_id} score={match.away_score} align="right" />
      </div>

      <div className={clsx("mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4", t.borderSubtle)}>
        <Link to={`/matches/${match.id}`} className="text-xs font-medium text-brand-500 hover:text-brand-400">
          Détails du match →
        </Link>
        <div className="flex gap-3 text-xs">
          {match.status !== "completed" && (
            <Link to={`/matches/${match.id}/result`} className="text-brand-500 hover:text-brand-400">Résultat</Link>
          )}
          <Link to={`/matches/${match.id}/composition`} className="text-violet-500 hover:text-violet-400">Composition</Link>
        </div>
      </div>
    </div>
  );
}
