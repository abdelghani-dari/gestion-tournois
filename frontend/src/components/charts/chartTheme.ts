import type { ApexOptions } from "apexcharts";

export const darkChartBase: ApexOptions = {
  chart: {
    fontFamily: "Outfit, sans-serif",
    toolbar: { show: false },
    background: "transparent",
  },
  grid: {
    borderColor: "rgba(255,255,255,0.06)",
    strokeDashArray: 4,
  },
  xaxis: {
    labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
  },
  tooltip: { theme: "dark" },
  legend: {
    labels: { colors: "#94a3b8" },
  },
};
