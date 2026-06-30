import { useState } from "react";
import { clsx } from "clsx";
import { APP_NAME } from "../../config/app";
import { logoFullSrc, logoIconSrc } from "./logoAssets";

type AppLogoProps = {
  /** full = logo with Tournify wordmark; compact = icon mark only (collapsed sidebar) */
  variant?: "full" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const fullLogoHeights = {
  sm: "h-11",
  md: "h-16",
  lg: "h-20",
};

const compactLogoSizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export default function AppLogo({ variant = "full", size = "md", className }: AppLogoProps) {
  const [fullFailed, setFullFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  if (variant === "compact") {
    const showIcon = Boolean(logoIconSrc) && !iconFailed;

    return (
      <span
        className={clsx(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#07111F] ring-1 ring-white/10",
          compactLogoSizes[size],
          className,
        )}
      >
        {showIcon ? (
          <img
            src={logoIconSrc}
            alt={APP_NAME}
            className="h-full w-full object-contain p-1"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <span aria-label={APP_NAME} className="text-sm font-bold text-white">
            T
          </span>
        )}
      </span>
    );
  }

  const showFull = Boolean(logoFullSrc) && !fullFailed;
  const showIcon = Boolean(logoIconSrc) && !iconFailed;

  return (
    <span className={clsx("inline-flex shrink-0 items-center", className)}>
      {showFull ? (
        <img
          src={logoFullSrc}
          alt={APP_NAME}
          className={clsx("w-auto max-w-full object-contain object-left", fullLogoHeights[size])}
          onError={() => setFullFailed(true)}
        />
      ) : showIcon ? (
        <img
          src={logoIconSrc}
          alt={APP_NAME}
          className={clsx("w-auto object-contain", compactLogoSizes[size])}
          onError={() => setIconFailed(true)}
        />
      ) : (
        <span className={clsx("font-semibold text-white", size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base")}>
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
