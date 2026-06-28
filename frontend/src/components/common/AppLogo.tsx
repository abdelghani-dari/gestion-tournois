import { useState } from "react";
import { clsx } from "clsx";
import { APP_NAME } from "../../config/app";
import { logoIconSrc } from "./logoAssets";

type AppLogoProps = {
  variant?: "full" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: {
    mark: "h-9 w-9",
    title: "text-sm",
    subtitle: "text-[10px]",
  },
  md: {
    mark: "h-11 w-11",
    title: "text-base",
    subtitle: "text-[11px]",
  },
  lg: {
    mark: "h-14 w-14",
    title: "text-xl",
    subtitle: "text-xs",
  },
};

export default function AppLogo({ variant = "full", size = "md", className }: AppLogoProps) {
  const classes = sizeClasses[size];
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(logoIconSrc) && !imageFailed;

  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <span className={clsx("relative inline-flex shrink-0 items-center justify-center rounded-xl bg-[#07111F] ring-1 ring-white/10", classes.mark)}>
        {showImage ? (
          <img
            src={logoIconSrc}
            alt={APP_NAME}
            className="h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(16,185,129,0.18)]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span
            aria-label={APP_NAME}
            className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#07111F] via-[#0B1F35] to-[#05251D] text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.18)] ring-1 ring-white/10"
          >
            GT
          </span>
        )}
      </span>
      {variant === "full" && (
        <span className="min-w-0 leading-none">
          <span className={clsx("block whitespace-nowrap font-semibold tracking-normal text-white", classes.title)}>
            Gestion <span className="text-[#3B82F6]">Tournois</span>
          </span>
          <span className={clsx("mt-1 block whitespace-nowrap font-medium uppercase tracking-[0.18em] text-[#10B981]", classes.subtitle)}>
            Football manager
          </span>
        </span>
      )}
    </span>
  );
}
