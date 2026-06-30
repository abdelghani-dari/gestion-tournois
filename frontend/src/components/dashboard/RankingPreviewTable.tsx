import { Link } from "react-router";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import MediaImage from "../common/MediaImage";
import { resolveTeamLogo } from "../common/teamAssets";
import { AngleRightIcon } from "../../icons";
import type { ApiRanking } from "../../api";

type RankingPreviewTableProps = {
  rankings: ApiRanking[];
  limit?: number;
};

function rankingRowStripe(index: number) {
  return index % 2 === 0 ? "bg-black/[0.008] dark:bg-white/[0.012]" : "bg-black/[0.018] dark:bg-white/[0.022]";
}

export default function RankingPreviewTable({ rankings, limit = 10 }: RankingPreviewTableProps) {
  const t = useThemeTokens();
  const sorted = [...rankings]
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    })
    .slice(0, limit);

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
          <col className="w-8" />
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
            <th className="w-8 px-2 py-2.5" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={row.id} className={clsx("group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.025]", rankingRowStripe(idx))}>
              <td className="px-3 py-2.5 text-center text-xs font-bold tabular-nums group-hover:rounded-l-lg md:px-4">
                <span className={idx < 3 ? "text-amber-400" : t.textPrimary}>{idx + 1}</span>
              </td>
              <td className="px-3 py-2.5 md:px-4">
                <Link to={`/teams/${row.team_id}`} className={clsx("flex min-w-0 cursor-pointer items-center gap-2.5", t.textPrimary)}>
                  <MediaImage
                    src={row.team?.logo_path}
                    fallback={resolveTeamLogo(null)}
                    alt={row.team?.name ?? "Équipe"}
                    className="h-7 w-7 shrink-0 object-contain"
                  />
                  <span className="truncate text-sm font-medium hover:text-brand-400">
                    {row.team?.name ?? `Équipe #${row.team_id}`}
                  </span>
                </Link>
              </td>
              <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.played}</td>
              <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.wins}</td>
              <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.draws}</td>
              <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.losses}</td>
              <td
                className={clsx(
                  "px-2 py-2.5 text-center text-xs font-medium tabular-nums",
                  row.goal_difference >= 0 ? "text-emerald-500" : "text-rose-500",
                )}
              >
                {row.goal_difference > 0 ? "+" : ""}
                {row.goal_difference}
              </td>
              <td className={clsx("px-2 py-2.5 text-center text-xs tabular-nums", t.textSecondary)}>{row.goals_for}</td>
              <td className={clsx("px-2 py-2.5 text-center text-xs font-bold tabular-nums", t.textPrimary)}>{row.points}</td>
              <td className="px-2 py-2.5 group-hover:rounded-r-lg">
                <Link
                  to={`/teams/${row.team_id}`}
                  aria-label={`Voir ${row.team?.name ?? "équipe"}`}
                  className={clsx("inline-flex cursor-pointer items-center justify-center opacity-40 transition-opacity group-hover:opacity-100", t.textMuted, "hover:text-brand-400")}
                >
                  <AngleRightIcon className="size-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
