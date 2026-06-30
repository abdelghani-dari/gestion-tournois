import type { ApexOptions } from "apexcharts";
import type { XTheme } from "../context/XThemeContext";

export function getChartBase(theme: XTheme): ApexOptions {
  const isLight = theme === "light";
  const labelColor = isLight ? "#64748b" : "#94a3b8";

  return {
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      background: "transparent",
    },
    grid: {
      borderColor: isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
      strokeDashArray: 4,
    },
    xaxis: {
      labels: { style: { colors: labelColor, fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: labelColor, fontSize: "11px" } },
    },
    tooltip: {
      theme: isLight ? "light" : "dark",
    },
    legend: {
      labels: { colors: labelColor },
    },
  };
}

/** @deprecated use getChartBase(theme) */
export const darkChartBase: ApexOptions = getChartBase("zinc");
