import { clsx } from "clsx";

type CountBadgeProps = {
  count: number;
  className?: string;
  max?: number;
};

export default function CountBadge({ count, className, max = 99 }: CountBadgeProps) {
  if (count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);

  return (
    <span
      className={clsx(
        "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white",
        className,
      )}
    >
      {label}
    </span>
  );
}
