import { createContext, useContext, useEffect, useState } from "react";
import { THEME_TOKENS } from "../theme/tokens";

export type XTheme = "light" | "dark" | "zinc";

interface XThemeContextType {
  theme: XTheme;
  setTheme: (t: XTheme) => void;
  shellBg: string;
  sidebarBg: string;
}

const XThemeContext = createContext<XThemeContextType | undefined>(undefined);

export function XThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<XTheme>(() => {
    return (localStorage.getItem("x-theme") as XTheme) || "zinc";
  });

  const setTheme = (t: XTheme) => {
    setThemeState(t);
    localStorage.setItem("x-theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    const prevDark = root.classList.contains("dark");
    const prevXTheme = root.getAttribute("data-x-theme");

    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    root.setAttribute("data-x-theme", theme);

    return () => {
      root.setAttribute("data-x-theme", prevXTheme ?? "");
      if (prevDark) root.classList.add("dark");
      else root.classList.remove("dark");
    };
  }, [theme]);

  const tokens = THEME_TOKENS[theme];

  return (
    <XThemeContext.Provider
      value={{ theme, setTheme, shellBg: tokens.shellBg, sidebarBg: tokens.sidebarBg }}
    >
      {children}
    </XThemeContext.Provider>
  );
}

export function useXTheme() {
  const ctx = useContext(XThemeContext);
  if (!ctx) throw new Error("useXTheme must be used within XThemeProvider");
  return ctx;
}
