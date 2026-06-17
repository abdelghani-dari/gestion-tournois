import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import { getTeamShortName } from "../data/fotmobData";
import type { MatchGame, Team } from "../types";

interface MatchRowListProps {
  matches: MatchGame[];
  compact?: boolean;
  fill?: boolean;
}

function GlassPill({ children, className }: { children: React.ReactNode; className?: string }) {
  const t = useThemeTokens();
  return (
    <span className={clsx("inline-flex items-center justify-center rounded-md backdrop-blur-md", t.glassBox, className)}>
      {children}
    </span>
  );
}

function ScoreCell({ home, away, status }: { home: number | null; away: number | null; status: MatchGame["status"] }) {
  const t = useThemeTokens();

  if (home !== null && away !== null) {
    return (
      <GlassPill className="min-w-[3.25rem] px-2.5 py-1 font-mono text-sm font-bold tabular-nums">
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

function DateTimeCell({ date, time }: { date: string; time: string }) {
  const t = useThemeTokens();
  return (
    <div className="w-[3.5rem] shrink-0 text-left leading-tight sm:w-[4rem]">
      <p className={clsx("text-[10px] font-medium capitalize", t.textMuted)}>{date}</p>
      <p className={clsx("text-xs font-semibold tabular-nums", t.textSecondary)}>{time}</p>
    </div>
  );
}

function TeamSide({ team, side }: { team?: Team; side: "home" | "away" }) {
  const t = useThemeTokens();
  const isHome = side === "home";
  const short = team ? getTeamShortName(team.name) : "—";
  const logoSize = "h-10 w-10 sm:h-11 sm:w-11";

  return (
    <div
      className={clsx(
        "flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5",
        isHome ? "justify-end" : "justify-start"
      )}
    >
      {isHome && (
        <>
          <div className="min-w-0 text-right">
            <p className={clsx("hidden truncate text-sm font-semibold sm:block", t.textPrimary)}>
              {team?.name ?? "—"}
            </p>
            <p className={clsx("text-[11px] font-bold uppercase tracking-wide sm:text-[10px]", t.textMuted)}>
              {short}
            </p>
          </div>
          <img src={team?.logo_url} alt="" className={clsx("shrink-0 object-contain", logoSize)} />
        </>
      )}
      {!isHome && (
        <>
          <img src={team?.logo_url} alt="" className={clsx("shrink-0 object-contain", logoSize)} />
          <div className="min-w-0">
            <p className={clsx("hidden truncate text-sm font-semibold sm:block", t.textPrimary)}>
              {team?.name ?? "—"}
            </p>
            <p className={clsx("text-[11px] font-bold uppercase tracking-wide sm:text-[10px]", t.textMuted)}>
              {short}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function DetailsLink({ matchId, finished }: { matchId: number; finished: boolean }) {
  const t = useThemeTokens();
  return (
    <Link
      to={`/matches/${matchId}`}
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
        finished
          ? clsx(t.metricBg, t.textMuted, "border-transparent")
          : clsx(t.border, t.textSecondary, t.navHover)
      )}
    >
      Détails
    </Link>
  );
}

export default function MatchRowList({ matches, compact = false, fill = false }: MatchRowListProps) {
  const t = useThemeTokens();
  const { getTeamById, formatMatchDateShort, formatMatchTime } = useSeasonData();

  if (matches.length === 0) {
    return <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucun match disponible.</p>;
  }

  const rowPad = compact ? "py-2.5" : "py-3";

  const renderRow = (match: MatchGame, stretch = false) => {
    const home = getTeamById(match.home_team_id);
    const away = getTeamById(match.away_team_id);
    const finished = match.status === "completed";

    return (
      <div
        className={clsx(
          "group flex items-center gap-2 transition-colors sm:gap-3",
          rowPad,
          stretch && "flex-1",
          t.tableRow,
          t.navHover
        )}
      >
        <DateTimeCell
          date={formatMatchDateShort(match.match_date)}
          time={formatMatchTime(match.match_date)}
        />

        <TeamSide team={home} side="home" />

        <div className="flex w-[4.5rem] shrink-0 justify-center px-1">
          <ScoreCell home={match.home_score} away={match.away_score} status={match.status} />
        </div>

        <TeamSide team={away} side="away" />

        <div className="hidden w-[4.5rem] shrink-0 justify-end sm:flex">
          <DetailsLink matchId={match.id} finished={finished} />
        </div>
      </div>
    );
  };

  if (fill) {
    return (
      <div className={clsx("flex min-h-0 flex-1 flex-col divide-y", t.tableDivide)}>
        {matches.map((match) => (
          <div key={match.id} className="flex min-h-0 flex-1 flex-col">
            {renderRow(match, true)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="x-scroll overflow-x-auto">
      <div className={clsx("min-w-[540px] divide-y", t.tableDivide)}>
        {matches.map((match) => (
          <div key={match.id}>{renderRow(match)}</div>
        ))}
      </div>
    </div>
  );
}
