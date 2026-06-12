import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { darkChartBase } from "./chartTheme";
import ChartTab from "../common/ChartTab";

const options: ApexOptions = {
  ...darkChartBase,
  colors: ["#465FFF", "#34d399"],
  chart: { ...darkChartBase.chart, type: "area", height: 300 },
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
  },
  xaxis: {
    ...darkChartBase.xaxis,
    categories: ["Aoû", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
  },
  legend: { show: true, position: "top", horizontalAlign: "right" },
};

const series = [
  { name: "Buts marqués", data: [12, 18, 15, 22, 19, 28, 24, 31, 27, 35, 29] },
  { name: "Buts encaissés", data: [8, 11, 14, 10, 16, 13, 18, 15, 20, 17, 14] },
];

export default function GoalsLineChart() {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-white">Évolution des buts</h3>
          <p className="text-xs text-slate-500">Saison 2025-2026 — Botola Pro</p>
        </div>
        <ChartTab />
      </div>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
}
