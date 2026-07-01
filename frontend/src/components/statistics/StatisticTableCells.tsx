import { clsx } from "clsx";
import MediaImage from "../common/MediaImage";
import { resolvePlayerPhoto } from "../common/playerAssets";
import { resolveTeamLogo } from "../common/teamAssets";
import Badge from "../ui/Badge";
import type { ApiMatch, ApiTeam } from "../../api";

function teamById(teams: ApiTeam[], teamId?: number | null, embedded?: ApiTeam | null) {
  if (embedded) return embedded;
  if (teamId == null) return undefined;
  return teams.find((team) => team.id === teamId);
}

export function MatchLogosCell({
  match,
  teams,
  className,
}: {
  match?: ApiMatch | null;
  teams: ApiTeam[];
  className?: string;
}) {
  if (!match) return <span className={className}>—</span>;

  const home = teamById(teams, match.home_team_id, match.home_team ?? match.homeTeam ?? undefined);
  const away = teamById(teams, match.away_team_id, match.away_team ?? match.awayTeam ?? undefined);
  const homeName = home?.name ?? "En attente";
  const awayName = away?.name ?? "En attente";

  return (
    <div
      className={clsx("flex items-center justify-start gap-1.5", className)}
      title={`${homeName} vs ${awayName}`}
    >
      <MediaImage
        src={home?.logo_path}
        fallback={resolveTeamLogo(null)}
        alt=""
        className="h-6 w-6 shrink-0 object-contain"
      />
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide opacity-50">vs</span>
      <MediaImage
        src={away?.logo_path}
        fallback={resolveTeamLogo(null)}
        alt=""
        className="h-6 w-6 shrink-0 object-contain"
      />
    </div>
  );
}

export function TeamLogoNameCell({
  name,
  logoPath,
  className,
}: {
  name: string;
  logoPath?: string | null;
  className?: string;
}) {
  return (
    <div className={clsx("flex min-w-0 items-center gap-2", className)} title={name}>
      <MediaImage
        src={logoPath}
        fallback={resolveTeamLogo(null)}
        alt=""
        className="h-6 w-6 shrink-0 object-contain"
      />
      <span className="min-w-0 truncate font-medium">{name}</span>
    </div>
  );
}

export function PlayerPhotoNameCell({
  name,
  photoPath,
  className,
}: {
  name: string;
  photoPath?: string | null;
  className?: string;
}) {
  return (
    <div className={clsx("flex min-w-0 items-center gap-2", className)} title={name}>
      <MediaImage
        src={photoPath}
        fallback={resolvePlayerPhoto(null)}
        alt=""
        className="h-7 w-7 shrink-0 object-contain"
      />
      <span className="min-w-0 truncate">{name}</span>
    </div>
  );
}

export function StatTypeBadge({ label, color }: { label: string; color: "success" | "warning" | "error" | "info" }) {
  return (
    <span className="inline-flex w-[7.5rem] justify-center">
      <Badge size="sm" color={color} className="w-full justify-center whitespace-nowrap px-1.5 py-0.5 text-[10px]">
        {label}
      </Badge>
    </span>
  );
}
