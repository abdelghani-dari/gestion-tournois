import { clsx } from "clsx";
import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "../../icons";
import { useThemeTokens } from "../theme/useThemeTokens";

type FormDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function FormDrawer({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: FormDrawerProps) {
  const t = useThemeTokens();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fermer le formulaire"
        className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        tabIndex={-1}
      />
      <aside
        className={clsx(
          "relative flex h-full w-full flex-col overflow-hidden border-l shadow-2xl shadow-black/50",
          "bg-slate-950/95 sm:w-[min(42rem,calc(100vw-1rem))]",
          t.border,
          className,
        )}
        aria-modal="true"
        role="dialog"
      >
        <div className={clsx("flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6", t.border)}>
          <div className="min-w-0">
            <h2 className={clsx("text-base font-semibold", t.textPrimary)}>{title}</h2>
            {description && <p className={clsx("mt-1 text-sm", t.textSecondary)}>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            title="Fermer"
            className={clsx(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-sm border transition-colors",
              "focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
              t.btnSecondary,
            )}
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </aside>
    </div>
  );
}
