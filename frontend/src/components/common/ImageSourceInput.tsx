import { clsx } from "clsx";
import EntityImage from "./EntityImage";
import { useThemeTokens } from "../theme/useThemeTokens";

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
};

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
}: ImageSourceInputProps) {
  const t = useThemeTokens();
  const preview = file ? URL.createObjectURL(file) : url;

  return (
    <div>
      <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>{label}</label>
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModeChange("upload")}
          disabled={disabled}
          className={clsx("rounded-sm border px-3 py-1.5 text-xs font-medium", mode === "upload" ? "border-brand-500 bg-brand-500/15 text-brand-300" : clsx(t.border, t.textSecondary))}
        >
          Importer une image
        </button>
        <button
          type="button"
          onClick={() => {
            onModeChange("url");
            onFileChange(null);
          }}
          disabled={disabled}
          className={clsx("rounded-sm border px-3 py-1.5 text-xs font-medium", mode === "url" ? "border-brand-500 bg-brand-500/15 text-brand-300" : clsx(t.border, t.textSecondary))}
        >
          Utiliser une URL
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[64px_1fr]">
        <EntityImage src={preview} name={previewName || label} className="h-14 w-16 rounded-sm" />
        {mode === "upload" ? (
          <input
            name={name}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            className={clsx("w-full rounded-sm border px-3 py-2 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-brand-500 file:px-3 file:py-1 file:text-white focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
          />
        ) : (
          <input
            name={`${name}_url`}
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://..."
            disabled={disabled}
            className={clsx("w-full rounded-sm border px-3 py-2 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
          />
        )}
      </div>
    </div>
  );
}
