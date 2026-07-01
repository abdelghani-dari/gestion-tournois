import { Link } from "react-router";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { BellIcon } from "../../icons";
import CountBadge from "../common/CountBadge";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import { usePendingCounts } from "../context/PendingCountsContext";

export default function AdminNotificationDropdown() {
  const t = useThemeTokens();
  const { isAdmin } = useAuth();
  const { isOpen, toggle, close } = useHeaderDropdown();
  const open = isOpen("admin-notifications");
  const { pendingUsersCount, pendingTournamentsCount } = usePendingCounts();

  const totalPending = pendingUsersCount + pendingTournamentsCount;

  const items = useMemo(() => {
    const pendingItems: Array<{ label: string; count: number; path: string }> = [];

    if (pendingUsersCount > 0) {
      pendingItems.push({
        label: "Comptes en attente",
        count: pendingUsersCount,
        path: "/admin/users/pending",
      });
    }

    if (pendingTournamentsCount > 0) {
      pendingItems.push({
        label: "Tournois en attente",
        count: pendingTournamentsCount,
        path: "/admin/tournaments/pending",
      });
    }

    return pendingItems;
  }, [pendingTournamentsCount, pendingUsersCount]);

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggle("admin-notifications")}
        className={clsx(
          "dropdown-toggle relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          t.headerIconBtn,
        )}
        title="Notifications"
      >
        <BellIcon className="size-[18px]" />
        {totalPending > 0 && (
          <CountBadge count={totalPending} className="absolute -right-0.5 -top-0.5" />
        )}
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        className={clsx("w-72 border p-2", t.headerDropdown)}
      >
        <p className={clsx("px-2 py-1.5 text-xs font-semibold uppercase tracking-wider", t.textMuted)}>
          Notifications
        </p>

        {items.length === 0 ? (
          <p className={clsx("rounded-lg px-3 py-3 text-sm", t.textSecondary)}>
            Aucune notification en attente
          </p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={close}
                className={clsx("flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", t.navHover)}
              >
                <span className={clsx("font-medium", t.textPrimary)}>{item.label}</span>
                <CountBadge count={item.count} />
              </Link>
            ))}
          </div>
        )}
      </Dropdown>
    </div>
  );
}

