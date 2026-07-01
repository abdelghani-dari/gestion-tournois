import { clsx } from "clsx";
import { useEffect } from "react";
import { CloseIcon } from "../../icons";
import { DropdownGroupProvider } from "../context/DropdownGroupContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import GlassCard from "./GlassCard";

interface XModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function XModal({ open, onClose, title, children, footer, className }: XModalProps) {
  const t = useThemeTokens();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fermer" onClick={onClose} />
      <GlassCard
        className={clsx("relative z-10 flex max-h-[85dvh] w-full max-w-[70dvw] flex-col overflow-visible", className)}
        padding="lg"
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <h2 className={clsx("text-lg font-semibold", t.textPrimary)}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className={clsx(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border transition-colors",
              t.btnSecondary,
            )}
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-visible">
          <DropdownGroupProvider>{children}</DropdownGroupProvider>
        </div>
        {footer && <div className="mt-6 flex shrink-0 justify-end gap-3">{footer}</div>}
      </GlassCard>
    </div>
  );
}
