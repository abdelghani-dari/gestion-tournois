import { Link } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import { acceptUser, getAdminUsers, refuseUser, type AdminUser } from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
}

export default function AdminUsersPage() {
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      setUsers(await getAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadUsers(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, loadUsers]);

  const updatePendingUser = async (id: number, action: "accept" | "refuse") => {
    setWorkingId(id);
    setError("");
    try {
      if (action === "accept") {
        await acceptUser(id);
      } else {
        await refuseUser(id);
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Admin Utilisateurs" description="Tous les utilisateurs" />
      <PageStack>
        <ComponentCard
          title="Utilisateurs"
          desc="Vue administrateur"
          action={<Link to="/admin/users/pending" className="text-sm font-medium text-brand-500 hover:text-brand-400">Comptes en attente</Link>}
        >
          {!isAdmin ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Accès administrateur requis.</div>
          ) : error ? (
            <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          ) : loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p>
          ) : (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed text-sm">
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{user.id}</td>
                      <td className={clsx("px-4 py-3", t.textPrimary)}>{user.name}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{user.email}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{user.role}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{user.account_status}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        {user.account_status === "pending" ? (
                          <div className="flex gap-2">
                            <Button size="sm" disabled={workingId === user.id} onClick={() => updatePendingUser(user.id, "accept")}>Accept</Button>
                            <Button size="sm" variant="danger" disabled={workingId === user.id} onClick={() => updatePendingUser(user.id, "refuse")}>Refuse</Button>
                          </div>
                        ) : "-"}
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
