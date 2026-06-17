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
  const { shellBg } = useXTheme();

  return (
    <div className={clsx("min-h-screen", shellBg)}>
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
