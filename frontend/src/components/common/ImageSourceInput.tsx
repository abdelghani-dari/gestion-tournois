import { clsx } from "clsx";
import { useState } from "react";
import { useThemeTokens } from "../theme/useThemeTokens";
import MediaImage from "./MediaImage";
import { resolvePlayerPhoto } from "./playerAssets";
import { resolveTeamLogo } from "./teamAssets";
import { useXTheme } from "../context/XThemeContext";

export type ImageSourceMode = "upload" | "url";

type ImageSourceInputProps = {
  label: string;
  name: string;
  mode: ImageSourceMode;
  onModeChange: (mode: ImageSourceMode) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  previewName: string;
  disabled?: boolean;
  /** logo = team logo placeholder, photo = player placeholder */
  variant?: "logo" | "photo";
  compact?: boolean;
};

const dropZoneHover = "hover:border-white/20 hover:bg-white/[0.04]";
const dropZoneActive = "border-white/30 bg-white/[0.06] ring-1 ring-white/10";

export default function ImageSourceInput({
  label,
  name,
  mode,
  onModeChange,
  file,
  onFileChange,
  url,
  onUrlChange,
  previewName,
  disabled,
  variant = "logo",
  compact = false,
}: ImageSourceInputProps) {
  const t = useThemeTokens();
  const { theme } = useXTheme();
  const [dragOver, setDragOver] = useState(false);
  const preview = file ? URL.createObjectURL(file) : url;
  const fallback = variant === "photo" ? resolvePlayerPhoto(null) : resolveTeamLogo(null);
  const previewSize = compact ? "h-9 w-9" : variant === "photo" ? "h-16 w-16" : "h-12 w-12";

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      if (dropped.size > 8 * 1024 * 1024) {
        alert(`Fichier trop volumineux. La taille maximale autorisée est de 8 Mo (le vôtre : ${(dropped.size / 1024 / 1024).toFixed(1)} Mo).`);
        return;
      }
      onFileChange(dropped);
    }
  };

  const tabClass = (active: boolean) => {
    const base = "rounded-sm font-medium transition-colors cursor-pointer border";
    const height = compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]";

    if (!active) {
      const inactiveColor =
        theme === "light"
          ? "text-zinc-500 hover:text-zinc-950 hover:bg-black/[0.02] border-transparent"
          : theme === "zinc"
            ? "text-zinc-400 hover:text-white hover:bg-zinc-800/40 border-transparent"
            : "text-slate-400 hover:text-white hover:bg-white/[0.02] border-transparent";
      return clsx(base, height, inactiveColor);
    }

    const activeColor =
      theme === "light"
        ? "bg-[#D9F2FE] text-[#0f172a] border-sky-500/20"
        : theme === "zinc"
          ? "bg-[#121215] text-white border-white/10"
          : "bg-[#091024] text-white border-white/10";

    return clsx(base, height, activeColor, "shadow-sm");
  };

  return (
    <div className={clsx(compact ? "space-y-2" : "space-y-2.5")}>
      <label className={clsx("block font-medium", compact ? "text-xs" : "text-sm", t.textSecondary)}>{label}</label>

      <div className={clsx("grid w-full grid-cols-2 gap-1 rounded-md border p-0.5", t.border, t.metricBg)}>
        <button type="button" onClick={() => onModeChange("upload")} disabled={disabled} className={tabClass(mode === "upload")}>
          Importer
        </button>
        <button
          type="button"
          onClick={() => {
            onModeChange("url");
            onFileChange(null);
          }}
          disabled={disabled}
          className={tabClass(mode === "url")}
        >
          URL
        </button>
      </div>

      <div className={clsx("flex gap-2.5", compact ? "flex-row items-center" : "flex-col sm:flex-row sm:items-stretch")}>
        <div className={clsx("flex shrink-0 items-center justify-center rounded-lg border", compact ? "p-1" : "p-2", t.border, t.metricBg)}>
          <MediaImage
            src={preview}
            fallback={fallback}
            alt={previewName || label}
            className={clsx("object-contain", previewSize)}
          />
        </div>

        <div className="min-w-0 flex-1">
          {mode === "upload" ? (
            <label
              onDragEnter={(event) => {
                event.preventDefault();
                if (!disabled) setDragOver(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!disabled) setDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragOver(false);
              }}
              onDrop={handleDrop}
              className={clsx(
                "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-3 text-center transition-colors",
                compact ? "min-h-[64px] py-2.5" : "min-h-[88px] py-3.5",
                t.border,
                t.metricBg,
                !disabled && dropZoneHover,
                dragOver && !disabled && dropZoneActive,
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                name={name}
                type="file"
                accept="image/*"
                disabled={disabled}
                className="sr-only"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null;
                  if (selectedFile && selectedFile.size > 8 * 1024 * 1024) {
                    alert(`Fichier trop volumineux. La taille maximale autorisée est de 8 Mo (le vôtre : ${(selectedFile.size / 1024 / 1024).toFixed(1)} Mo).`);
                    return;
                  }
                  onFileChange(selectedFile);
                }}
              />
              <p className={clsx("font-medium", compact ? "text-[11px]" : "text-sm", t.textPrimary)}>
                {file ? file.name : "Glissez ou cliquez"}
              </p>
              {!compact && <p className={clsx("mt-0.5 text-[11px]", t.textMuted)}>Tous formats d'images acceptés — max. 8 Mo</p>}
            </label>
          ) : (
            <div className={clsx("flex flex-col justify-center", compact ? "min-h-[64px]" : "min-h-[88px]")}>
              <input
                id={`${name}-url`}
                name={`${name}_url`}
                value={url}
                onChange={(event) => onUrlChange(event.target.value)}
                placeholder="https://exemple.com/logo.png"
                disabled={disabled}
                className={clsx(
                  "w-full rounded-sm border px-3 py-2 text-sm placeholder:opacity-[0.22] focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                  t.border,
                  t.card,
                  t.textPrimary,
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
