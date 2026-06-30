import { Link, useNavigate } from "react-router";
import { clsx } from "clsx";
import { Dropdown } from "../ui/dropdown/Dropdown";
import UserAvatar from "../common/UserAvatar";
import RoleBadge from "../common/RoleBadge";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { useAuth } from "../../context/AuthContext";
import { UserIcon, LockIcon, ChevronDownIcon } from "../../icons";

export default function UserDropdown() {
  const navigate = useNavigate();
  const t = useThemeTokens();
  const { isOpen, toggle, close } = useHeaderDropdown();
  const { user, isAuthenticated, logout } = useAuth();
  const open = isOpen("profile");

  const displayName = user?.name ?? "Invite";
  const displayEmail = user?.email ?? "Non connecte";

  const handleLogout = async () => {
    await logout();
    close();
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggle("profile")}
        className={clsx(
          "dropdown-toggle flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors lg:pl-2 lg:pr-3",
          t.textSecondary,
          "hover:bg-white/[0.04]",
        )}
      >
        <UserAvatar user={user} name={displayName} showRoleRing className="h-8 w-8 sm:h-9 sm:w-9" />
        <span className={clsx("hidden max-w-28 truncate text-xs font-semibold sm:block", t.textPrimary)}>
          {displayName}
        </span>
        <ChevronDownIcon className={clsx("size-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        className={clsx("w-72 border p-2", t.headerDropdown)}
      >
        <div className={clsx("flex items-center gap-3 rounded-lg px-3 py-3", t.metricBg)}>
          <UserAvatar user={user} name={displayName} showRoleRing className="h-11 w-11" />
          <div className="min-w-0">
            <p className={clsx("truncate font-semibold", t.textPrimary)}>{displayName}</p>
            <p className={clsx("truncate text-xs", t.textMuted)}>{displayEmail}</p>
            <div className="mt-1.5">
              <RoleBadge user={user} size="sm" />
            </div>
          </div>
        </div>

        <div className={clsx("my-2 border-t", t.border)} />

        {isAuthenticated ? (
          <Link
            to="/profile"
            onClick={close}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              t.textSecondary,
              t.navHover
            )}
          >
            <UserIcon className="size-5 shrink-0 opacity-70" />
            Mon profil
          </Link>
        ) : (
          <Link
            to="/login"
            onClick={close}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              t.textSecondary,
              t.navHover
            )}
          >
            <UserIcon className="size-5 shrink-0 opacity-70" />
            Se connecter
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={!isAuthenticated}
          className="mt-1 flex w-full items-center gap-3 rounded-lg bg-red-500/10 px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LockIcon className="size-5 shrink-0 opacity-80" />
          Déconnexion
        </button>
      </Dropdown>
    </div>
  );
}
