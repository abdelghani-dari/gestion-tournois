import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import DataTable from "../../components/common/DataTable";
import { useSeasonData } from "../../components/context/SeasonContext";
import type { Ranking } from "../../components/types";

export default function RankingsPage() {
  const { rankings, getTeamById } = useSeasonData();
  const sorted = [...rankings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return (getTeamById(a.team_id)?.name ?? "").localeCompare(getTeamById(b.team_id)?.name ?? "");
  });

  const columns = [
    {
      key: "pos",
      header: "#",
      className: "w-10",
      render: (r: Ranking) => {
        const position = sorted.findIndex((s) => s.id === r.id) + 1;
        return (
          <span className={`font-mono font-bold ${position <= 3 ? "text-amber-400" : "opacity-60"}`}>
            {position}
          </span>
        );
      },
    },
    {
      key: "team",
      header: "Équipe",
      render: (r: Ranking) => {
        const team = getTeamById(r.team_id);
        return (
          <div className="flex items-center gap-3">
            <img src={team?.logo_url} alt="" className="h-7 w-7 object-contain" />
            <span className="font-medium">{team?.name}</span>
          </div>
        );
      },
    },
    { key: "played", header: "MJ", render: (r: Ranking) => r.played },
    { key: "wins", header: "V", render: (r: Ranking) => <span className="text-emerald-500">{r.wins}</span> },
    { key: "draws", header: "N", render: (r: Ranking) => r.draws },
    { key: "losses", header: "D", render: (r: Ranking) => <span className="text-red-400">{r.losses}</span> },
    { key: "gf", header: "BP", render: (r: Ranking) => r.goals_for },
    { key: "ga", header: "BC", render: (r: Ranking) => r.goals_against },
    {
      key: "gd",
      header: "Diff",
      render: (r: Ranking) => (
        <span className={r.goal_difference >= 0 ? "text-emerald-500" : "text-red-400"}>
          {r.goal_difference > 0 ? "+" : ""}{r.goal_difference}
        </span>
      ),
    },
    {
      key: "points",
      header: "Pts",
      render: (r: Ranking) => <span className="font-semibold text-brand-500">{r.points}</span>,
    },
  ];

  return (
    <>
      <XPageMeta title="Classements" description="Classements généraux" />
      <PageStack>
        <DataTable columns={columns} data={sorted} />
      </PageStack>
    </>
  );
}
