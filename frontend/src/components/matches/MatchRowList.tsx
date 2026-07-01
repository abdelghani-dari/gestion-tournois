import { Link } from "react-router";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { useXTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { ApiMatch, ApiTeam } from "../../api";
import MediaImage from "../common/MediaImage";
import { resolveTeamLogo } from "../common/teamAssets";

interface MatchRowListProps {
  matches: ApiMatch[];
  teams: ApiTeam[];
  compact?: boolean;
  renderActions?: (match: ApiMatch) => ReactNode;
}

function GlassPill({ children, className }: { children: React.ReactNode; className?: string }) {
  const t = useThemeTokens();
  return (
    <span className={clsx("inline-flex items-center justify-center rounded-md backdrop-blur-md", t.glassBox, className)}>
      {children}
    </span>
  );
}

function teamById(teams: ApiTeam[], teamId?: number | null, embedded?: ApiTeam | null) {
  if (embedded) return embedded;
  if (teamId == null) return undefined;
  return teams.find((team) => team.id === teamId);
}

function teamShortName(team?: ApiTeam) {
  if (!team) return "—";
  if (team.short_name?.trim()) return team.short_name.trim().toUpperCase();
  return team.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDateShort(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function isCompleted(match: ApiMatch) {
  return match.status === "played" || match.status === "completed";
}

function isMatchOverdue(match: ApiMatch) {
  if (match.home_score != null && match.away_score != null) return false;
  if (!match.match_date) return false;
  const started = new Date(match.match_date).getTime();
  if (Number.isNaN(started)) return false;
  return Date.now() - started > 2 * 60 * 60 * 1000;
}

function ScoreCell({ match }: { match: ApiMatch }) {
  const t = useThemeTokens();
  const { theme } = useXTheme();
  const { home_score: home, away_score: away, status } = match;

  if (home != null && away != null) {
    return (
      <GlassPill
        className={clsx(
          "min-w-[3.25rem] px-2.5 py-1 font-mono text-sm font-bold tabular-nums",
          theme === "light" ? "text-gray-950" : "text-white",
        )}
      >
        {home}–{away}
      </GlassPill>
    );
  }

  if (status === "live") {
    return (
      <GlassPill className="min-w-[3.25rem] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
        Live
      </GlassPill>
    );
  }

  return (
    <GlassPill className={clsx("min-w-[3.25rem] px-2.5 py-1 text-[10px] font-bold uppercase", t.textSecondary)}>
      vs
    </GlassPill>
  );
}

function DateTimeCell({ match, overdue }: { match: ApiMatch; overdue: boolean }) {
  const t = useThemeTokens();
  return (
    <div className="w-[3.75rem] shrink-0 text-left leading-tight sm:w-[4.25rem]">
      <p className={clsx("text-[10px] font-medium capitalize", t.textMuted)}>{formatDateShort(match.match_date)}</p>
      <p className={clsx("text-xs font-semibold tabular-nums", t.textSecondary)}>{formatTime(match.match_date)}</p>
      {overdue && (
        <span className="mt-0.5 block whitespace-nowrap text-[8px] font-semibold uppercase tracking-wide text-red-400">
          Résultat à saisir
        </span>
      )}
    </div>
  );
}

function TeamSide({ team, side }: { team?: ApiTeam; side: "home" | "away" }) {
  const t = useThemeTokens();
  const isHome = side === "home";
  const logoSize = "h-10 w-10 sm:h-11 sm:w-11";

  return (
    <div className={clsx("flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5", isHome ? "justify-end" : "justify-start")}>
      {isHome && (
        <>
          <div className="min-w-0 text-right">
            <p className={clsx("truncate text-sm font-semibold uppercase tracking-wide sm:text-base", t.textPrimary)}>{teamShortName(team)}</p>
            <p className={clsx("hidden truncate text-[11px] sm:block", t.textMuted)}>{team?.name ?? "—"}</p>
          </div>
          {team?.logo_path ? (
            <MediaImage src={team.logo_path} fallback={resolveTeamLogo(null)} alt="" className={clsx("shrink-0 object-contain", logoSize)} />
          ) : (
            <div className={clsx("shrink-0 rounded-md bg-white/5", logoSize)} />
          )}
        </>
      )}
      {!isHome && (
        <>
          {team?.logo_path ? (
            <MediaImage src={team.logo_path} fallback={resolveTeamLogo(null)} alt="" className={clsx("shrink-0 object-contain", logoSize)} />
          ) : (
            <div className={clsx("shrink-0 rounded-md bg-white/5", logoSize)} />
          )}
          <div className="min-w-0">
            <p className={clsx("truncate text-sm font-semibold uppercase tracking-wide sm:text-base", t.textPrimary)}>{teamShortName(team)}</p>
            <p className={clsx("hidden truncate text-[11px] sm:block", t.textMuted)}>{team?.name ?? "—"}</p>
          </div>
        </>
      )}
    </div>
  );
}

function RowActions({ match, finished, renderActions }: { match: ApiMatch; finished: boolean; renderActions?: (match: ApiMatch) => ReactNode }) {
  const t = useThemeTokens();
  return (
    <div className="ml-auto flex shrink-0 flex-row flex-nowrap items-center justify-end gap-2">
      <Link
        to={`/matches/${match.id}`}
        className={clsx(
          "inline-flex shrink-0 items-center justify-center rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
          finished ? clsx(t.metricBg, t.textMuted, "border-transparent") : clsx(t.border, t.textSecondary, t.navHover),
        )}
      >
        Détails
      </Link>
      {renderActions?.(match)}
    </div>
  );
}

function rowStripeClass(index: number) {
  return index % 2 === 0 ? "bg-black/[0.008] dark:bg-white/[0.012]" : "bg-black/[0.018] dark:bg-white/[0.022]";
}

export default function MatchRowList({ matches, teams, compact = false, renderActions }: MatchRowListProps) {
  const t = useThemeTokens();
  const rowPad = compact ? "py-2.5" : "py-3";

  if (matches.length === 0) {
    return <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucun match disponible.</p>;
  }

  return (
    <div className="x-scroll overflow-x-auto">
      <div className="min-w-[720px] space-y-1">
        {matches.map((match, index) => {
          const home = teamById(teams, match.home_team_id, match.home_team ?? match.homeTeam ?? undefined);
          const away = teamById(teams, match.away_team_id, match.away_team ?? match.awayTeam ?? undefined);
          const finished = isCompleted(match);
          const overdue = isMatchOverdue(match);

          return (
            <div key={match.id} className="px-2 sm:px-3">
              <div
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-2 transition-colors sm:gap-3",
                  rowPad,
                  rowStripeClass(index),
                  "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
                )}
              >
                <DateTimeCell match={match} overdue={overdue} />
                <TeamSide team={home} side="home" />
                <div className="flex w-[4.5rem] shrink-0 justify-center px-1">
                  <ScoreCell match={match} />
                </div>
                <TeamSide team={away} side="away" />
                <RowActions match={match} finished={finished} renderActions={renderActions} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
