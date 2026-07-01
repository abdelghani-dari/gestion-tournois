import { clsx } from "clsx";
import MediaImage from "../common/MediaImage";
import { resolveTeamLogo } from "../common/teamAssets";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { ApiTeam } from "../../api";

function teamShort(team?: ApiTeam | null) {
  if (!team) return "—";
  if (team.short_name?.trim()) return team.short_name.trim().toUpperCase();
  return team.name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function TeamChip({ team, side }: { team?: ApiTeam | null; side?: "home" | "away" }) {
  const t = useThemeTokens();
  const logoSize = side ? "h-5 w-5" : "h-6 w-6";

  return (
    <span className={clsx("flex min-w-0 flex-1 items-center gap-1.5", side === "away" && "justify-end text-right")}>
      {side !== "away" && (
        <MediaImage
          src={team?.logo_path}
          fallback={resolveTeamLogo(null)}
          alt=""
          className={clsx("shrink-0 object-contain", logoSize)}
        />
      )}
      <span className={clsx("truncate text-xs font-semibold uppercase tracking-wide", t.textPrimary)}>
        {teamShort(team)}
      </span>
      {side === "away" && (
        <MediaImage
          src={team?.logo_path}
          fallback={resolveTeamLogo(null)}
          alt=""
          className={clsx("shrink-0 object-contain", logoSize)}
        />
      )}
    </span>
  );
}

export default function MatchSelectRow({
  home,
  away,
  matchId,
  compact = false,
}: {
  home?: ApiTeam | null;
  away?: ApiTeam | null;
  matchId?: number;
  compact?: boolean;
}) {
  const t = useThemeTokens();

  return (
    <span className={clsx("flex w-full min-w-0 items-center gap-2", compact ? "text-xs" : "text-sm")}>
      {matchId != null && (
        <span className={clsx("shrink-0 font-mono text-[10px]", t.textMuted)}>#{matchId}</span>
      )}
      <TeamChip team={home} side="home" />
      <span className={clsx("shrink-0 px-0.5 text-[10px] font-bold uppercase", t.textMuted)}>vs</span>
      <TeamChip team={away} side="away" />
    </span>
  );
}
