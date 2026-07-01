import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { getChartBase } from "./chartTheme";
import { useXTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { TeamStatsByMonthPoint } from "../../api";

const CHART_HEIGHT = 220;

type TeamSeasonChartProps = {
  data: TeamStatsByMonthPoint[];
  teamName?: string | null;
  tournamentName?: string | null;
  loading?: boolean;
  filter?: ReactNode;
};

function ChartSkeleton() {
  const t = useThemeTokens();
  return (
    <div className="flex h-[220px] flex-col justify-end gap-3 px-2 pb-4 pt-4">
      <div className={clsx("h-3 w-32 animate-pulse rounded", t.metricBg)} />
      <div className="flex flex-1 items-end gap-2">
        {[35, 55, 40, 70, 45, 60, 38, 72, 50, 65, 42, 58].map((h, i) => (
          <div
            key={i}
            className={clsx("flex-1 animate-pulse rounded-t", t.metricBg)}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function hasChartData(data: TeamStatsByMonthPoint[]) {
  return data.some(
    (point) =>
      point.goals_scored > 0 ||
      point.goals_conceded > 0 ||
      point.points > 0 ||
      point.yellow_cards > 0 ||
      point.red_cards > 0,
  );
}

export default function TeamSeasonChart({
  data,
  teamName,
  tournamentName,
  loading = false,
  filter,
}: TeamSeasonChartProps) {
  const { theme } = useXTheme();
  const t = useThemeTokens();
  const chartBase = getChartBase(theme);
  const categories = data.map((point) => point.month);
  const periods = data.map((point) => point.period ?? point.month);
  const goalsScored = data.map((point) => point.goals_scored);
  const goalsConceded = data.map((point) => point.goals_conceded);
  const points = data.map((point) => point.points);
  const empty = !hasChartData(data);

  const options: ApexOptions = {
    ...chartBase,
    colors: ["#465FFF", "#34d399", "#a78bfa"],
    chart: { ...chartBase.chart, type: "line", height: CHART_HEIGHT },
    stroke: {
      curve: "smooth",
      width: [2, 2, 3],
      dashArray: [0, 0, 0],
    },
    fill: {
      type: ["gradient", "gradient", "solid"],
      gradient: { opacityFrom: 0.3, opacityTo: 0.02 },
    },
    xaxis: {
      ...chartBase.xaxis,
      categories,
    },
    tooltip: {
      ...chartBase.tooltip,
      x: {
        formatter: (_value, opts) => periods[opts?.dataPointIndex ?? 0] ?? _value,
      },
    },
    yaxis: [
      {
        ...chartBase.yaxis,
        seriesName: "Buts marqués",
        title: { text: "Buts", style: { color: "#94a3b8", fontSize: "11px" } },
        min: 0,
      },
      {
        ...chartBase.yaxis,
        seriesName: "Buts marqués",
        show: false,
        min: 0,
      },
      {
        ...chartBase.yaxis,
        opposite: true,
        seriesName: "Points",
        title: { text: "Points", style: { color: "#94a3b8", fontSize: "11px" } },
        min: 0,
      },
    ],
    legend: { show: true, position: "top", horizontalAlign: "right" },
  };

  const series = [
    { name: "Buts marqués", type: "area", data: goalsScored },
    { name: "Buts encaissés", type: "area", data: goalsConceded },
    { name: "Points", type: "line", data: points },
  ];

  const subtitle = [teamName, tournamentName].filter(Boolean).join(" · ") || "Équipe · Tournoi";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={clsx("text-base font-medium", t.textPrimary)}>Évolution par équipe</h3>
          <p className={clsx("text-xs", t.textMuted)}>{subtitle} — buts et points mensuels</p>
        </div>
        {filter && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{filter}</div>}
      </div>
      <div className="h-[220px]">
        {loading ? (
          <ChartSkeleton />
        ) : empty ? (
          <p className={clsx("flex h-full items-center justify-center text-sm", t.textMuted)}>
            Aucune statistique disponible pour cette équipe.
          </p>
        ) : (
          <Chart options={options} series={series} type="line" height={CHART_HEIGHT} />
        )}
      </div>
    </div>
  );
}
