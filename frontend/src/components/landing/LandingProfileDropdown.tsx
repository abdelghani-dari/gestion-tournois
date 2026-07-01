import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { clsx } from "clsx";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import UserAvatar from "../common/UserAvatar";
import RoleBadge from "../common/RoleBadge";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

export default function LandingProfileDropdown() {
  const navigate = useNavigate();
  const t = useThemeTokens();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.name ?? "Utilisateur";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setOpen(false);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "dropdown-toggle flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors sm:gap-2.5 sm:pr-3",
          t.textSecondary,
          "hover:bg-white/[0.04]",
        )}
      >
        <UserAvatar user={user} name={displayName} showRoleRing className="h-8 w-8 sm:h-9 sm:w-9" />
        <span className={clsx("hidden max-w-28 truncate text-xs font-semibold sm:block", t.textPrimary)}>
          {displayName}
        </span>
        <ChevronDown
          className={clsx("size-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")}
        />
      </button>

      <Dropdown isOpen={open} onClose={() => setOpen(false)} className={clsx("w-64 border p-2", t.headerDropdown)}>
        <div className={clsx("flex items-center gap-3 rounded-lg px-3 py-3", t.metricBg)}>
          <UserAvatar user={user} name={displayName} showRoleRing className="h-11 w-11" />
          <div className="min-w-0">
            <p className={clsx("truncate font-semibold", t.textPrimary)}>{displayName}</p>
            <p className={clsx("truncate text-xs", t.textMuted)}>{user?.email}</p>
            <div className="mt-1.5">
              <RoleBadge user={user} size="sm" />
            </div>
          </div>
        </div>

        <div className={clsx("my-2 border-t", t.border)} />

        <Link
          to="/profile"
          onClick={() => setOpen(false)}
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            t.textSecondary,
            t.navHover,
          )}
        >
          <User className="size-4 shrink-0 opacity-70" />
          Mon profil
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg bg-red-500/10 px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-4 shrink-0 opacity-80" />
          {loggingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
      </Dropdown>
    </div>
  );
}
