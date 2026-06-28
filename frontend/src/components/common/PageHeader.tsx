import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  const t = useThemeTokens();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className={clsx("text-xl font-bold md:text-2xl", t.textPrimary)}>{title}</h1>
        {description && (
          <p className={clsx("mt-1 text-sm", t.textSecondary)}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
