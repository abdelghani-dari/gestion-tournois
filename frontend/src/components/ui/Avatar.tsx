import { useState } from "react";
import { PLAYER_PLACEHOLDER_URL } from "../common/playerAssets";

const sizeClasses = {
  xsmall: "h-6 w-6",
  small: "h-8 w-8",
  medium: "h-10 w-10",
  large: "h-12 w-12",
  xlarge: "h-14 w-14",
  xxlarge: "h-16 w-16",
};

const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5",
  small: "h-2 w-2",
  medium: "h-2.5 w-2.5",
  large: "h-3 w-3",
  xlarge: "h-3.5 w-3.5",
  xxlarge: "h-4 w-4",
};

export default function Avatar({
  src,
  alt = "Avatar",
  size = "medium",
  status = "none",
}: {
  src?: string | null;
  alt?: string;
  size?: keyof typeof sizeClasses;
  status?: "online" | "offline" | "busy" | "none";
}) {
  const [failed, setFailed] = useState(false);
  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-slate-500",
    busy: "bg-amber-500",
  };

  const resolvedSrc = !src?.trim() || failed ? PLAYER_PLACEHOLDER_URL : src.trim();

  return (
    <div className={`relative rounded-full ${sizeClasses[size]}`}>
      <img
        src={resolvedSrc}
        alt={alt}
        onError={() => setFailed(true)}
        className="h-full w-full rounded-full object-cover ring-1 ring-white/10"
      />
      {status !== "none" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-900 ${statusSizeClasses[size]} ${statusColors[status]}`}
        />
      )}
    </div>
  );
}
