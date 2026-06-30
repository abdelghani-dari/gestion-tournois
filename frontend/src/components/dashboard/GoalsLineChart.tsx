import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { getChartBase } from "./chartTheme";
import { useXTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { GoalsByMonthPoint } from "../../api";

const CHART_HEIGHT = 300;

type GoalsLineChartProps = {
  data: GoalsByMonthPoint[];
  tournamentName?: string | null;
  loading?: boolean;
  filter?: ReactNode;
};

function ChartSkeleton() {
  const t = useThemeTokens();
  return (
    <div className="flex h-[300px] flex-col justify-end gap-3 px-2 pb-4 pt-6">
      <div className={clsx("h-3 w-24 animate-pulse rounded", t.metricBg)} />
      <div className="flex flex-1 items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 48, 68].map((h, i) => (
          <div key={i} className={clsx("flex-1 animate-pulse rounded-t", t.metricBg)} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function hasChartData(data: GoalsByMonthPoint[]) {
  return data.some((point) => point.scored > 0 || (point.yellow_cards ?? 0) > 0 || (point.red_cards ?? 0) > 0);
}

export default function GoalsLineChart({ data, tournamentName, loading = false, filter }: GoalsLineChartProps) {
  const { theme } = useXTheme();
  const t = useThemeTokens();
  const chartBase = getChartBase(theme);
  const categories = data.map((point) => point.month);
  const periods = data.map((point) => point.period ?? point.month);
  const scored = data.map((point) => point.scored);
  const yellowCards = data.map((point) => point.yellow_cards ?? 0);
  const redCards = data.map((point) => point.red_cards ?? 0);
  const empty = !hasChartData(data);

  const options: ApexOptions = {
    ...chartBase,
    colors: ["#465FFF", "#facc15", "#ef4444"],
    chart: { ...chartBase.chart, type: "area", height: CHART_HEIGHT },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
    },
    xaxis: { ...chartBase.xaxis, categories },
    tooltip: {
      ...chartBase.tooltip,
      x: {
        formatter: (_value, opts) => periods[opts?.dataPointIndex ?? 0] ?? _value,
      },
    },
    legend: { show: true, position: "top", horizontalAlign: "right" },
  };

  const series = [
    { name: "Buts", data: scored },
    { name: "Cartons jaunes", data: yellowCards },
    { name: "Cartons rouges", data: redCards, hidden: true } as any,
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={clsx("text-base font-medium", t.textPrimary)}>Évolution des buts</h3>
          <p className={clsx("text-xs", t.textMuted)}>{tournamentName ?? "Tournoi"} — statistiques mensuelles</p>
        </div>
        {filter && <div className="shrink-0">{filter}</div>}
      </div>
      <div className="h-[300px]">
        {loading ? (
          <ChartSkeleton />
        ) : empty ? (
          <p className={clsx("flex h-full items-center justify-center text-sm", t.textMuted)}>
            Aucune donnée de buts disponible pour le moment.
          </p>
        ) : (
          <Chart options={options} series={series} type="area" height={CHART_HEIGHT} />
        )}
      </div>
    </div>
  );
}
