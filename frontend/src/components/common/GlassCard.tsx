import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export default function GlassCard({
  children,
  className,
  padding = "md",
}: GlassCardProps) {
  const t = useThemeTokens();

  return (
    <div
      className={clsx(
        "rounded-md",
        t.panelGlass,
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
