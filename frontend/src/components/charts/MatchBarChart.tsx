import { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useXTheme } from "../context/XThemeContext";
import { useSeasonData } from "../context/SeasonContext";

interface MatchBarChartProps {
  fullWidth?: boolean;
  embedded?: boolean;
}

export default function MatchBarChart({ fullWidth = false, embedded = false }: MatchBarChartProps) {
  const t = useThemeTokens();
  const { theme } = useXTheme();
  const { teams, rankings } = useSeasonData();
  const isLight = theme === "light";

  const sorted = useMemo(
    () => [...rankings].sort((a, b) => b.points - a.points).slice(0, fullWidth ? rankings.length : 6),
    [rankings, fullWidth]
  );

  const labelColor = isLight ? "#71717a" : theme === "zinc" ? "#a1a1aa" : "#94a3b8";
  const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        toolbar: { show: false },
        background: "transparent",
        animations: { enabled: true },
      },
      colors: ["#22c55e", "#f59e0b", "#ef4444"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: fullWidth ? "68%" : "52%",
          borderRadius: 2,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        padding: { left: 8, right: 8 },
      },
      xaxis: {
        categories: sorted.map((r) => {
          const name = teams.find((tm) => tm.id === r.team_id)?.name ?? "";
          return fullWidth ? name : name.split(" ").slice(0, 2).join(" ");
        }),
        labels: {
          style: { colors: labelColor, fontSize: fullWidth ? "10px" : "11px" },
          rotate: fullWidth ? -45 : 0,
          rotateAlways: fullWidth,
          trim: false,
          hideOverlappingLabels: false,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tickPlacement: "between",
      },
      yaxis: {
        labels: { style: { colors: labelColor, fontSize: "11px" } },
        min: 0,
        forceNiceScale: true,
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        labels: { colors: labelColor },
        markers: { size: 6, shape: "square" },
        itemMargin: { horizontal: 12 },
      },
      tooltip: { theme: isLight ? "light" : "dark" },
    }),
    [sorted, fullWidth, labelColor, gridColor, isLight, teams]
  );

  const series = useMemo(
    () => [
      { name: "Victoires", data: sorted.map((r) => r.wins) },
      { name: "Nuls", data: sorted.map((r) => r.draws) },
      { name: "Défaites", data: sorted.map((r) => r.losses) },
    ],
    [sorted]
  );

  const chartHeight = fullWidth ? 380 : 260;

  return (
    <div className={clsx("w-full", fullWidth && "min-w-0")}>
      {!embedded && (
        <>
          <h3 className={clsx("mb-1 text-base font-medium", t.textPrimary)}>Résultats par équipe</h3>
          <p className={clsx("mb-4 text-xs", t.textMuted)}>Données dérivées des stats joueurs</p>
        </>
      )}
      {embedded && (
        <p className={clsx("mb-4 text-xs", t.textMuted)}>Résultats par équipe — données dérivées des stats joueurs</p>
      )}
      <div className="x-scroll w-full min-w-0 overflow-x-auto">
        <Chart options={options} series={series} type="bar" height={chartHeight} width="100%" />
      </div>
    </div>
  );
}
