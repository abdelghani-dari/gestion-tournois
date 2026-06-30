import { useState } from "react";
import { Link, useLocation } from "react-router";
import { clsx } from "clsx";
import CountBadge from "../common/CountBadge";
import { useXSidebar } from "../context/SidebarContext";
import { useXTheme } from "../context/XThemeContext";
import { THEME_TOKENS } from "../theme/tokens";
import { useThemeTokens } from "../theme/useThemeTokens";
import AppLogo from "../common/AppLogo";
import { useAuth } from "../../context/AuthContext";
import { usePendingCounts } from "../context/PendingCountsContext";
import {
  GridIcon,
  ShootingStarIcon,
  GroupIcon,
  UserIcon,
  TableIcon,
  PieChartIcon,
  UserCircleIcon,
  PaperPlaneIcon,
  AngleLeftIcon,
} from "../../icons";
import { Shield, CalendarDays } from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  adminOnly?: boolean;
  creatorOrAdminOnly?: boolean;
  badgeKey?: "pendingUsers";
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <GridIcon className="size-5" />, color: "text-sky-400", borderColor: "border-sky-400", creatorOrAdminOnly: true },
  { name: "Tournois", path: "/tournaments", icon: <ShootingStarIcon className="size-5" />, color: "text-amber-400", borderColor: "border-amber-400" },
  { name: "Equipes", path: "/teams", icon: <Shield className="size-5" />, color: "text-cyan-400", borderColor: "border-cyan-400" },
  { name: "Joueurs", path: "/players", icon: <GroupIcon className="size-5" />, color: "text-indigo-400", borderColor: "border-indigo-400" },
  { name: "Demandes", path: "/join-requests", icon: <PaperPlaneIcon className="size-5" />, color: "text-teal-400", borderColor: "border-teal-400" },
  { name: "Matchs", path: "/matches", icon: <CalendarDays className="size-5" />, color: "text-rose-400", borderColor: "border-rose-400" },
  { name: "Classements", path: "/rankings", icon: <TableIcon className="size-5" />, color: "text-lime-400", borderColor: "border-lime-400" },
  { name: "Statistiques", path: "/statistics", icon: <PieChartIcon className="size-5" />, color: "text-orange-400", borderColor: "border-orange-400" },
  { name: "Utilisateurs", path: "/admin/users", icon: <UserIcon className="size-5" />, color: "text-blue-400", borderColor: "border-blue-400", adminOnly: true },
  { name: "Comptes en attente", path: "/admin/users/pending", icon: <UserIcon className="size-5" />, color: "text-violet-400", borderColor: "border-violet-400", adminOnly: true, badgeKey: "pendingUsers" },
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
  const { theme } = useXTheme();
  const t = useThemeTokens();
  const st = theme === "light"
    ? { ...THEME_TOKENS.dark, sidebarBg: "bg-[#0a1324]/98 border-indigo-900/35" }
    : t;
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { isAdmin, user } = useAuth();
  const isCreatorOrAdmin = isAdmin || user?.role === 'creator';
  const { pendingUsersCount } = usePendingCounts();

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.creatorOrAdminOnly && !isCreatorOrAdmin) return false;
    return true;
  });

  const isActive = (path: string) => {
    if (path === "/admin/users" && location.pathname.startsWith("/admin/users/pending")) {
      return false;
    }
    return location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path + "/"));
  };

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
          st.sidebarBg,
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={clsx("flex h-[4.25rem] shrink-0 items-center border-b px-4", st.border)}>
          <Link to="/" className="flex min-w-0 items-center overflow-hidden">
            <AppLogo variant={isCollapsed ? "compact" : "full"} size={isCollapsed ? "sm" : "md"} />
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
                        ? `${st.navActiveBg} ${item.color} border-l-2 ${item.borderColor}`
                        : `border-l-2 border-transparent ${st.navText} ${st.navHover}`,
                    )}
                  >
                    <span className={clsx("shrink-0", active ? item.color : st.textMuted)}>
                      {item.icon}
                    </span>
                    <span
                      className={clsx(
                        "flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-sm font-medium transition-opacity duration-200",
                        isCollapsed ? "w-0 opacity-0" : "opacity-100",
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                      {!isCollapsed && item.badgeKey === "pendingUsers" && (
                        <CountBadge count={pendingUsersCount} className="ml-auto" />
                      )}
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
