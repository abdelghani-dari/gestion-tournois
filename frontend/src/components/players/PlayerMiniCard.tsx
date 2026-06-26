import { clsx } from "clsx";
import Badge from "../ui/Badge";
import NationalityFlag from "../ui/NationalityFlag";
import { MOROCCO_COUNTRY, MOROCCO_FLAG_URL } from "../common/nationalityAssets";
import MediaImage from "../common/MediaImage";
import { resolvePlayerPhoto } from "../common/playerAssets";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { ApiPlayer } from "../../api";

function playerName(player: ApiPlayer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

export default function PlayerMiniCard({ player }: { player: ApiPlayer }) {
  const t = useThemeTokens();
  const position = player.position?.split(",")[0]?.trim() ?? "-";

  return (
    <div className={clsx("flex items-center gap-4 rounded-md border p-4 transition-colors", t.card, t.cardHover)}>
      <MediaImage
        src={player.photo_path}
        fallback={resolvePlayerPhoto(null)}
        alt={playerName(player)}
        className="h-14 w-14 shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={clsx("truncate text-sm font-semibold", t.textPrimary)}>{playerName(player)}</p>
          <NationalityFlag flagUrl={MOROCCO_FLAG_URL} country={MOROCCO_COUNTRY} size="sm" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge color="info">{position}</Badge>
          {player.number != null && (
            <span className={clsx("font-mono text-xs", t.textMuted)}>#{player.number}</span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold tabular-nums text-emerald-500">{player.goals ?? 0}</p>
        <p className={clsx("text-[10px] uppercase tracking-wider", t.textMuted)}>Buts</p>
      </div>
    </div>
  );
}
