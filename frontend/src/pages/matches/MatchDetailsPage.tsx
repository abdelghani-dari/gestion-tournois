import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getCompositions,
  getMatch,
  getRankings,
  getStatistics,
  type ApiComposition,
  type ApiMatch,
  type ApiRanking,
  type ApiStatistic,
  type ApiTeam,
} from "../../api";
import EntityImage from "../../components/common/EntityImage";
import { XPageMeta } from "../../components/common/PageMeta";
import { statusLabel } from "../../components/common/statusLabels";
import { AngleLeftIcon } from "../../icons";
import LandingNav from "../../components/landing/LandingNav";

const STAT_LABELS: Record<string, string> = {
  goal: "Buts",
  assist: "Passes decisives",
  yellow_card: "Cartons jaunes",
  red_card: "Cartons rouges",
  clean_sheet: "Clean sheets",
};

const STAT_SHORT_LABELS: Record<string, string> = {
  goal: "Buts",
  assist: "Passes",
  yellow_card: "Jaunes",
  red_card: "Rouges",
  clean_sheet: "Clean sheets",
};

const STAT_ORDER = ["goal", "assist", "yellow_card", "red_card", "clean_sheet"];

const PLAYER_EVENT_LABELS: Record<string, [string, string]> = {
  goal: ["but", "buts"],
  assist: ["passe decisive", "passes decisives"],
  yellow_card: ["carton jaune", "cartons jaunes"],
  red_card: ["carton rouge", "cartons rouges"],
  clean_sheet: ["clean sheet", "clean sheets"],
};

const STAT_MARKERS: Record<string, string> = {
  goal: "BU",
  assist: "PD",
  yellow_card: "CJ",
  red_card: "CR",
  clean_sheet: "CS",
};

type StatChartItem = {
  type: string;
  label: string;
  home: number;
  away: number;
  total: number;
};

type TopPlayerEvent = {
  key: string;
  player: string;
  team: string;
  type: string;
  label: string;
  value: number;
};

function formatDateTime(date?: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function teamFromMatch(match: ApiMatch | null, side: "home" | "away") {
  if (!match) return null;
  return side === "home"
    ? match.homeTeam ?? match.home_team ?? null
    : match.awayTeam ?? match.away_team ?? null;
}

function teamName(team?: ApiTeam | null, fallbackId?: number | null) {
  return team?.name ?? (fallbackId ? `Equipe #${fallbackId}` : "A determiner");
}

function playerName(compositionOrStat: ApiComposition | ApiStatistic) {
  const player = compositionOrStat.player;
  if (!player) return `Joueur #${compositionOrStat.player_id}`;
  return `${player.first_name} ${player.last_name}`.trim();
}

function statValue(statistic: ApiStatistic) {
  return Number(statistic.value) || 0;
}

function statFillClass(type: string) {
  if (type === "yellow_card") return "bg-amber-400";
  if (type === "red_card") return "bg-red-400";
  if (type === "assist") return "bg-sky-400";
  return "bg-emerald-400";
}

function statSoftClass(type: string) {
  if (type === "yellow_card") return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  if (type === "red_card") return "border-red-300/20 bg-red-400/[0.08] text-red-200";
  if (type === "assist") return "border-sky-300/20 bg-sky-300/[0.08] text-sky-100";
  return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100";
}

function eventCountLabel(type: string, value: number) {
  const labels = PLAYER_EVENT_LABELS[type] ?? [STAT_LABELS[type] ?? type, STAT_LABELS[type] ?? type];
  return `${value} ${value > 1 ? labels[1] : labels[0]}`;
}

function rankingTeamName(ranking: ApiRanking) {
  return ranking.team?.name ?? `Equipe #${ranking.team_id}`;
}

function statisticTeamName(statistic: ApiStatistic, match: ApiMatch | null, home?: ApiTeam | null, away?: ApiTeam | null) {
  if (statistic.team?.name) return statistic.team.name;
  if (match && statistic.team_id === match.home_team_id) return teamName(home, match.home_team_id);
  if (match && statistic.team_id === match.away_team_id) return teamName(away, match.away_team_id);
  return `Equipe #${statistic.team_id}`;
}

function isStarter(composition: ApiComposition) {
  return composition.role === "starter" || composition.is_starter === true || composition.is_starter === 1;
}

function StatusBadge({ value }: { value?: string | null }) {
  const normalized = value?.toLowerCase().trim() ?? "";
  const tone = ["confirmed", "completed", "accepted", "approved", "played", "ready", "active"].includes(normalized)
    ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100"
    : ["refused", "rejected", "cancelled", "canceled", "disputed"].includes(normalized)
      ? "border-red-300/20 bg-red-400/[0.08] text-red-200"
      : "border-slate-600/40 bg-slate-800/70 text-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4 ${tone}`}>
      {statusLabel(value)}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0F172A] p-3">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 truncate text-sm font-semibold text-slate-100" title={value == null ? "-" : String(value)}>
        {value ?? "-"}
      </p>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/35 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-50">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700/70 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

function ScoreSide({
  team,
  fallbackId,
  score,
  winner,
}: {
  team?: ApiTeam | null;
  fallbackId?: number | null;
  score?: number | null;
  winner: boolean;
}) {
  const name = teamName(team, fallbackId);

  return (
    <div className={`rounded-xl border p-4 ${winner ? "border-emerald-300/25 bg-emerald-300/[0.06]" : "border-white/[0.08] bg-slate-950/35"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <EntityImage src={team?.logo_path} name={name} className="h-11 w-11 shrink-0 rounded-lg border-slate-700 bg-slate-800 text-slate-300" />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${winner ? "text-emerald-100" : "text-slate-100"}`} title={name}>
            {name}
          </p>
          <p className={`mt-1 text-xs ${winner ? "text-emerald-300" : "text-slate-500"}`}>{winner ? "Vainqueur" : "Equipe"}</p>
        </div>
        <span className="rounded-lg border border-white/[0.08] bg-slate-950/60 px-3 py-2 font-mono text-3xl font-semibold leading-none tabular-nums text-slate-50">
          {score == null ? "-" : score}
        </span>
      </div>
    </div>
  );
}

function ScoreProgress({
  label,
  value,
  max,
  winner,
}: {
  label: string;
  value: number;
  max: number;
  winner: boolean;
}) {
  const width = value > 0 ? Math.max(8, (value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span className="truncate" title={label}>{label}</span>
        <span className={winner ? "font-semibold text-emerald-200" : "font-mono tabular-nums text-slate-400"}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
        <div
          className={`h-full rounded-full transition-[width] ${winner ? "bg-emerald-400" : "bg-slate-500"}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ScoreComparisonCard({
  match,
  home,
  away,
  homeWinner,
  awayWinner,
  hasScore,
}: {
  match: ApiMatch;
  home?: ApiTeam | null;
  away?: ApiTeam | null;
  homeWinner: boolean;
  awayWinner: boolean;
  hasScore: boolean;
}) {
  const homeName = teamName(home, match.home_team_id);
  const awayName = teamName(away, match.away_team_id);
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;
  const maxScore = Math.max(homeScore, awayScore, 1);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0F172A] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-50">Score du match</h2>
          <p className="mt-1 text-sm text-slate-500">{hasScore ? "Comparaison du score final" : "Match non joue"}</p>
        </div>
        <span className="rounded-full border border-slate-700/70 px-3 py-1 text-xs font-semibold text-slate-400">
          {hasScore ? "Score final" : "Aucun score"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <ScoreSide team={home} fallbackId={match.home_team_id} score={match.home_score} winner={homeWinner} />
        <div className="hidden text-center text-xs font-semibold text-slate-600 md:block">VS</div>
        <ScoreSide team={away} fallbackId={match.away_team_id} score={match.away_score} winner={awayWinner} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <ScoreProgress label={homeName} value={homeScore} max={maxScore} winner={homeWinner} />
        <ScoreProgress label={awayName} value={awayScore} max={maxScore} winner={awayWinner} />
      </div>
    </section>
  );
}

function StatComparisonChart({
  items,
  homeName,
  awayName,
}: {
  items: StatChartItem[];
  homeName: string;
  awayName: string;
}) {
  if (!items.some((item) => item.total > 0)) {
    return <EmptyState>Aucune statistique disponible</EmptyState>;
  }

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0F172A] p-4">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_104px_minmax(0,1fr)] gap-3 text-xs font-medium text-slate-500">
        <span className="truncate text-right" title={homeName}>{homeName}</span>
        <span className="text-center">Statistique</span>
        <span className="truncate" title={awayName}>{awayName}</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const max = Math.max(item.home, item.away, 1);
          const homeWidth = item.home > 0 ? Math.max(7, (item.home / max) * 100) : 0;
          const awayWidth = item.away > 0 ? Math.max(7, (item.away / max) * 100) : 0;

          return (
            <div key={item.type} className="grid grid-cols-[minmax(0,1fr)_104px_minmax(0,1fr)] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-7 shrink-0 text-right font-mono text-xs tabular-nums text-slate-300">{item.home}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/90">
                  <div className={`ml-auto h-full rounded-full ${statFillClass(item.type)}`} style={{ width: `${homeWidth}%` }} />
                </div>
              </div>
              <div className="flex min-w-0 items-center justify-center gap-1.5">
                <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold leading-3 ${statSoftClass(item.type)}`}>
                  {STAT_MARKERS[item.type] ?? "ST"}
                </span>
                <p className="truncate text-center text-xs font-medium text-slate-400" title={item.label}>{item.label}</p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/90">
                  <div className={`h-full rounded-full ${statFillClass(item.type)}`} style={{ width: `${awayWidth}%` }} />
                </div>
                <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-slate-300">{item.away}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatDistributionChart({ items }: { items: StatChartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.total, 0);

  if (total === 0) {
    return <EmptyState>Aucune statistique disponible</EmptyState>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const width = Math.max(5, (item.total / total) * 100);
        const percentage = Math.round((item.total / total) * 100);

        return (
          <div key={item.type} className="flex min-h-[118px] flex-col justify-between rounded-lg border border-white/[0.08] bg-[#0F172A] p-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold leading-3 ${statSoftClass(item.type)}`}>
                {STAT_MARKERS[item.type] ?? "ST"}
              </span>
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-400" title={STAT_SHORT_LABELS[item.type] ?? item.label}>
                {STAT_SHORT_LABELS[item.type] ?? item.label}
              </p>
              <span className={`ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium leading-3 ${statSoftClass(item.type)}`}>
                {percentage}%
              </span>
            </div>

            <div className="py-4">
              <p className="font-mono text-3xl font-semibold leading-none tabular-nums text-slate-50">{item.total}</p>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/90">
              <div className={`h-full rounded-full ${statFillClass(item.type)}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopEventsList({ events }: { events: TopPlayerEvent[] }) {
  if (events.length === 0) {
    return <EmptyState>Aucune statistique disponible</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={event.key} className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[#0F172A] px-3 py-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-slate-950/70 text-xs font-semibold text-slate-400">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100" title={event.player}>{event.player}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500" title={event.team}>{event.team}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${statSoftClass(event.type)}`}>
            {event.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function RankingPreview({
  rankings,
  homeTeamId,
  awayTeamId,
  tournamentId,
}: {
  rankings: ApiRanking[];
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  tournamentId: number;
}) {
  if (rankings.length === 0) {
    return <EmptyState>Classement indisponible</EmptyState>;
  }

  const preview = rankings.slice(0, 5);
  const previewIds = new Set(preview.map((ranking) => ranking.team_id));
  for (const teamId of [homeTeamId, awayTeamId]) {
    if (teamId && !previewIds.has(teamId)) {
      const ranking = rankings.find((item) => item.team_id === teamId);
      if (ranking) {
        preview.push(ranking);
        previewIds.add(teamId);
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-white/[0.08] bg-[#0F172A]/70">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="bg-white/[0.03] text-left text-[11px] text-slate-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Equipe</th>
              <th className="px-3 py-2">J</th>
              <th className="px-3 py-2">V</th>
              <th className="px-3 py-2">N</th>
              <th className="px-3 py-2">D</th>
              <th className="px-3 py-2">Diff.</th>
              <th className="px-3 py-2">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {preview.map((ranking) => {
              const position = rankings.findIndex((item) => item.id === ranking.id) + 1;
              const matchTeam = ranking.team_id === homeTeamId || ranking.team_id === awayTeamId;

              return (
                <tr key={ranking.id} className={matchTeam ? "bg-emerald-300/[0.06] text-slate-100" : "text-slate-300"}>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-500">{position}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-100">{rankingTeamName(ranking)}</span>
                    {matchTeam && <span className="ml-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2 py-0.5 text-[10px] font-medium text-emerald-100">Match</span>}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums">{ranking.played}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{ranking.wins}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{ranking.draws}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{ranking.losses}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">
                    {ranking.goal_difference > 0 ? "+" : ""}
                    {ranking.goal_difference}
                  </td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-50">{ranking.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Link
        to={`/tournaments/${tournamentId}/ranking`}
        className="inline-flex h-8 items-center rounded-lg border border-white/[0.1] bg-slate-900/80 px-3 text-xs font-medium text-slate-200 transition-colors hover:border-blue-400/35 hover:text-white"
      >
        Voir classement complet
      </Link>
    </div>
  );
}

function CompositionList({
  title,
  items,
}: {
  title: string;
  items: ApiComposition[];
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0F172A]">
      <div className="border-b border-white/[0.08] px-3 py-2.5">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      </div>
      {items.length === 0 ? (
        <div className="px-3 py-5 text-xs text-slate-500">Aucune composition disponible</div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {items.map((composition) => (
            <div key={composition.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-100">{playerName(composition)}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {composition.position || "Poste non renseigne"}
                  {composition.shirt_number != null ? ` - #${composition.shirt_number}` : ""}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium ${isStarter(composition) ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100" : "border-slate-600/40 bg-slate-800 text-slate-300"}`}>
                {isStarter(composition) ? "Titulaire" : "Remplacant"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchDetailsPage() {
  const { id } = useParams();
  const [match, setMatch] = useState<ApiMatch | null>(null);
  const [statistics, setStatistics] = useState<ApiStatistic[]>([]);
  const [compositions, setCompositions] = useState<ApiComposition[]>([]);
  const [rankings, setRankings] = useState<ApiRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [compositionError, setCompositionError] = useState("");
  const [rankingError, setRankingError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      if (!id) {
        setError("Match introuvable.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setStatsError("");
      setCompositionError("");
      setRankingError("");

      try {
        const matchData = await getMatch(id);
        if (!active) return;
        setMatch(matchData);

        const [statsResult, compositionsResult, rankingsResult] = await Promise.allSettled([
          getStatistics({ match_game_id: matchData.id }),
          getCompositions({ match_game_id: matchData.id }),
          getRankings(matchData.tournament_id),
        ]);

        if (!active) return;

        if (statsResult.status === "fulfilled") {
          setStatistics(statsResult.value);
        } else {
          setStatistics([]);
          setStatsError(statsResult.reason instanceof Error ? statsResult.reason.message : "Impossible de charger les statistiques.");
        }

        if (compositionsResult.status === "fulfilled") {
          setCompositions(compositionsResult.value);
        } else {
          setCompositions([]);
          setCompositionError(compositionsResult.reason instanceof Error ? compositionsResult.reason.message : "Impossible de charger les compositions.");
        }

        if (rankingsResult.status === "fulfilled") {
          setRankings(rankingsResult.value);
        } else {
          setRankings([]);
          setRankingError(rankingsResult.reason instanceof Error ? rankingsResult.reason.message : "Classement indisponible.");
        }
      } catch (err) {
        if (!active) return;
        setMatch(null);
        setStatistics([]);
        setCompositions([]);
        setRankings([]);
        setError(err instanceof Error ? err.message : "Impossible de charger le match.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [id]);

  const home = teamFromMatch(match, "home");
  const away = teamFromMatch(match, "away");
  const homeScore = match?.home_score ?? 0;
  const awayScore = match?.away_score ?? 0;
  const hasScore = match?.home_score != null && match?.away_score != null;
  const homeWinner = hasScore && homeScore > awayScore;
  const awayWinner = hasScore && awayScore > homeScore;
  const tournamentName = match?.tournament?.name ?? (match ? `Tournoi #${match.tournament_id}` : "Tournoi");

  const statBreakdown = useMemo<StatChartItem[]>(
    () => STAT_ORDER.map((type) => {
      const matchingStats = statistics.filter((statistic) => statistic.stat_type === type);

      return {
        type,
        label: STAT_LABELS[type],
        home: matchingStats
          .filter((statistic) => statistic.team_id === match?.home_team_id)
          .reduce((total, statistic) => total + statValue(statistic), 0),
        away: matchingStats
          .filter((statistic) => statistic.team_id === match?.away_team_id)
          .reduce((total, statistic) => total + statValue(statistic), 0),
        total: matchingStats.reduce((total, statistic) => total + statValue(statistic), 0),
      };
    }),
    [match?.away_team_id, match?.home_team_id, statistics],
  );

  const topPlayerEvents = useMemo<TopPlayerEvent[]>(() => {
    const groupedEvents = new Map<string, TopPlayerEvent>();

    for (const statistic of statistics) {
      const value = statValue(statistic);
      if (value <= 0) continue;

      const type = statistic.stat_type;
      const key = `${statistic.player_id}-${statistic.team_id}-${type}`;
      const existing = groupedEvents.get(key);

      if (existing) {
        existing.value += value;
        existing.label = eventCountLabel(type, existing.value);
      } else {
        groupedEvents.set(key, {
          key,
          player: playerName(statistic),
          team: statisticTeamName(statistic, match, home, away),
          type,
          label: eventCountLabel(type, value),
          value,
        });
      }
    }

    return Array.from(groupedEvents.values())
      .sort((first, second) => second.value - first.value || first.player.localeCompare(second.player))
      .slice(0, 6);
  }, [away, home, match, statistics]);

  const homeCompositions = compositions.filter((composition) => composition.team_id === match?.home_team_id);
  const awayCompositions = compositions.filter((composition) => composition.team_id === match?.away_team_id);

  return (
    <>
      <XPageMeta title={match ? `Match #${match.id}` : "Match"} description="Details publics du match" />

      <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#030712_58%,#020617_100%)] font-sans text-slate-400">
        <LandingNav />

        <main className="mx-auto max-w-7xl px-4 pb-20 pt-[5.5rem] sm:px-6">
          <Link
            to={match ? `/tournaments/${match.tournament_id}` : "/"}
            className="mb-5 inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.1] bg-slate-900/80 px-3 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-400/35 hover:bg-slate-900 hover:text-white"
          >
            <AngleLeftIcon className="size-4" />
            Retour au tournoi
          </Link>

          {loading && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0F172A] px-6 py-16 text-center text-sm text-slate-500">
              Chargement du match...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-300/20 bg-red-400/[0.08] px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && match && (
            <div className="space-y-6">
              <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{tournamentName}</p>
                  <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-50 md:text-4xl">
                    {teamName(home, match.home_team_id)} vs {teamName(away, match.away_team_id)}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDateTime(match.match_date)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={match.status} />
                  <StatusBadge value={match.result_status} />
                </div>
              </header>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                <div className="space-y-6">
                  <ScoreComparisonCard
                    match={match}
                    home={home}
                    away={away}
                    homeWinner={homeWinner}
                    awayWinner={awayWinner}
                    hasScore={hasScore}
                  />

                  <Section title="Comparatif statistiques" description="Lecture rapide des evenements par equipe.">
                    {statsError && <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">{statsError}</div>}
                    <StatComparisonChart
                      items={statBreakdown}
                      homeName={teamName(home, match.home_team_id)}
                      awayName={teamName(away, match.away_team_id)}
                    />
                  </Section>

                  <Section title="Distribution des evenements" description="Poids de chaque type de statistique dans le match.">
                    <StatDistributionChart items={statBreakdown} />
                  </Section>
                </div>

                <aside className="space-y-6">
                  <Section title="Informations du match" description="Donnees principales du tableau.">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard label="Match ID" value={match.id} />
                      <InfoCard label="Tournoi ID" value={match.tournament_id} />
                      <InfoCard label="Date" value={formatDateTime(match.match_date)} />
                      <InfoCard label="Statut" value={statusLabel(match.status)} />
                    </div>
                  </Section>

                  <Section title="Top joueurs / evenements" description="Les faits marquants disponibles.">
                    <TopEventsList events={topPlayerEvents} />
                  </Section>
                </aside>
              </div>

              <Section title="Compositions" description="Joueurs selectionnes pour chaque equipe.">
                {compositionError && <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">{compositionError}</div>}
                {compositions.length === 0 ? (
                  <EmptyState>Aucune composition disponible</EmptyState>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <CompositionList title={teamName(home, match.home_team_id)} items={homeCompositions} />
                    <CompositionList title={teamName(away, match.away_team_id)} items={awayCompositions} />
                  </div>
                )}
              </Section>

              <Section
                title="Classement"
                description="Top 5 du tournoi, avec les equipes de ce match mises en avant."
              >
                {rankingError && <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">{rankingError}</div>}
                <RankingPreview
                  rankings={rankings}
                  homeTeamId={match.home_team_id}
                  awayTeamId={match.away_team_id}
                  tournamentId={match.tournament_id}
                />
              </Section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
