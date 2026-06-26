import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import type { Player } from "../types";

interface ScorersRankingTableProps {
  players?: Player[];
}

export default function ScorersRankingTable({ players: playersProp }: ScorersRankingTableProps) {
  const t = useThemeTokens();
  const { players: allPlayers, getTeamById, formatPlayerName } = useSeasonData();
  const source = playersProp ?? allPlayers;

  const ranked = [...source].sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name)
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
          {ranked.map((p, idx) => {
            const team = getTeamById(p.team_id);
            return (
              <tr key={p.id} className={clsx("transition-colors", t.tableRow)}>
                <td className={clsx("px-3 py-2.5 text-center text-xs font-bold", idx < 3 ? "text-amber-400" : t.textMuted)}>
                  {idx + 1}
                </td>
                <td className="px-2 py-2.5">
                  <Link to={`/players/${p.id}`} className="block min-w-0 hover:text-brand-500">
                    <p className={clsx("truncate text-sm font-medium", t.textPrimary)}>
                      {formatPlayerName(p)}
                    </p>
                    <p className={clsx("truncate text-xs", t.textMuted)}>{team?.name}</p>
                  </Link>
                </td>
                <td className={clsx("px-3 py-2.5 text-center text-sm font-bold tabular-nums", p.goals > 0 ? "text-emerald-500" : t.textMuted)}>
                  {p.goals}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
