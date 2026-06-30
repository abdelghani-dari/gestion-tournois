import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

export default function ComponentCard({
  title,
  desc,
  children,
  className = "",
  bodyClassName = "",
  action,
  fill = false,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  action?: React.ReactNode;
  fill?: boolean;
}) {
  const t = useThemeTokens();

  return (
    <div className={clsx("overflow-visible rounded-md", t.panelGlass, fill && "flex h-full w-full flex-col", className)}>
      <div className={clsx("flex shrink-0 items-center justify-between gap-4 overflow-visible border-b px-5 py-4 md:px-6", t.border)}>
        <div className="min-w-0">
          <h3 className={clsx("text-base font-medium", t.textPrimary)}>{title}</h3>
          {desc && <p className={clsx("mt-1 text-sm", t.textSecondary)}>{desc}</p>}
        </div>
        {action}
      </div>
      <div
        className={clsx(
          "p-4 sm:p-6",
          fill && "flex min-h-0 flex-1 flex-col",
          bodyClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
