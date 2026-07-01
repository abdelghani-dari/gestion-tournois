import { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { clsx } from "clsx";
import type { BarChartPoint } from "../../api";
import { getChartBase } from "./chartTheme";
import { useXTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";

type DashboardBarChartProps = {
  title: string;
  subtitle?: string;
  data: BarChartPoint[];
  color: string;
};

export default function DashboardBarChart({ title, subtitle, data, color }: DashboardBarChartProps) {
  const { theme } = useXTheme();
  const t = useThemeTokens();
  const chartBase = getChartBase(theme);

  const { categories, values } = useMemo(() => {
    return {
      categories: data.map((point) => point.label),
      values: data.map((point) => point.value),
    };
  }, [data]);

  const options = useMemo<ApexOptions>(() => {
    return {
      ...chartBase,
      colors: [color],
      chart: {
        ...chartBase.chart,
        type: "bar",
        height: 260,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: "52%", distributed: false },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.4,
          inverseColors: true,
          opacityFrom: 0.95,
          opacityTo: 0.95,
          stops: [0, 100],
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        ...chartBase.xaxis,
        categories,
        labels: {
          ...chartBase.xaxis?.labels,
          rotate: -35,
          trim: true,
          hideOverlappingLabels: true,
        },
      },
      yaxis: chartBase.yaxis,
      tooltip: {
        ...chartBase.tooltip,
        y: { formatter: (value) => `${value}` },
      },
    };
  }, [chartBase, categories, color]);

  if (data.length === 0) {
    return (
      <div>
        <div className="mb-3">
          <h3 className={clsx("text-base font-medium", t.textPrimary)}>{title}</h3>
          {subtitle && <p className={clsx("text-xs", t.textMuted)}>{subtitle}</p>}
        </div>
        <p className={clsx("py-12 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className={clsx("text-base font-medium", t.textPrimary)}>{title}</h3>
        {subtitle && <p className={clsx("text-xs", t.textMuted)}>{subtitle}</p>}
      </div>
      <Chart options={options} series={[{ name: title, data: values }]} type="bar" height={260} />
    </div>
  );
}
