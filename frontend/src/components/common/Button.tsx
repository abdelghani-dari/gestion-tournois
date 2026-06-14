import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const t = useThemeTokens();

  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 border border-brand-500/50",
    secondary: t.btnSecondary,
    danger: "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20",
    ghost: clsx(t.textMuted, "hover:text-white", t.navHover, "border border-transparent"),
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors text-center",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
