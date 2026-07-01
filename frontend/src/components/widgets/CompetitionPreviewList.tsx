import { Link } from "react-router";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import type { Championship, Tournament, MatchGame } from "../types";

function countTournamentTeams(tournamentId: number, matches: MatchGame[]): number {
  const ids = new Set<number>();
  for (const m of matches) {
    if (m.tournament_id === tournamentId) {
      ids.add(m.home_team_id);
      ids.add(m.away_team_id);
    }
  }
  return ids.size;
}

function statusLabel(status: Championship["status"] | Tournament["status"]) {
  if (status === "active") return "En cours";
  if (status === "completed") return "Terminé";
  return "À venir";
}

function CompetitionRow({
  to,
  logo,
  name,
  teamCount,
  status,
}: {
  to: string;
  logo: string;
  name: string;
  teamCount: number;
  status: Championship["status"] | Tournament["status"];
}) {
  const t = useThemeTokens();

  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        t.border,
        t.navHover
      )}
    >
      <img src={logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate text-sm font-semibold", t.textPrimary)}>{name}</p>
        <p className={clsx("text-xs", t.textMuted)}>
          {teamCount} équipe{teamCount !== 1 ? "s" : ""}
        </p>
      </div>
      <span
        className={clsx(
          "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
          status === "active" && "bg-emerald-500/15 text-emerald-400",
          status === "completed" && clsx(t.metricBg, t.textMuted),
          status === "upcoming" && "bg-amber-500/15 text-amber-400"
        )}
      >
        {statusLabel(status)}
      </span>
    </Link>
  );
}

export function ChampionshipPreviewList() {
  const t = useThemeTokens();
  const { championships, rankings, BOTOLA_LOGO } = useSeasonData();

  const items = useMemo(
    () =>
      championships.map((c) => ({
        ...c,
        teamCount: rankings.filter((r) => r.championship_id === c.id).length,
      })),
    [championships, rankings]
  );

  if (items.length === 0) {
    return <p className={clsx("py-6 text-center text-sm", t.textMuted)}>Aucun championnat.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((c) => (
        <li key={c.id}>
          <CompetitionRow
            to={`/championships/${c.id}`}
            logo={c.logo_url ?? BOTOLA_LOGO}
            name={c.name}
            teamCount={c.teamCount}
            status={c.status}
          />
        </li>
      ))}
    </ul>
  );
}

export function TournamentPreviewList() {
  const t = useThemeTokens();
  const { tournaments, matches, BOTOLA_LOGO } = useSeasonData();

  const items = useMemo(
    () =>
      tournaments.map((tr) => ({
        ...tr,
        teamCount: countTournamentTeams(tr.id, matches),
      })),
    [tournaments, matches]
  );

  if (items.length === 0) {
    return <p className={clsx("py-6 text-center text-sm", t.textMuted)}>Aucun tournoi.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((tr) => (
        <li key={tr.id}>
          <CompetitionRow
            to={`/tournaments/${tr.id}`}
            logo={tr.logo_url ?? BOTOLA_LOGO}
            name={tr.name}
            teamCount={tr.teamCount}
            status={tr.status}
          />
        </li>
      ))}
    </ul>
  );
}
