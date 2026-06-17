type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Badge({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles = { sm: "text-theme-xs", md: "text-sm" };

  const variants = {
    light: {
      primary: "bg-brand-500/15 text-brand-400",
      success: "bg-emerald-500/15 text-emerald-400",
      error: "bg-red-500/15 text-red-400",
      warning: "bg-amber-500/15 text-amber-400",
      info: "bg-sky-500/15 text-sky-400",
      light: "bg-white/5 text-slate-300",
      dark: "bg-slate-700 text-white",
    },
    solid: {
      primary: "bg-brand-500 text-white",
      success: "bg-emerald-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-amber-500 text-white",
      info: "bg-sky-500 text-white",
      light: "bg-slate-600 text-white",
      dark: "bg-slate-800 text-white",
    },
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variants[variant][color]}`}>
      {startIcon && <span>{startIcon}</span>}
      {children}
      {endIcon && <span>{endIcon}</span>}
    </span>
  );
}
