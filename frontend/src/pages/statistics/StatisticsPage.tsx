import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import DataTable from "../../components/common/DataTable";
import ComponentCard from "../../components/common/ComponentCard";
import GoalsLineChart from "../../components/charts/GoalsLineChart";
import TopScorersCard from "../../components/widgets/TopScorersCard";
import Badge from "../../components/ui/Badge";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useSeasonData } from "../../components/context/SeasonContext";
import { statTypeLabels } from "../../components/data/mockData";
import type { Statistic } from "../../components/types";
import { PieChartIcon, BoltIcon } from "../../icons";

export default function StatisticsPage() {
  const t = useThemeTokens();
  const { statistics, getPlayerById, getTeamById, getMatchById } = useSeasonData();
  const totalGoals = statistics.filter((s) => s.stat_type === "buts").reduce((sum, s) => sum + s.value, 0);
  const totalAssists = statistics.filter((s) => s.stat_type === "passes_decisives").reduce((sum, s) => sum + s.value, 0);
  const totalYellowCards = statistics.filter((s) => s.stat_type === "cartons_jaunes").reduce((sum, s) => sum + s.value, 0);

  const columns = [
    {
      key: "player",
      header: "Joueur",
      render: (s: Statistic) => {
        const player = getPlayerById(s.player_id);
        return player ? player.name : "—";
      },
    },
    { key: "team", header: "Équipe", render: (s: Statistic) => getTeamById(s.team_id)?.name ?? "—" },
    {
      key: "match",
      header: "Match",
      render: (s: Statistic) => {
        const match = getMatchById(s.match_game_id);
        if (!match) return "—";
        const home = getTeamById(match.home_team_id);
        const away = getTeamById(match.away_team_id);
        return `${home?.name} vs ${away?.name}`;
      },
    },
    {
      key: "type",
      header: "Type",
      render: (s: Statistic) => (
        <Badge color={s.stat_type === "buts" ? "success" : s.stat_type.includes("carton") ? "warning" : "info"}>
          {statTypeLabels[s.stat_type] ?? s.stat_type}
        </Badge>
      ),
    },
    {
      key: "value",
      header: "Valeur",
      render: (s: Statistic) => <span className={clsx("font-semibold", t.textPrimary)}>{s.value}</span>,
    },
  ];

  return (
    <>
      <XPageMeta title="Statistiques" description="Statistiques générales" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 sm:grid-cols-3", GRID_GAP)}>
          {[
            { label: "Buts marqués", value: totalGoals, icon: <PieChartIcon className="size-5 text-emerald-400" /> },
            { label: "Passes décisives", value: totalAssists, icon: <BoltIcon className="size-5 text-sky-400" /> },
            { label: "Cartons jaunes", value: totalYellowCards, icon: <PieChartIcon className="size-5 text-amber-400" /> },
          ].map((stat) => (
            <div key={stat.label} className={clsx("rounded-md border p-5", t.card)}>
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className={clsx("text-sm", t.textSecondary)}>{stat.label}</p>
                  <p className={clsx("text-2xl font-semibold", t.textPrimary)}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Évolution des buts" desc="Tendance mensuelle" className="xl:col-span-2">
            <GoalsLineChart />
          </ComponentCard>
          <ComponentCard title="Meilleurs buteurs" desc="Classement individuel">
            <TopScorersCard />
          </ComponentCard>
        </div>

        <DataTable columns={columns} data={statistics} />
      </PageStack>
    </>
  );
}
