import { clsx } from "clsx";
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

  if (!open) return null;

  return (
    <div className={clsx("fixed inset-0 z-50 flex items-center justify-center p-6", t.modalBackdrop)}>
      <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={onClose} />
      <GlassCard className={clsx("relative z-10 w-full max-w-md", className)} padding="lg">
        <h2 className={clsx("text-lg font-semibold", t.textPrimary)}>{title}</h2>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </GlassCard>
    </div>
  );
}
