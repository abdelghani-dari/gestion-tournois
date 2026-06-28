import { useState } from "react";
import { Link, useLocation } from "react-router";
import { clsx } from "clsx";
import { useXSidebar } from "../context/SidebarContext";
import { useXTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import AppLogo from "../common/AppLogo";
import { useAuth } from "../../context/AuthContext";
import {
  GridIcon,
  ShootingStarIcon,
  GroupIcon,
  UserIcon,
  TableIcon,
  PieChartIcon,
  TaskIcon,
  UserCircleIcon,
  PaperPlaneIcon,
  AngleLeftIcon,
} from "../../icons";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <GridIcon className="size-5" />, color: "text-sky-400", borderColor: "border-sky-400" },
  { name: "Tournois", path: "/tournaments", icon: <ShootingStarIcon className="size-5" />, color: "text-amber-400", borderColor: "border-amber-400" },
  { name: "Equipes", path: "/teams", icon: <GroupIcon className="size-5" />, color: "text-cyan-400", borderColor: "border-cyan-400" },
  { name: "Joueurs", path: "/players", icon: <UserIcon className="size-5" />, color: "text-indigo-400", borderColor: "border-indigo-400" },
  { name: "Demandes", path: "/join-requests", icon: <PaperPlaneIcon className="size-5" />, color: "text-teal-400", borderColor: "border-teal-400" },
  { name: "Matchs", path: "/matches", icon: <TableIcon className="size-5" />, color: "text-rose-400", borderColor: "border-rose-400" },
  { name: "Classements", path: "/rankings", icon: <TaskIcon className="size-5" />, color: "text-lime-400", borderColor: "border-lime-400" },
  { name: "Statistiques", path: "/statistics", icon: <PieChartIcon className="size-5" />, color: "text-orange-400", borderColor: "border-orange-400" },
  { name: "Admin", path: "/admin", icon: <UserCircleIcon className="size-5" />, color: "text-purple-400", borderColor: "border-purple-400", adminOnly: true },
  { name: "Comptes en attente", path: "/admin/users/pending", icon: <UserIcon className="size-5" />, color: "text-violet-400", borderColor: "border-violet-400", adminOnly: true },
  { name: "Profil", path: "/profile", icon: <UserCircleIcon className="size-5" />, color: "text-fuchsia-400", borderColor: "border-fuchsia-400" },
];

function NavTooltip({ label, visible }: { label: string; visible: boolean }) {
  const t = useThemeTokens();
  if (!visible) return null;
  return (
    <div
      className={clsx(
        "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-xl",
        t.panel,
        t.textPrimary,
      )}
    >
      {label}
    </div>
  );
}

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useXSidebar();
  const { sidebarBg } = useXTheme();
  const t = useThemeTokens();
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const visibleNavItems = navItems
    .filter((item) => (!item.adminOnly || isAdmin) && !(isAdmin && item.name === "Admin"))
    .map((item) => {
      if (!isAdmin) return item;
      if (item.path === "/dashboard") return { ...item, path: "/admin" };
      if (item.path === "/tournaments") return { ...item, path: "/admin/tournaments" };
      if (item.path === "/teams") return { ...item, path: "/admin/teams" };
      if (item.path === "/players") return { ...item, path: "/admin/players" };
      return item;
    });

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path + "/"));

  return (
    <>
      {isMobileOpen && (
        <div
          className={clsx("fixed inset-0 z-40 lg:hidden", t.modalBackdrop)}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r backdrop-blur-xl",
          "transition-[width] duration-200 ease-in-out",
          sidebarBg,
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={clsx("flex h-16 shrink-0 items-center border-b px-4", t.border)}>
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 overflow-hidden">
            <AppLogo variant="compact" size="sm" />
            <span
              className={clsx(
                "overflow-hidden whitespace-nowrap text-sm font-semibold transition-opacity duration-200",
                t.textPrimary,
                isCollapsed ? "w-0 opacity-0" : "opacity-100",
              )}
            >
              Gestion Tournois
            </span>
          </Link>
        </div>

        <nav className="x-scroll flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1 px-3">
            {visibleNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    onMouseEnter={() => setHoveredNav(item.path)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={clsx(
                      "relative flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors",
                      active
                        ? `${t.navActiveBg} ${item.color} border-l-2 ${item.borderColor}`
                        : `border-l-2 border-transparent ${t.navText} ${t.navHover}`,
                    )}
                  >
                    <span className={clsx("shrink-0", active ? item.color : t.textMuted)}>
                      {item.icon}
                    </span>
                    <span
                      className={clsx(
                        "overflow-hidden whitespace-nowrap text-sm font-medium transition-opacity duration-200",
                        isCollapsed ? "w-0 opacity-0" : "opacity-100",
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                  {isCollapsed && (
                    <NavTooltip label={item.name} visible={hoveredNav === item.path} />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <button
        onClick={() => setIsMobileOpen(true)}
        className={clsx(
          "fixed bottom-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-md border backdrop-blur-md lg:hidden",
          t.card,
          t.textPrimary,
        )}
      >
        <AngleLeftIcon className="size-5" />
      </button>
    </>
  );
}
