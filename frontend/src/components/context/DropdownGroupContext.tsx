import { createContext, useContext, useState, useCallback } from "react";

interface DropdownGroupContextValue {
  openId: string | null;
  toggle: (id: string) => void;
  close: () => void;
  isOpen: (id: string) => boolean;
}

const DropdownGroupContext = createContext<DropdownGroupContextValue | null>(null);

export function DropdownGroupProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const close = useCallback(() => setOpenId(null), []);

  const isOpen = useCallback((id: string) => openId === id, [openId]);

  return (
    <DropdownGroupContext.Provider value={{ openId, toggle, close, isOpen }}>
      {children}
    </DropdownGroupContext.Provider>
  );
}

export function useDropdownGroup(id: string) {
  const ctx = useContext(DropdownGroupContext);
  if (!ctx) {
    throw new Error("useDropdownGroup must be used within DropdownGroupProvider");
  }
  return {
    open: ctx.isOpen(id),
    toggle: () => ctx.toggle(id),
    close: ctx.close,
  };
}

/** Optional hook — returns null when no provider (for components that work both ways). */
export function useOptionalDropdownGroup(id: string) {
  const ctx = useContext(DropdownGroupContext);
  if (!ctx) return null;
  return {
    open: ctx.isOpen(id),
    toggle: () => ctx.toggle(id),
    close: ctx.close,
  };
}
