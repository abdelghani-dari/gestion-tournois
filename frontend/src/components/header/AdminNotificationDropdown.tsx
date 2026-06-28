import { Link } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPendingTournaments, getPendingUsers } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { AlertIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { useThemeTokens } from "../theme/useThemeTokens";

export default function AdminNotificationDropdown() {
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading } = useAuth();
  const { isOpen, toggle, close } = useHeaderDropdown();
  const open = isOpen("admin-notifications");
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [pendingTournamentsCount, setPendingTournamentsCount] = useState(0);

  const totalPending = pendingUsersCount + pendingTournamentsCount;

  const loadCounts = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const [pendingUsers, pendingTournaments] = await Promise.all([
        getPendingUsers(),
        getPendingTournaments(),
      ]);
      setPendingUsersCount(pendingUsers.length);
      setPendingTournamentsCount(pendingTournaments.length);
    } catch {
      setPendingUsersCount(0);
      setPendingTournamentsCount(0);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      const timer = window.setTimeout(() => void loadCounts(), 0);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [authLoading, isAdmin, loadCounts]);

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
          "dropdown-toggle relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors lg:h-11 lg:w-11",
          t.headerIconBtn,
        )}
        title="Notifications"
      >
        <AlertIcon className="size-[18px]" />
        {totalPending > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-none text-white">
            {totalPending}
          </span>
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
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
