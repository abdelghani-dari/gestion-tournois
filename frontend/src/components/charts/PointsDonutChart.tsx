import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { rankings, teams } from "../data/mockData";

const sorted = [...rankings].sort((a, b) => b.points - a.points).slice(0, 8);

const options: ApexOptions = {
  colors: ["#465FFF", "#34d399", "#f59e0b", "#f43f5e", "#a78bfa", "#22d3ee", "#84cc16", "#fb923c"],
  chart: { fontFamily: "Outfit, sans-serif", type: "donut", background: "transparent" },
  labels: sorted.map((r) => teams.find((t) => t.id === r.team_id)?.name?.split(" ")[0] ?? ""),
  legend: { position: "bottom", labels: { colors: "#94a3b8" } },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Points", color: "#94a3b8" } } } },
  },
  stroke: { show: false },
  tooltip: { theme: "dark" },
};

const series = sorted.map((r) => r.points);

export default function PointsDonutChart() {
  return (
    <div>
      <h3 className="mb-1 text-base font-medium text-white">Répartition des points</h3>
      <p className="mb-2 text-xs text-zinc-500">Classement Botola Pro</p>
      <Chart options={options} series={series} type="donut" height={320} />
    </div>
  );
}
