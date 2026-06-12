import { clsx } from "clsx";

/** Uniform vertical rhythm — same gap as horizontal grid gutters (24px). */
export const PAGE_GAP = "gap-6";
export const GRID_GAP = "gap-6";

interface PageStackProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageStack({ children, className }: PageStackProps) {
  return <div className={clsx("flex flex-col", PAGE_GAP, className)}>{children}</div>;
}
