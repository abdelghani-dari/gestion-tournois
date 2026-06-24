import { Link, useNavigate } from "react-router";
import { clsx } from "clsx";
import { Dropdown } from "../ui/dropdown/Dropdown";
import EntityImage from "../common/EntityImage";
import { roleLabel } from "../common/roleLabels";
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
  const displayRole = user?.role ?? "guest";

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
          "dropdown-toggle flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-2.5 transition-colors lg:pl-2 lg:pr-3",
          t.headerIconBtn
        )}
      >
        <EntityImage src={user?.avatar_url} name={displayName} className={clsx("h-8 w-8 shrink-0 rounded-lg", t.metricBg)} />
        <span className={clsx("hidden font-medium sm:block", t.textPrimary)}>{displayName}</span>
        <ChevronDownIcon className={clsx("size-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        className={clsx("w-72 border p-2", t.headerDropdown)}
      >
        <div className={clsx("flex items-center gap-3 rounded-lg px-3 py-3", t.metricBg)}>
          <EntityImage src={user?.avatar_url} name={displayName} className={clsx("h-11 w-11 shrink-0 rounded-lg", t.border)} />
          <div className="min-w-0">
            <p className={clsx("truncate font-semibold", t.textPrimary)}>{displayName}</p>
            <p className={clsx("truncate text-xs", t.textMuted)}>{displayEmail}</p>
            <span className="mt-1 inline-block rounded-sm bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-500">
              {roleLabel(displayRole)}
            </span>
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
          className={clsx(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            t.textSecondary,
            t.navHover
          )}
        >
          <LockIcon className="size-5 shrink-0 opacity-70" />
          Deconnexion
        </button>
      </Dropdown>
    </div>
  );
}
