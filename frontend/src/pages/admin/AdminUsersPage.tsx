import { Link } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acceptUser,
  getAdminUsers,
  refuseUser,
  updateAdminUser,
  type AdminUser,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import SearchableSelect from "../../components/common/SearchableSelect";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { ACCOUNT_ROLE_COLORS, resolveAccountType, type AccountType } from "../../components/common/userRoleTheme";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
}

function RoleBadge({ user }: { user: AdminUser }) {
  const type: AccountType = user.role === "admin" ? "admin" : resolveAccountType(user);
  const colors = ACCOUNT_ROLE_COLORS[type];
  return (
    <span
      className="inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold"
      style={{ color: colors.main, backgroundColor: colors.bg }}
    >
      {user.role === "admin" ? "Admin" : type === "creator" ? "Organisateur" : "Utilisateur"}
    </span>
  );
}

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "Tous les rôles" },
  { value: "admin", label: "Administrateurs" },
  { value: "creator", label: "Organisateurs" },
  { value: "user", label: "Utilisateurs" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "Actif" },
  { value: "refused", label: "Refusé" },
];

const ROLE_OPTIONS = [
  { value: "user", label: "Utilisateur" },
  { value: "creator", label: "Organisateur" },
  { value: "admin", label: "Administrateur" },
];

export default function AdminUsersPage() {
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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
    if (!authLoading) void loadUsers();
  }, [authLoading, loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const type = user.role === "admin" ? "admin" : resolveAccountType(user);
      if (roleFilter !== "all" && type !== roleFilter) return false;
      if (!query) return true;
      return [user.name, user.email, user.role, user.account_status].join(" ").toLowerCase().includes(query);
    });
  }, [users, search, roleFilter]);

  const patchUser = async (id: number, payload: { role?: string; account_status?: string }) => {
    setWorkingId(id);
    setError("");
    try {
      await updateAdminUser(id, payload);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setWorkingId(null);
    }
  };

  const updatePendingUser = async (id: number, action: "accept" | "refuse") => {
    setWorkingId(id);
    setError("");
    try {
      if (action === "accept") await acceptUser(id);
      else await refuseUser(id);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Utilisateurs" description="Gestion des comptes" />
      <PageStack>
        <ComponentCard
          title="Utilisateurs"
          desc="Tous les comptes — rôles et statuts"
          action={
            <Link to="/admin/users/pending" className="text-sm font-medium text-brand-500 hover:text-brand-400">
              Comptes en attente
            </Link>
          }
        >
          {!isAdmin ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Accès administrateur requis.
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <FilterSearchInput value={search} onChange={setSearch} placeholder="Rechercher nom, email…" />
                </div>
                <div className="w-full sm:w-52">
                  <SearchableSelect
                    selectId="admin-users-role-filter"
                    variant="filter"
                    panelLabel="RÔLE"
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={ROLE_FILTER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  />
                </div>
              </div>

              {error ? (
                <div className="mb-4 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
              ) : null}

              {loading ? (
                <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p>
              ) : (
              <div className="relative">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead>
                      <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                        <th className="px-4 py-3">Utilisateur</th>
                        <th className="px-4 py-3">Rôle</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Inscription</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const isSelf = currentUser?.id === user.id;
                        const busy = workingId === user.id;
                        return (
                          <tr key={user.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                            <td className="px-4 py-3">
                              <p className={clsx("font-medium", t.textPrimary)}>{user.name}</p>
                              <p className={clsx("text-xs", t.textMuted)}>{user.email}</p>
                            </td>
                            <td className="relative overflow-visible px-4 py-3">
                              {isSelf ? (
                                <RoleBadge user={user} />
                              ) : (
                                <SearchableSelect
                                  selectId={`user-role-${user.id}`}
                                  variant="filter"
                                  value={user.role ?? "user"}
                                  onChange={(value) => void patchUser(user.id, { role: value })}
                                  options={ROLE_OPTIONS}
                                  disabled={busy}
                                />
                              )}
                            </td>
                            <td className="relative overflow-visible px-4 py-3">
                              <SearchableSelect
                                selectId={`user-status-${user.id}`}
                                variant="filter"
                                value={user.account_status ?? "pending"}
                                onChange={(value) => void patchUser(user.id, { account_status: value })}
                                options={STATUS_OPTIONS}
                                disabled={busy}
                              />
                            </td>
                            <td className={clsx("px-4 py-3", t.textSecondary)}>{formatDate(user.created_at)}</td>
                            <td className="px-4 py-3">
                              {user.account_status === "pending" ? (
                                <div className="flex gap-2">
                                  <Button size="sm" disabled={busy} onClick={() => void updatePendingUser(user.id, "accept")}>
                                    Accepter
                                  </Button>
                                  <Button size="sm" variant="danger" disabled={busy} onClick={() => void updatePendingUser(user.id, "refuse")}>
                                    Refuser
                                  </Button>
                                </div>
                              ) : (
                                <span className={clsx("inline-flex rounded-sm px-2 py-0.5 text-xs font-medium", statusTone(user.account_status))}>
                                  {statusLabel(user.account_status)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </PageStack>
    </>
  );
}
