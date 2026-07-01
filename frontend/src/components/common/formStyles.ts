import { clsx } from "clsx";

/** Shared form input styling with very subtle placeholders. */
export function formInputClass(theme: { border: string; metricBg: string; textPrimary: string }) {
  return clsx(
    "w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none",
    "placeholder:opacity-[0.22]",
    theme.border,
    theme.metricBg,
    theme.textPrimary,
  );
}

export function modalFormFooterClass() {
  return "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end";
}
