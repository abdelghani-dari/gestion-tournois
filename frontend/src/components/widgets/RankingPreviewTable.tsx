import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import type { Ranking } from "../types";

interface RankingPreviewTableProps {
  limit?: number;
}

function sortRankings(
  rankings: Ranking[],
  getTeamById: (id: number) => { name: string; logo_url?: string } | undefined
) {
  return [...rankings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return (getTeamById(a.team_id)?.name ?? "").localeCompare(getTeamById(b.team_id)?.name ?? "");
  });
}

export default function RankingPreviewTable({ limit = 10 }: RankingPreviewTableProps) {
  const t = useThemeTokens();
  const { rankings, getTeamById } = useSeasonData();
  const sorted = sortRankings(rankings, getTeamById).slice(0, limit);

  if (sorted.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun classement disponible.</p>;
  }

  return (
    <div className="x-scroll overflow-x-auto">
      <table className="w-full min-w-[560px] table-fixed">
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-10" />
          <col className="w-10" />
          <col className="w-10" />
          <col className="w-10" />
          <col className="w-12" />
          <col className="w-12" />
          <col className="w-14" />
        </colgroup>
        <thead>
          <tr className={clsx("border-b text-xs font-semibold uppercase tracking-wider", t.border, t.tableHead)}>
            <th className="px-3 py-2.5 text-center md:px-4">#</th>
            <th className="px-3 py-2.5 text-left md:px-4">Équipe</th>
            <th className="px-2 py-2.5 text-center">J</th>
            <th className="px-2 py-2.5 text-center">V</th>
            <th className="px-2 py-2.5 text-center">N</th>
            <th className="px-2 py-2.5 text-center">D</th>
            <th className="px-2 py-2.5 text-center">+/-</th>
            <th className="px-2 py-2.5 text-center">BP</th>
            <th className="px-2 py-2.5 text-center">Pts</th>
          </tr>
        </thead>
        <tbody className={clsx("divide-y", t.tableDivide)}>
          {sorted.map((row, idx) => {
            const team = getTeamById(row.team_id);
            return (
              <tr key={row.id} className={clsx("transition-colors", t.tableRow)}>
                <td
                  className={clsx(
                    "px-3 py-2.5 text-center text-xs font-bold tabular-nums md:px-4",
                    idx < 3 ? "text-amber-400" : t.textMuted
                  )}
                >
                  {idx + 1}
                </td>
                <td className="px-3 py-2.5 md:px-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <img src={team?.logo_url} alt="" className="h-7 w-7 shrink-0 object-contain" />
                    <span className={clsx("truncate text-sm font-medium", t.textPrimary)}>{team?.name}</span>
                  </div>
                </td>
                <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.played}</td>
                <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.wins}</td>
                <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.draws}</td>
                <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.losses}</td>
                <td
                  className={clsx(
                    "px-2 py-2.5 text-center text-xs font-medium tabular-nums",
                    row.goal_difference >= 0 ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {row.goal_difference > 0 ? "+" : ""}
                  {row.goal_difference}
                </td>
                <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.goals_for}</td>
                <td className={clsx("px-2 py-2.5 text-center text-xs font-bold tabular-nums", t.textPrimary)}>
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
