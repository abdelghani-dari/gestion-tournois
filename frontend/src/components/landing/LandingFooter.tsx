import { Link } from "react-router";
import { clsx } from "clsx";
import { CalendarDays, HelpCircle, Home, Info, LayoutDashboard, LogIn, Sparkles, Trophy, User, Users } from "lucide-react";
import AppLogo from "../common/AppLogo";
import { APP_NAME } from "../../config/app";
import { TEAM_NAME } from "../../data/teamMembers";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

type FooterLink = { label: string; to: string; icon: React.ReactNode };

const PUBLIC_LINKS: FooterLink[] = [
  { label: "Accueil", to: "/", icon: <Home className="size-3.5" /> },
  { label: "Tournois publics", to: "/#public-tournaments", icon: <Trophy className="size-3.5" /> },
  { label: "Fonctionnalités", to: "/#features", icon: <Sparkles className="size-3.5" /> },
  { label: "FAQ", to: "/#faq", icon: <HelpCircle className="size-3.5" /> },
  { label: "À propos", to: "/about", icon: <Info className="size-3.5" /> },
  { label: "Connexion", to: "/login", icon: <LogIn className="size-3.5" /> },
];

const APP_LINKS: FooterLink[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="size-3.5" /> },
  { label: "Tournois", to: "/tournaments", icon: <Trophy className="size-3.5" /> },
  { label: "Équipes", to: "/teams", icon: <Users className="size-3.5" /> },
  { label: "Joueurs", to: "/players", icon: <User className="size-3.5" /> },
  { label: "Matchs", to: "/matches", icon: <CalendarDays className="size-3.5" /> },
  { label: "Profil", to: "/profile", icon: <User className="size-3.5" /> },
];

function LinkGrid({ links }: { links: FooterLink[] }) {
  const t = useThemeTokens();
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.to} className={clsx("inline-flex items-center gap-1.5 text-xs transition-colors", t.textMuted, "hover:text-brand-400")}>
            <span className="opacity-70">{link.icon}</span>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LandingFooter() {
  const t = useThemeTokens();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const year = new Date().getFullYear();
  const showAppLinks = isAuthenticated && (isAdmin || (user?.tournament_count ?? 0) > 0);

  return (
    <footer className={clsx("border-t", t.border, t.shellBg)}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <AppLogo size="lg" />
            <p className={clsx("mt-3 text-xs leading-relaxed", t.textMuted)}>
              {APP_NAME} — tournois locaux de football. Projet {TEAM_NAME}, école High-Tech.
            </p>
          </div>

          <div>
            <h3 className={clsx("mb-2 text-[10px] font-bold uppercase tracking-widest", t.textPrimary)}>Navigation</h3>
            <LinkGrid links={PUBLIC_LINKS} />
          </div>

          {showAppLinks && (
            <div>
              <h3 className={clsx("mb-2 text-[10px] font-bold uppercase tracking-widest", t.textPrimary)}>Application</h3>
              <LinkGrid links={APP_LINKS} />
            </div>
          )}

          <div>
            <h3 className={clsx("mb-2 text-[10px] font-bold uppercase tracking-widest", t.textPrimary)}>Équipe</h3>
            <p className={clsx("text-xs", t.textMuted)}>7 étudiants en ingénierie informatique à High-Tech.</p>
            <Link to="/about" className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300">
              <Info className="size-3.5" />
              Découvrir l&apos;équipe
            </Link>
          </div>
        </div>

        <div className={clsx("mt-6 border-t pt-3", t.border)}>
          <p className={clsx("text-center text-[11px] leading-tight", t.textMuted)}>
            © {year} {APP_NAME} · {TEAM_NAME} · High-Tech Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}
