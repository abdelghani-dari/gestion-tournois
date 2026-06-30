import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { ApiPlayer, ApiTeam } from "../../api";

interface ScorersRankingTableProps {
  players: ApiPlayer[];
  teams: ApiTeam[];
  onSelect?: (player: ApiPlayer) => void;
}

function playerName(player: ApiPlayer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

function teamName(player: ApiPlayer, teams: ApiTeam[]) {
  return player.team?.name ?? teams.find((team) => team.id === player.team_id)?.name ?? "—";
}

export default function ScorersRankingTable({ players, teams, onSelect }: ScorersRankingTableProps) {
  const t = useThemeTokens();

  const ranked = [...players].sort(
    (a, b) =>
      (b.goals ?? 0) - (a.goals ?? 0) ||
      (b.assists ?? 0) - (a.assists ?? 0) ||
      playerName(a).localeCompare(playerName(b)),
  );

  return (
    <div className="x-scroll max-h-[640px] overflow-y-auto">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-10" />
        </colgroup>
        <thead>
          <tr className={clsx("border-b text-xs font-semibold uppercase tracking-wider", t.border, t.tableHead)}>
            <th className="px-3 py-3 text-center">#</th>
            <th className="px-2 py-3 text-left">Buteur</th>
            <th className="px-3 py-3 text-center">G</th>
          </tr>
        </thead>
        <tbody className={clsx("divide-y", t.tableDivide)}>
          {ranked.map((player, idx) => {
            const goals = player.goals ?? 0;

            return (
              <tr key={player.id} className={clsx("transition-colors", t.tableRow)}>
                <td className={clsx("px-3 py-2.5 text-center text-xs font-bold", idx < 3 ? "text-amber-400" : t.textMuted)}>
                  {idx + 1}
                </td>
                <td className="px-2 py-2.5">
                  <button
                    type="button"
                    onClick={() => onSelect?.(player)}
                    className="block min-w-0 text-left hover:text-brand-500"
                  >
                    <p className={clsx("truncate text-sm font-medium", t.textPrimary)}>{playerName(player)}</p>
                    <p className={clsx("truncate text-xs", t.textMuted)}>{teamName(player, teams)}</p>
                  </button>
                </td>
                <td className={clsx("px-3 py-2.5 text-center text-sm font-bold tabular-nums", goals > 0 ? "text-emerald-500" : t.textMuted)}>
                  {goals}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
