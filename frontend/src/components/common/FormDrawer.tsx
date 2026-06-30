import { clsx } from "clsx";
import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "../../icons";
import { DropdownGroupProvider } from "../context/DropdownGroupContext";
import { useThemeTokens } from "../theme/useThemeTokens";

type FormDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export default function FormDrawer({
  open,
  onClose,
  title,
  description,
  children,
  className,
  bodyClassName,
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
    <div className={clsx("fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6", t.modalBackdrop)}>
      <button
        type="button"
        aria-label="Fermer le formulaire"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className={clsx(
          "relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col overflow-visible rounded-lg border shadow-2xl",
          t.card,
          t.border,
          className,
        )}
        aria-modal="true"
        role="dialog"
        aria-labelledby="form-modal-title"
      >
        <div className={clsx("flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6", t.border)}>
          <div className="min-w-0">
            <h2 id="form-modal-title" className={clsx("text-base font-semibold", t.textPrimary)}>
              {title}
            </h2>
            {description && <p className={clsx("mt-0.5 text-xs", t.textSecondary)}>{description}</p>}
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
        <div className={clsx("min-h-0 flex-1 overflow-visible px-4 py-4 sm:px-5", bodyClassName)}>
          <DropdownGroupProvider>{children}</DropdownGroupProvider>
        </div>
      </div>
    </div>
  );
}
