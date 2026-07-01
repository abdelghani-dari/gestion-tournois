import { Outlet } from "react-router";
import { clsx } from "clsx";
import { XSidebarProvider, useXSidebar } from "../context/SidebarContext";
import { useXTheme } from "../context/XThemeContext";
import { HeaderDropdownProvider } from "../context/HeaderDropdownContext";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import "../styles/x-scrollbars.css";

function LayoutContent() {
  const { isCollapsed } = useXSidebar();
  const { shellBg, theme } = useXTheme();

  return (
    <div className={clsx("relative min-h-screen", shellBg)}>
      {/* Background spacer matching the dark sidebar background in light theme to prevent empty white gap during full-page scroll/stitching */}
      <div
        className={clsx(
          "absolute bottom-0 left-0 top-0 -z-10 hidden border-r transition-[width] duration-200 ease-in-out lg:block",
          theme === "light" ? "bg-[#0a1324] border-indigo-900/35" : "bg-transparent border-transparent",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      />
      <Sidebar />
      <div
        className={clsx(
          "flex flex-col transition-[margin] duration-200 ease-in-out",
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <HeaderDropdownProvider>
          <AppHeader />
        </HeaderDropdownProvider>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function XAppLayout() {
  return (
    <XSidebarProvider>
      <LayoutContent />
    </XSidebarProvider>
  );
}

