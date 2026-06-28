import { clsx } from "clsx";
import Button from "./Button";
import XModal from "./XModal";
import { useThemeTokens } from "../theme/useThemeTokens";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const t = useThemeTokens();

  return (
    <XModal
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-md w-full"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Traitement..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className={clsx("text-sm leading-relaxed", t.textSecondary)}>{message}</p>
    </XModal>
  );
}
