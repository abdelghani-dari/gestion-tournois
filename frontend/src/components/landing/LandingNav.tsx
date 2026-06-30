import { useState } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";
import { HelpCircle, Info, LayoutDashboard, Menu, Sparkles, Trophy, X } from "lucide-react";
import AppLogo from "../common/AppLogo";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { HeaderDropdownProvider } from "../context/HeaderDropdownContext";
import LandingProfileDropdown from "./LandingProfileDropdown";
import XThemeSwitcher from "../layout/XThemeSwitcher";
import AdminNotificationDropdown from "../header/AdminNotificationDropdown";

type NavLink = { label: string; to: string; icon: React.ReactNode };

const GUEST_LINKS: NavLink[] = [
  { label: "Tournois", to: "/#public-tournaments", icon: <Trophy className="size-4" /> },
  { label: "Fonctionnalités", to: "/#features", icon: <Sparkles className="size-4" /> },
  { label: "FAQ", to: "/#faq", icon: <HelpCircle className="size-4" /> },
  { label: "À propos", to: "/about", icon: <Info className="size-4" /> },
];

const CREATOR_ADMIN_LINKS: NavLink[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
  { label: "Tournois", to: "/tournaments", icon: <Trophy className="size-4" /> },
  { label: "FAQ", to: "/#faq", icon: <HelpCircle className="size-4" /> },
  { label: "À propos", to: "/about", icon: <Info className="size-4" /> },
];

const USER_LINKS: NavLink[] = [
  { label: "Tournois", to: "/tournaments", icon: <Trophy className="size-4" /> },
  { label: "FAQ", to: "/#faq", icon: <HelpCircle className="size-4" /> },
  { label: "À propos", to: "/about", icon: <Info className="size-4" /> },
];

function NavLinks({ links, className, onNavigate }: { links: NavLink[]; className?: string; onNavigate?: () => void }) {
  const t = useThemeTokens();
  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          onClick={onNavigate}
          className={clsx(
            "inline-flex items-center gap-2 border-b-2 border-transparent py-1.5 text-[13px] font-medium transition-colors",
            t.textMuted,
            "hover:border-brand-400/60 hover:text-brand-400",
          )}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default function LandingNav() {
  const t = useThemeTokens();
  const { token, isAuthenticated, isAdmin, user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCreatorOrAdmin = isAdmin || user?.role === 'creator';
  const hasSession = isAuthenticated;
  const isCheckingSession = loading && Boolean(token);
  const canAccessDashboard = isCreatorOrAdmin;
  const navLinks = !hasSession ? GUEST_LINKS : isCreatorOrAdmin ? CREATOR_ADMIN_LINKS : USER_LINKS;

  return (
    <header className={clsx("fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md", t.headerBg, t.headerBorder, "shadow-[0_8px_32px_rgba(0,0,0,0.12)]")}>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center">
          <AppLogo size="lg" />
        </Link>

        <NavLinks links={navLinks} className="hidden items-center gap-5 lg:flex" />

        <div className="flex items-center gap-2">
          {isCheckingSession ? (
            <span className={clsx("inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium", t.headerIconBtn, t.textMuted)}>
              Chargement...
            </span>
          ) : hasSession ? (
            <>
              <HeaderDropdownProvider>
                <XThemeSwitcher />
                <AdminNotificationDropdown />
                <LandingProfileDropdown />
              </HeaderDropdownProvider>
            </>
          ) : (
            <>
              <HeaderDropdownProvider>
                <XThemeSwitcher />
              </HeaderDropdownProvider>
              <Link to="/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white hover:bg-brand-600 sm:px-4">
                Connexion
              </Link>
              <Link to="/signup" className={clsx("hidden h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold sm:inline-flex sm:px-4", t.headerIconBtn, t.textSecondary)}>
                Inscription
              </Link>
            </>
          )}

          <button type="button" onClick={() => setMobileOpen((v) => !v)} className={clsx("inline-flex h-9 w-9 items-center justify-center rounded-lg border lg:hidden", t.headerIconBtn)} aria-label="Menu">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={clsx("border-t px-4 py-4 lg:hidden", t.headerBorder, t.headerBg)}>
          <NavLinks links={navLinks} className="flex flex-col gap-3" onNavigate={() => setMobileOpen(false)} />
          {!hasSession && (
            <Link to="/signup" onClick={() => setMobileOpen(false)} className={clsx("mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border text-xs font-semibold", t.headerIconBtn, t.textSecondary)}>
              Inscription
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
