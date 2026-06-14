import { Link } from "react-router";
import { clsx } from "clsx";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { UserIcon, LockIcon, ChevronDownIcon } from "../../icons";
import adminAvatar from "../../data/botola-pro-logo.png";

const ADMIN = {
  name: "Admin",
  email: "admin@gestion-tournois.ma",
  role: "admin",
};

export default function UserDropdown() {
  const t = useThemeTokens();
  const { isOpen, toggle, close } = useHeaderDropdown();
  const open = isOpen("profile");

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
        <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1", t.metricBg)}>
          <img src={adminAvatar} alt="Admin" className="h-full w-full object-contain" />
        </span>
        <span className={clsx("hidden font-medium sm:block", t.textPrimary)}>{ADMIN.name}</span>
        <ChevronDownIcon className={clsx("size-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        className={clsx("w-72 border p-2", t.headerDropdown)}
      >
        <div className={clsx("flex items-center gap-3 rounded-lg px-3 py-3", t.metricBg)}>
          <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1.5", t.border)}>
            <img src={adminAvatar} alt="" className="h-full w-full object-contain" />
          </span>
          <div className="min-w-0">
            <p className={clsx("truncate font-semibold", t.textPrimary)}>{ADMIN.name}</p>
            <p className={clsx("truncate text-xs", t.textMuted)}>{ADMIN.email}</p>
            <span className="mt-1 inline-block rounded-sm bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-500">
              {ADMIN.role}
            </span>
          </div>
        </div>

        <div className={clsx("my-2 border-t", t.border)} />

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

        <Link
          to="/login"
          onClick={close}
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            t.textSecondary,
            t.navHover
          )}
        >
          <LockIcon className="size-5 shrink-0 opacity-70" />
          Déconnexion
        </Link>
      </Dropdown>
    </div>
  );
}
