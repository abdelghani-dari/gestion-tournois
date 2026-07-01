import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import ProgressLine from "../common/ProgressLine";

interface TournamentProgressCardProps {
  title: string;
  subtitle?: string;
  value: number;
  played: number;
  total: number;
  label?: string;
}

export default function TournamentProgressCard({
  title,
  subtitle,
  value,
  played,
  total,
  label = "Progression",
}: TournamentProgressCardProps) {
  const t = useThemeTokens();

  return (
    <div className={clsx("flex h-full flex-col rounded-md border p-5", t.card)}>
      <div>
        <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{label}</p>
        <h3 className={clsx("mt-1 text-base font-semibold", t.textPrimary)}>{title}</h3>
        {subtitle && <p className={clsx("mt-0.5 text-xs", t.textSecondary)}>{subtitle}</p>}
      </div>

      <div className="mt-5 flex-1">
        <ProgressLine
          value={value}
          label="Avancement"
          sublabel={`${played} / ${total} matchs joués`}
        />
      </div>
    </div>
  );
}
