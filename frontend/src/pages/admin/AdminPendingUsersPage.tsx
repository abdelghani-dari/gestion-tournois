import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import {
  acceptUser,
  ApiError,
  getPendingUsers,
  refuseUser,
  type AdminUser,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { usePendingCounts } from "../../components/context/PendingCountsContext";

function StatusPill({ value }: { value: string }) {
  const tone =
    value === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : value === "refused"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : "border-amber-500/20 bg-amber-500/10 text-amber-200";

  return (
    <span className={clsx("inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium", tone)}>
      {value}
    </span>
  );
}

export default function AdminPendingUsersPage() {
  const t = useThemeTokens();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { refresh: refreshPendingCounts } = usePendingCounts();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;

    setLoading(true);
    setError("");

    try {
      setUsers(await getPendingUsers());
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Accès administrateur requis.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger les utilisateurs.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadUsers(), 0);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [authLoading, loadUsers]);

  const handleAccept = async (id: number) => {
    setWorkingId(id);
    setError("");
    setSuccess("");

    try {
      await acceptUser(id);
      setSuccess("Utilisateur accepté.");
      await Promise.all([loadUsers(), refreshPendingCounts()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'accepter l'utilisateur.");
    } finally {
      setWorkingId(null);
    }
  };

  const handleRefuse = async (id: number) => {
    setWorkingId(id);
    setError("");
    setSuccess("");

    try {
      await refuseUser(id, notes[id]);
      setSuccess("Utilisateur refusé.");
      setNotes((current) => ({ ...current, [id]: "" }));
      await Promise.all([loadUsers(), refreshPendingCounts()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de refuser l'utilisateur.");
    } finally {
      setWorkingId(null);
    }
  };

  if (authLoading) {
    return <div className="py-8 text-center text-sm text-slate-400">Chargement...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <>
        <XPageMeta title="Utilisateurs en attente" description="Validation des comptes" />
        <PageStack>
          <ComponentCard title="Administration" desc="Accès administrateur requis">
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Connectez-vous avec un compte admin.
            </div>
          </ComponentCard>
        </PageStack>
      </>
    );
  }

  return (
    <>
      <XPageMeta title="Utilisateurs en attente" description="Validation des comptes" />
      <PageStack>
        {(error || success) && (
          <div
            className={clsx(
              "rounded-sm border px-4 py-3 text-sm",
              error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
            )}
          >
            {error || success}
          </div>
        )}

        <ComponentCard title="Utilisateurs en attente" desc="Accepter ou refuser les inscriptions">
          {loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement des utilisateurs...</p>
          ) : users.length === 0 ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun utilisateur en attente.</p>
          ) : (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[24%]" />
                  <col className="w-[28%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Accept</th>
                    <th className="px-4 py-3">Refuse</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>{user.name}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{user.email}</td>
                      <td className="px-4 py-3"><StatusPill value={user.account_status} /></td>
                      <td className="px-4 py-3">
                        <Button size="sm" disabled={workingId === user.id} onClick={() => handleAccept(user.id)}>
                          Accepter
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={notes[user.id] ?? ""}
                            onChange={(e) => setNotes((current) => ({ ...current, [user.id]: e.target.value }))}
                            placeholder="Note"
                            className={clsx("min-w-0 flex-1 rounded-sm border px-2 py-1.5 text-xs focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                          />
                          <Button size="sm" variant="danger" disabled={workingId === user.id} onClick={() => handleRefuse(user.id)}>
                            Refuser
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </PageStack>
    </>
  );
}
