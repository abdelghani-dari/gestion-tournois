import { useEffect, useRef } from "react";

export function Dropdown({
  isOpen,
  onClose,
  children,
  className = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 z-40 mt-2 rounded-md border border-white/[0.08] bg-slate-900/95 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  onItemClick,
  className = "",
  children,
}: {
  onItemClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onItemClick}
      className={`block w-full rounded-sm px-4 py-2 text-left text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}
