/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";

export type HeaderDropdownId = "season" | "theme" | "profile" | "admin-notifications";

interface HeaderDropdownContextValue {
  openId: HeaderDropdownId | null;
  toggle: (id: HeaderDropdownId) => void;
  close: () => void;
  isOpen: (id: HeaderDropdownId) => boolean;
}

const HeaderDropdownContext = createContext<HeaderDropdownContextValue | null>(null);

export function HeaderDropdownProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<HeaderDropdownId | null>(null);

  const toggle = useCallback((id: HeaderDropdownId) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const close = useCallback(() => setOpenId(null), []);

  const isOpen = useCallback((id: HeaderDropdownId) => openId === id, [openId]);

  return (
    <HeaderDropdownContext.Provider value={{ openId, toggle, close, isOpen }}>
      {children}
    </HeaderDropdownContext.Provider>
  );
}

export function useHeaderDropdown() {
  const ctx = useContext(HeaderDropdownContext);
  if (!ctx) throw new Error("useHeaderDropdown must be used within HeaderDropdownProvider");
  return ctx;
}
