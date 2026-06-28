import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ApiError,
  confirmMatchResult,
  getTournamentBracket,
  type ApiMatch,
  type ApiTeam,
  type TournamentBracket,
} from "../../api";
import Button from "../../components/common/Button";
import EntityImage from "../../components/common/EntityImage";
import { XPageMeta } from "../../components/common/PageMeta";
import { statusLabel } from "../../components/common/statusLabels";
import { useAuth } from "../../context/AuthContext";
import { AngleLeftIcon } from "../../icons";
import { LandingNav } from "../landing/LandingPage";

type BracketMetrics = {
  roundWidth: number;
  roundGap: number;
  matchCardHeight: number;
  matchCenterGap: number;
  headerHeight: number;
  championWidth: number;
  championCardHeight: number;
  minCanvasWidth: number;
  rightGutter: number;
  bottomPadding: number;
};

const MOBILE_METRICS: BracketMetrics = {
  roundWidth: 188,
  roundGap: 44,
  matchCardHeight: 118,
  matchCenterGap: 132,
  headerHeight: 52,
  championWidth: 188,
  championCardHeight: 118,
  minCanvasWidth: 1120,
  rightGutter: 96,
  bottomPadding: 20,
};

const DESKTOP_COMPACT_METRICS: BracketMetrics = {
  roundWidth: 180,
  roundGap: 18,
  matchCardHeight: 118,
  matchCenterGap: 132,
  headerHeight: 52,
  championWidth: 180,
  championCardHeight: 118,
  minCanvasWidth: 0,
  rightGutter: 0,
  bottomPadding: 20,
};

const DESKTOP_WIDE_METRICS: BracketMetrics = {
  roundWidth: 190,
  roundGap: 24,
  matchCardHeight: 118,
  matchCenterGap: 132,
  headerHeight: 52,
  championWidth: 190,
  championCardHeight: 118,
  minCanvasWidth: 0,
  rightGutter: 0,
  bottomPadding: 20,
};

const DESKTOP_LARGE_METRICS: BracketMetrics = {
  roundWidth: 200,
  roundGap: 28,
  matchCardHeight: 118,
  matchCenterGap: 132,
  headerHeight: 52,
  championWidth: 200,
  championCardHeight: 118,
  minCanvasWidth: 0,
  rightGutter: 0,
  bottomPadding: 20,
};

function metricsForViewport(width: number) {
  if (width >= 1536) return DESKTOP_LARGE_METRICS;
  if (width >= 1280) return DESKTOP_WIDE_METRICS;
  if (width >= 1024) return DESKTOP_COMPACT_METRICS;
  return MOBILE_METRICS;
}

function useBracketMetrics() {
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === "undefined" ? 1280 : window.innerWidth
  ));

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return useMemo(() => metricsForViewport(viewportWidth), [viewportWidth]);
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeTone(value?: string | null) {
  const normalized = value?.toLowerCase().trim() ?? "";

  if (["confirmed", "completed", "accepted", "approved", "played", "ready"].includes(normalized)) {
    return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100";
  }

  if (["refused", "rejected", "cancelled", "canceled", "disputed"].includes(normalized)) {
    return "border-red-300/20 bg-red-400/[0.08] text-red-200";
  }

  return "border-slate-600/40 bg-slate-800/70 text-slate-300";
}

function StatusBadge({ value }: { value?: string | null }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4 ${statusBadgeTone(value)}`}>
      {statusLabel(value)}
    </span>
  );
}

function MatchStatusBadge({ match }: { match: ApiMatch }) {
  const normalizedStatus = match.status?.toLowerCase().trim() ?? "";
  const normalizedResult = match.result_status?.toLowerCase().trim() ?? "";
  const normalizedBracket = match.bracket_status?.toLowerCase().trim() ?? "";
  const isFinished = Boolean(match.winner_team_id)
    || normalizedResult === "confirmed"
    || normalizedBracket === "completed"
    || ["played", "completed"].includes(normalizedStatus);
  const hasTeams = Boolean(match.home_team_id && match.away_team_id);
  const isUpcoming = hasTeams && (
    Boolean(match.match_date)
    || ["scheduled", "upcoming"].includes(normalizedStatus)
    || normalizedBracket === "ready"
  );

  if (isFinished) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2 py-0.5 text-[10px] font-medium leading-4 text-emerald-100">
        Terminé
      </span>
    );
  }

  if (isUpcoming) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-600/40 bg-slate-800/70 px-2 py-0.5 text-[10px] font-medium leading-4 text-slate-300">
        À venir
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-slate-600/40 bg-slate-800/70 px-2 py-0.5 text-[10px] font-medium leading-4 text-slate-300">
      En attente
    </span>
  );
}

function homeTeam(match: ApiMatch) {
  return match.homeTeam ?? match.home_team ?? null;
}

function awayTeam(match: ApiMatch) {
  return match.awayTeam ?? match.away_team ?? null;
}

function winnerTeam(match?: ApiMatch | null) {
  if (!match) return null;
  if (match.winnerTeam) return match.winnerTeam;
  if (match.winner_team) return match.winner_team;
  if (match.winner_team_id === match.home_team_id) return homeTeam(match);
  if (match.winner_team_id === match.away_team_id) return awayTeam(match);
  return null;
}

function slotLabel(team: ApiTeam | null, teamId?: number | null) {
  if (team?.name) return team.name;
  if (teamId) return `Equipe #${teamId}`;
  return "A determiner";
}

function scoreValue(score?: number | null) {
  return score == null ? "-" : String(score);
}

function roundDisplayName(roundIndex: number, totalRounds: number, fallback: string) {
  const labelsFromFinal = ["Final", "Semi-finals", "Quarter-finals", "Round of 16", "Round of 32", "Round of 64"];
  const label = labelsFromFinal[totalRounds - roundIndex - 1];
  return label ?? fallback;
}

function canConfirm(match: ApiMatch) {
  return match.status === "played"
    && match.result_status === "pending"
    && match.home_score != null
    && match.away_score != null
    && match.home_team_id != null
    && match.away_team_id != null;
}

function TeamSlot({
  team,
  teamId,
  score,
  winner,
}: {
  team: ApiTeam | null;
  teamId?: number | null;
  score?: number | null;
  winner: boolean;
}) {
  const label = slotLabel(team, teamId);
  const pending = !team?.name && !teamId;

  return (
    <div className={`flex h-7 items-center justify-between gap-2 rounded border px-2 ${winner ? "border-emerald-300/20 bg-emerald-400/[0.08] text-emerald-100" : "border-[rgba(148,163,184,0.14)] bg-slate-900/75 text-slate-200"}`}>
      <span className="flex min-w-0 items-center gap-1.5">
        <EntityImage
          src={team?.logo_path}
          name={label}
          className="h-4 w-4 shrink-0 rounded border border-slate-700 bg-slate-800 text-[9px] text-slate-300"
        />
        <span className={`truncate text-xs font-medium ${pending ? "italic text-slate-500" : ""}`} title={label}>{label}</span>
      </span>
      <span className="ml-auto flex h-5 min-w-6 shrink-0 items-center justify-end rounded bg-black/20 px-1.5 text-right font-mono text-xs font-semibold tabular-nums text-slate-100">
        {scoreValue(score)}
      </span>
    </div>
  );
}

type MatchBox = {
  match: ApiMatch;
  roundIndex: number;
  x: number;
  top: number;
  centerY: number;
};

type Connector = {
  id: string;
  sourceX: number;
  sourceY: number;
  midX: number;
  targetX: number;
  targetY: number;
  completed: boolean;
};

function sortMatches(matches: ApiMatch[]) {
  return [...matches].sort((a, b) => {
    const positionA = a.bracket_position ?? a.id;
    const positionB = b.bracket_position ?? b.id;
    return positionA - positionB;
  });
}

function buildBracketLayout(rounds: TournamentBracket["rounds"], metrics: BracketMetrics) {
  const normalizedRounds = rounds
    .filter((round) => round.matches.length > 0)
    .map((round, roundIndex) => ({
      ...round,
      roundIndex,
      x: roundIndex * (metrics.roundWidth + metrics.roundGap),
      matches: sortMatches(round.matches),
    }));

  const matchBoxes = new Map<number, MatchBox>();

  normalizedRounds.forEach((round) => {
    const spacing = metrics.matchCenterGap * Math.pow(2, round.roundIndex);
    const offset = (spacing - metrics.matchCenterGap) / 2;

    round.matches.forEach((match, index) => {
      const centerY = (metrics.matchCardHeight / 2) + offset + (index * spacing);
      matchBoxes.set(match.id, {
        match,
        roundIndex: round.roundIndex,
        x: round.x,
        top: metrics.headerHeight + centerY - (metrics.matchCardHeight / 2),
        centerY,
      });
    });
  });

  const connectors: Connector[] = [];

  matchBoxes.forEach((box) => {
    if (!box.match.next_match_id) return;

    const target = matchBoxes.get(box.match.next_match_id);
    if (!target) return;

    const sourceX = box.x + metrics.roundWidth;
    const targetX = target.x;
    const sourceY = metrics.headerHeight + box.centerY;
    const targetY = metrics.headerHeight + target.centerY;

    connectors.push({
      id: `${box.match.id}-${box.match.next_match_id}`,
      sourceX,
      sourceY,
      targetX,
      targetY,
      midX: sourceX + ((targetX - sourceX) / 2),
      completed: box.match.bracket_status === "completed" || box.match.result_status === "confirmed",
    });
  });

  const finalRound = normalizedRounds[normalizedRounds.length - 1] ?? null;
  const finalMatch = finalRound?.matches[0] ?? null;
  const finalBox = finalMatch ? matchBoxes.get(finalMatch.id) ?? null : null;
  const championX = normalizedRounds.length * (metrics.roundWidth + metrics.roundGap);
  const championCenterY = finalBox?.centerY ?? metrics.matchCardHeight / 2;
  const championTop = metrics.headerHeight + championCenterY - (metrics.championCardHeight / 2);

  if (finalBox) {
    const sourceX = finalBox.x + metrics.roundWidth;
    const targetX = championX;
    const sourceY = metrics.headerHeight + finalBox.centerY;
    const targetY = metrics.headerHeight + championCenterY;

    connectors.push({
      id: `champion-${finalMatch?.id ?? "pending"}`,
      sourceX,
      sourceY,
      targetX,
      targetY,
      midX: sourceX + ((targetX - sourceX) / 2),
      completed: Boolean(finalMatch?.winner_team_id),
    });
  }

  const maxMatchBottom = Math.max(
    metrics.matchCardHeight,
    ...Array.from(matchBoxes.values()).map((box) => box.centerY + (metrics.matchCardHeight / 2)),
    championCenterY + (metrics.championCardHeight / 2),
  );

  return {
    rounds: normalizedRounds,
    matchBoxes,
    connectors,
    finalMatch,
    championX,
    championTop,
    width: Math.max(metrics.minCanvasWidth, championX + metrics.championWidth + metrics.rightGutter),
    height: metrics.headerHeight + maxMatchBottom + metrics.bottomPadding,
  };
}

function ConnectorLine({ connector }: { connector: Connector }) {
  const tone = connector.completed ? "bg-emerald-300/30" : "bg-slate-500/25";
  const verticalTop = Math.min(connector.sourceY, connector.targetY);
  const verticalHeight = Math.max(1, Math.abs(connector.targetY - connector.sourceY));

  return (
    <>
      <div className={`absolute z-0 h-px ${tone}`} style={{ left: connector.sourceX, top: connector.sourceY, width: connector.midX - connector.sourceX }} />
      <div className={`absolute z-0 w-px ${tone}`} style={{ left: connector.midX, top: verticalTop, height: verticalHeight }} />
      <div className={`absolute z-0 h-px ${tone}`} style={{ left: connector.midX, top: connector.targetY, width: connector.targetX - connector.midX }} />
      <div
        className={`absolute z-[1] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#020617] ${tone}`}
        style={{ left: connector.targetX, top: connector.targetY }}
      />
    </>
  );
}

function ChampionCard({
  match,
  width,
  height,
}: {
  match?: ApiMatch | null;
  width: number;
  height: number;
}) {
  const champion = winnerTeam(match);
  const label = slotLabel(champion, match?.winner_team_id);

  return (
    <aside
      data-bracket-champion="true"
      className="h-full rounded-lg border border-amber-300/40 bg-[#0F172A] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
      style={{ width, height }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold text-amber-200">Trophée champion</p>
        <span className="rounded-full border border-amber-300/20 px-2 py-0.5 text-[10px] font-medium text-amber-100">
          Finale
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <EntityImage
          src={champion?.logo_path}
          name={label}
          className="h-9 w-9 shrink-0 rounded-md border-amber-300/30 bg-amber-300/[0.08] text-xs text-amber-100"
        />
        <div className="min-w-0">
          <h3 className={`truncate text-sm font-semibold text-slate-50 ${champion ? "" : "text-slate-500"}`} title={label}>
            {label}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-300">
            {match ? `Score final ${scoreValue(match.home_score)}-${scoreValue(match.away_score)}` : "Finale en attente"}
          </p>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-slate-500">
        <span>{formatDate(match?.match_date)}</span>
      </div>
    </aside>
  );
}

function MatchCard({
  match,
  style,
  isAuthenticated,
  working,
  onConfirm,
  onOpen,
}: {
  match: ApiMatch;
  style: CSSProperties;
  isAuthenticated: boolean;
  working: boolean;
  onConfirm: (match: ApiMatch) => void;
  onOpen: (match: ApiMatch) => void;
}) {
  const home = homeTeam(match);
  const away = awayTeam(match);
  const winnerId = match.winner_team_id;
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(match);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Voir details du match ${match.bracket_position ?? match.id}`}
      onClick={() => onOpen(match)}
      onKeyDown={handleKeyDown}
      className="group absolute z-10 cursor-pointer rounded-lg border border-[rgba(148,163,184,0.18)] bg-[#0F172A] p-2.5 shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition-all hover:border-blue-300/35 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_14px_30px_rgba(0,0,0,0.26)] focus:outline-none focus-visible:border-blue-300/50 focus-visible:shadow-[0_0_0_2px_rgba(59,130,246,0.28)]"
      style={style}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-400">
            Match {match.bracket_position ?? match.id}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-slate-600">
            {formatDate(match.match_date)}
          </p>
        </div>
        <MatchStatusBadge match={match} />
      </div>

      <div className="space-y-1.5">
        <TeamSlot team={home} teamId={match.home_team_id} score={match.home_score} winner={winnerId != null && winnerId === match.home_team_id} />
        <TeamSlot team={away} teamId={match.away_team_id} score={match.away_score} winner={winnerId != null && winnerId === match.away_team_id} />
      </div>

      {isAuthenticated && canConfirm(match) && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={working}
          onClick={(event) => {
            event.stopPropagation();
            onConfirm(match);
          }}
          className="mt-2 h-6 w-full rounded border-slate-700 bg-slate-900 px-2 py-0 text-[11px] text-slate-100 hover:bg-slate-800"
        >
          {working ? "Confirmation..." : "Confirmer resultat"}
        </Button>
      )}
      <span className="pointer-events-none absolute bottom-2 right-2 text-[10px] font-medium text-blue-200/0 transition-colors group-hover:text-blue-200/80">
        Voir details
      </span>
    </article>
  );
}

export default function TournamentBracketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBracket = async () => {
    if (!id) {
      setError("Tournoi introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      setBracket(await getTournamentBracket(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le bracket.");
      setBracket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBracket();
  }, [id]);

  const handleConfirm = async (match: ApiMatch) => {
    setWorkingId(match.id);
    setError("");
    setSuccess("");

    try {
      await confirmMatchResult(match.id);
      setSuccess("Resultat confirme. Le gagnant a ete avance.");
      await loadBracket();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Connexion requise pour confirmer le resultat.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de confirmer le resultat.");
      }
    } finally {
      setWorkingId(null);
    }
  };

  const tournament = bracket?.tournament;
  const metrics = useBracketMetrics();
  const layout = useMemo(() => buildBracketLayout(bracket?.rounds ?? [], metrics), [bracket, metrics]);
  const openMatchDetails = (match: ApiMatch) => {
    navigate(`/matches/${match.id}`);
  };

  return (
    <>
      <XPageMeta title={tournament?.name ? `${tournament.name} - Bracket` : "Bracket"} description="Tableau à élimination directe" />

      <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#030712_58%,#020617_100%)] font-sans text-slate-400">
        <LandingNav />

        <main className="mx-auto max-w-7xl px-4 pb-20 pt-[5.5rem] sm:px-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link
                to={id ? `/tournaments/${id}` : "/"}
                className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-200"
              >
                <AngleLeftIcon className="size-4" />
                Retour au tournoi
              </Link>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-50 md:text-4xl" title={tournament?.name ?? "Bracket"}>
                {tournament?.name ?? "Bracket"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">Tableau à élimination directe</p>
            </div>

            {tournament && (
              <div className="flex shrink-0 flex-wrap gap-2">
                <StatusBadge value={tournament.status} />
                <StatusBadge value={tournament.approval_status} />
              </div>
            )}
          </div>

          {(error || success) && (
            <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${error ? "border-red-300/20 bg-red-400/[0.08] text-red-200" : "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100"}`}>
              {error || success}
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-white/[0.08] bg-[#0F172A] px-6 py-16 text-center text-sm text-slate-500">
              Chargement du bracket...
            </div>
          )}

          {!loading && !error && bracket && bracket.rounds.length === 0 && (
            <div className="rounded-lg border border-white/[0.08] bg-[#0F172A] px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-300">Aucun bracket genere pour ce tournoi.</p>
              <p className="mt-2 text-xs text-slate-600">Le tableau apparaitra apres generation par l'organisateur ou un admin.</p>
            </div>
          )}

          {!loading && bracket && bracket.rounds.length > 0 && (
            <>
              <p className="mb-3 text-xs font-medium text-slate-500 lg:hidden">
                Faites défiler horizontalement pour voir tout l'arbre
              </p>
              <div data-bracket-scroll="true" className="-mx-4 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth px-4 pb-8 pt-1 [scrollbar-color:#475569_#020617] [scrollbar-gutter:stable] [scrollbar-width:thin] sm:mx-0 sm:px-0 lg:overflow-x-visible">
                <div
                  data-bracket-canvas="true"
                  className="relative grid shrink-0"
                  style={{
                    gridTemplateColumns: `${layout.rounds.map(() => `${metrics.roundWidth}px`).join(" ")} ${metrics.championWidth}px`,
                    columnGap: metrics.roundGap,
                    minWidth: layout.width,
                    width: layout.width,
                    height: layout.height,
                  }}
                >
                  <div className="absolute inset-x-0 z-0 h-px bg-slate-700/20" style={{ top: metrics.headerHeight - 1 }} />

                  {layout.connectors.map((connector) => (
                    <ConnectorLine key={connector.id} connector={connector} />
                  ))}

                  {layout.rounds.map((round, index) => {
                    const roundTitle = roundDisplayName(index, layout.rounds.length, round.name);

                    return (
                      <section key={round.round_number} className="relative z-10" style={{ width: metrics.roundWidth, height: layout.height }}>
                        <div className="absolute top-0 w-full">
                          <h2 className="truncate text-sm font-semibold text-slate-100" title={roundTitle}>{roundTitle}</h2>
                          <p className="mt-1 text-[11px] text-slate-600">
                            {round.matches.length} match{round.matches.length > 1 ? "s" : ""}
                          </p>
                        </div>

                        {round.matches.map((match) => {
                          const box = layout.matchBoxes.get(match.id);
                          if (!box) return null;

                          return (
                            <MatchCard
                              key={match.id}
                              match={match}
                              isAuthenticated={isAuthenticated}
                              working={workingId === match.id}
                              onConfirm={handleConfirm}
                              onOpen={openMatchDetails}
                              style={{
                                left: 0,
                                top: box.top,
                                width: metrics.roundWidth,
                                height: metrics.matchCardHeight,
                              }}
                            />
                          );
                        })}
                      </section>
                    );
                  })}

                  <section className="relative z-10" style={{ width: metrics.championWidth, height: layout.height }}>
                    <div className="absolute top-0 w-full">
                      <h2 className="truncate text-sm font-semibold text-amber-100">Champion</h2>
                      <p className="mt-1 text-[11px] text-slate-600">Vainqueur final</p>
                    </div>

                    <div className="absolute z-10" style={{ left: 0, top: layout.championTop }}>
                      <ChampionCard match={layout.finalMatch} width={metrics.championWidth} height={metrics.championCardHeight} />
                    </div>
                  </section>

                  {metrics.rightGutter > 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute bottom-0 top-0 border-l border-dashed border-slate-700/40"
                      style={{ left: layout.championX + metrics.championWidth + (metrics.rightGutter / 2) }}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
