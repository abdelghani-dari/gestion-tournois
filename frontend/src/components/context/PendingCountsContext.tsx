import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getPendingUsers, getPendingTournaments } from "../../api";
import { useAuth } from "../../context/AuthContext";

type PendingCountsValue = {
  pendingUsersCount: number;
  pendingTournamentsCount: number;
  refresh: () => Promise<void>;
};

const PendingCountsContext = createContext<PendingCountsValue | undefined>(undefined);

export function PendingCountsProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading: authLoading } = useAuth();
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [pendingTournamentsCount, setPendingTournamentsCount] = useState(0);
  const activeRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!isAdmin) {
      setPendingUsersCount(0);
      setPendingTournamentsCount(0);
      return;
    }

    try {
      const [users, tournaments] = await Promise.all([
        getPendingUsers(),
        getPendingTournaments(),
      ]);
      if (activeRef.current) {
        setPendingUsersCount(users.length);
        setPendingTournamentsCount(tournaments.length);
      }
    } catch {
      if (activeRef.current) {
        setPendingUsersCount(0);
        setPendingTournamentsCount(0);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    activeRef.current = true;
    if (!authLoading && isAdmin) {
      void refresh();
    } else if (!isAdmin) {
      setPendingUsersCount(0);
      setPendingTournamentsCount(0);
    }

    return () => {
      activeRef.current = false;
    };
  }, [authLoading, isAdmin, refresh]);

  const value = useMemo<PendingCountsValue>(
    () => ({ pendingUsersCount, pendingTournamentsCount, refresh }),
    [pendingUsersCount, pendingTournamentsCount, refresh],
  );

  return (
    <PendingCountsContext.Provider value={value}>
      {children}
    </PendingCountsContext.Provider>
  );
}

export function usePendingCounts() {
  const ctx = useContext(PendingCountsContext);
  if (!ctx) throw new Error("usePendingCounts must be used within PendingCountsProvider");
  return ctx;
}
