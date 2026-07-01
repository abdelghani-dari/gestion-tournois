import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import StatusBadge from "../common/StatusBadge";
import { PAGE_GAP, GRID_GAP } from "../common/PageStack";

interface BracketMatch {
  id: number;
  homeId: number;
  awayId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

function buildBracketRounds(teams: ReturnType<typeof useSeasonData>["teams"], matches: ReturnType<typeof useSeasonData>["matches"]) {
  const pool = teams.slice(0, Math.min(8, teams.length));
  const quarterPairs = [
    [pool[0], pool[7]],
    [pool[1], pool[6]],
    [pool[2], pool[5]],
    [pool[3], pool[4]],
  ].filter(([h, a]) => h && a) as [typeof pool[0], typeof pool[0]][];

  const qf: BracketMatch[] = quarterPairs.map(([h, a], i) => {
    const m = matches[i];
    return {
      id: i + 1,
      homeId: h.id,
      awayId: a.id,
      homeScore: m?.home_score ?? null,
      awayScore: m?.away_score ?? null,
      status: m?.status ?? "scheduled",
    };
  });

  const sf: BracketMatch[] = pool.length >= 4 ? [
    { id: 5, homeId: pool[0].id, awayId: pool[2].id, homeScore: 2, awayScore: 1, status: "completed" },
    { id: 6, homeId: pool[1].id, awayId: pool[3].id, homeScore: null, awayScore: null, status: "scheduled" },
  ] : [];

  const final: BracketMatch[] = pool.length >= 2 ? [
    { id: 7, homeId: pool[0].id, awayId: pool[1].id, homeScore: null, awayScore: null, status: "upcoming" },
  ] : [];

  return [
    { name: "Quarts de finale", matches: qf },
    { name: "Demi-finales", matches: sf },
    { name: "Finale", matches: final },
  ].filter((r) => r.matches.length > 0);
}

function BracketMatchCard({ match }: { match: BracketMatch }) {
  const t = useThemeTokens();
  const { getTeamById } = useSeasonData();
  const home = getTeamById(match.homeId);
  const away = getTeamById(match.awayId);
  const homeWins = match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
  const awayWins = match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;

  return (
    <div className={clsx("rounded-md border p-3", t.card)}>
      <div className="mb-2 flex items-center justify-between">
        <StatusBadge status={match.status} />
        {match.homeScore !== null && (
          <span className={clsx("font-mono text-xs font-bold", t.textPrimary)}>
            {match.homeScore} – {match.awayScore}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {[home, away].map((team, idx) => {
          const wins = idx === 0 ? homeWins : awayWins;
          const score = idx === 0 ? match.homeScore : match.awayScore;
          return (
            <div key={team?.id ?? idx} className={clsx("flex items-center gap-2 rounded-sm px-2 py-1.5", wins && t.metricBg)}>
              <img src={team?.logo_url} alt="" className="h-6 w-6 object-contain" />
              <span className={clsx("flex-1 truncate text-xs font-medium", t.textPrimary)}>{team?.name}</span>
              {score !== null && <span className={clsx("font-mono text-xs font-bold", t.textPrimary)}>{score}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TournamentBracket() {
  const t = useThemeTokens();
  const { teams, matches, tournaments, BOTOLA_LOGO } = useSeasonData();
  const rounds = buildBracketRounds(teams, matches);
  const winner = teams[0];

  return (
    <div className={clsx("flex flex-col", PAGE_GAP)}>
      <div className={clsx("grid grid-cols-1 sm:grid-cols-3", GRID_GAP)}>
        <div className={clsx("rounded-md border p-4", t.card)}>
          <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Clubs</p>
          <p className={clsx("mt-1 text-2xl font-bold", t.textPrimary)}>{teams.length}</p>
        </div>
        <div className={clsx("rounded-md border p-4", t.card)}>
          <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Tournois</p>
          <p className={clsx("mt-1 text-2xl font-bold", t.textPrimary)}>{tournaments.length}</p>
        </div>
        <div className={clsx("rounded-md border p-4", t.card)}>
          <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Vainqueur</p>
          <div className="mt-2 flex items-center gap-3">
            <img src={BOTOLA_LOGO} alt="" className="h-8 w-8 object-contain opacity-60" />
            <span className={clsx("text-sm font-medium", t.textMuted)}>À déterminer</span>
          </div>
        </div>
      </div>

      <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
        {rounds.map((round) => (
          <div key={round.name} className={clsx("rounded-md border p-5", t.panelGlass)}>
            <h4 className={clsx("mb-4 text-sm font-semibold", t.textPrimary)}>{round.name}</h4>
            <div className="space-y-3">
              {round.matches.map((m) => (
                <BracketMatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {winner && (
        <div className={clsx("flex items-center gap-4 rounded-md border p-5", t.panelGlass)}>
          <img src={winner.logo_url} alt="" className="h-14 w-14 object-contain" />
          <div>
            <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Favori</p>
            <p className={clsx("text-lg font-bold", t.textPrimary)}>{winner.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
