import { clsx } from "clsx";
import { useState, type InputHTMLAttributes } from "react";
import { useThemeTokens } from "../theme/useThemeTokens";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

function blockClipboard(event: React.ClipboardEvent<HTMLInputElement>) {
  event.preventDefault();
}

export default function PasswordInput({ label, className, id, ...props }: PasswordInputProps) {
  const t = useThemeTokens();
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={clsx("mb-1.5 block text-sm", t.textSecondary)}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete ?? "off"}
          onCopy={blockClipboard}
          onCut={blockClipboard}
          onPaste={blockClipboard}
          className={clsx(
            "w-full rounded-sm border px-4 py-2.5 pr-11 text-sm focus:border-brand-500/50 focus:outline-none",
            t.border,
            t.metricBg,
            t.textPrimary,
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className={clsx(
            "absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm transition-colors",
            t.textMuted,
            t.navHover,
          )}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? (
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18" />
              <path d="M10.58 10.58A2 2 0 0012 15a2 2 0 001.41-3.41" />
              <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-4.12 5.12M6.12 6.12A11.8 11.8 0 001 12.5C2.73 16.39 7 19.5 12 19.5c1.05 0 2.07-.13 3-.36" />
            </svg>
          ) : (
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
