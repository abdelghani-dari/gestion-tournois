import GlassCard from "./GlassCard";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
}

export default function StatCard({ label, value, icon, iconColor }: StatCardProps) {
  return (
    <GlassCard>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-md bg-white/[0.04] ${iconColor}`}
      >
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-sm font-normal text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      </div>
    </GlassCard>
  );
}
