import { clsx } from "clsx";

export default function OwnedItemBadge({ owned, className }: { owned?: boolean; className?: string }) {
  if (!owned) return null;

  return (
    <span
      className={clsx("ml-auto shrink-0 text-[10px] leading-none text-emerald-400", className)}
      title="Créé par vous"
      aria-label="Créé par vous"
    >
      ★
    </span>
  );
}
