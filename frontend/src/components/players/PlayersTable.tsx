import { clsx } from "clsx";
import GlassCard from "../common/GlassCard";
import Badge from "../ui/Badge";
import NationalityFlag from "../ui/NationalityFlag";
import { MOROCCO_COUNTRY, MOROCCO_FLAG_URL } from "../common/nationalityAssets";
import { resolvePlayerPhoto } from "../common/playerAssets";
import { resolveTeamLogo } from "../common/teamAssets";
import MediaImage from "../common/MediaImage";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { ApiPlayer, ApiTeam } from "../../api";
import { AngleRightIcon } from "../../icons";

const positionColors: Record<string, "success" | "info" | "warning" | "primary"> = {
  GK: "info",
  DEF: "primary",
  CB: "primary",
  LB: "primary",
  RB: "primary",
  MID: "warning",
  CM: "warning",
  CDM: "warning",
  CAM: "warning",
  ATT: "success",
  RW: "success",
  LW: "success",
  ST: "success",
};

interface PlayersTableProps {
  players: ApiPlayer[];
  teams: ApiTeam[];
  emptyMessage?: string;
  onSelect?: (player: ApiPlayer) => void;
}

function playerName(player: ApiPlayer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

function teamById(teams: ApiTeam[], teamId: number) {
  return teams.find((team) => team.id === teamId);
}

export default function PlayersTable({
  players,
  teams,
  emptyMessage = "Aucun joueur",
  onSelect,
}: PlayersTableProps) {
  const t = useThemeTokens();

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="x-scroll overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed">
          <colgroup>
            <col className="w-[5.5rem]" />
            <col />
            <col className="w-12" />
            <col className="w-14" />
            <col className="w-20" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-10" />
          </colgroup>
          <thead>
            <tr className={clsx("border-b", t.border, t.tableHead)}>
              <th className="px-4 py-2 md:px-6" />
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider md:px-6">Joueur</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Nat.</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Équipe</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider md:px-6">Poste</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">N°</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Buts</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">PdA</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody className={clsx("divide-y", t.tableDivide)}>
            {players.length === 0 ? (
              <tr>
                <td colSpan={9} className={clsx("px-6 py-10 text-center text-sm", t.textMuted)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              players.map((player) => {
                const team = teamById(teams, player.team_id) ?? player.team ?? undefined;
                const position = player.position ?? "-";
                const positionKey = position.split(",")[0]?.trim() ?? position;

                return (
                  <tr
                    key={player.id}
                    onClick={() => onSelect?.(player)}
                    className={clsx("group cursor-pointer transition-colors", t.tableRow, t.navHover)}
                  >
                    <td className="px-4 py-2 md:px-6">
                      <MediaImage
                        src={player.photo_path}
                        fallback={resolvePlayerPhoto(null)}
                        alt={playerName(player)}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </td>
                    <td className="px-4 py-2 md:px-6">
                      <span className={clsx("truncate text-sm font-medium", t.textPrimary)}>
                        {playerName(player)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <NationalityFlag flagUrl={MOROCCO_FLAG_URL} country={MOROCCO_COUNTRY} size="sm" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <MediaImage
                        src={team?.logo_path}
                        fallback={resolveTeamLogo(null)}
                        alt=""
                        title={team?.name}
                        className="mx-auto h-7 w-7 object-contain"
                      />
                    </td>
                    <td className="px-4 py-2 md:px-6">
                      <Badge color={positionColors[positionKey] ?? "light"}>{positionKey}</Badge>
                    </td>
                    <td className={clsx("px-2 py-2 text-center font-mono text-sm font-semibold tabular-nums", t.textSecondary)}>
                      {player.number ?? "-"}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-semibold tabular-nums text-emerald-500">
                      {player.goals ?? 0}
                    </td>
                    <td className={clsx("px-2 py-2 text-center text-sm tabular-nums", t.textSecondary)}>
                      {player.assists ?? 0}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <AngleRightIcon
                        className={clsx(
                          "ml-auto size-4 opacity-25 transition-opacity group-hover:opacity-70",
                          t.textMuted,
                        )}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
