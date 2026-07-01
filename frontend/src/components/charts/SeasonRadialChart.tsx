import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const options: ApexOptions = {
  colors: ["#465FFF"],
  chart: {
    fontFamily: "Outfit, sans-serif",
    type: "radialBar",
    height: 280,
    sparkline: { enabled: true },
    background: "transparent",
  },
  plotOptions: {
    radialBar: {
      startAngle: -120,
      endAngle: 120,
      hollow: { size: "72%" },
      track: { background: "rgba(255,255,255,0.06)", strokeWidth: "100%", margin: 6 },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: "28px",
          fontWeight: "600",
          offsetY: -8,
          color: "#fff",
          formatter: (val) => `${val}%`,
        },
      },
    },
  },
  stroke: { lineCap: "round" },
  labels: ["Progression"],
};

export default function SeasonRadialChart({ value = 68 }: { value?: number }) {
  return (
    <div className="text-center">
      <Chart options={options} series={[value]} type="radialBar" height={280} />
      <p className="-mt-6 text-sm font-medium text-white">Saison complétée</p>
      <p className="text-xs text-slate-500">22 / 30 journées jouées</p>
    </div>
  );
}
