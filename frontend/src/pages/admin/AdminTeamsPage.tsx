import { Link } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminTeam,
  deleteTeam,
  getAdminTeams,
  getAdminUsers,
  type AdminUser,
  type ApiTeam,
  type TeamPayload,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import XModal from "../../components/common/XModal";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

const emptyForm: TeamPayload = {
  name: "",
  short_name: "",
  city: "",
  logo_path: "",
  manager_id: "",
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
}

function managerText(team: ApiTeam) {
  if (!team.manager) return "-";
  if (team.manager.name && team.manager.email) return `${team.manager.name} (${team.manager.email})`;
  return team.manager.name || team.manager.email || "-";
}

export default function AdminTeamsPage() {
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<TeamPayload>(emptyForm);
  const [logoMode, setLogoMode] = useState<ImageSourceMode>("url");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const [teamsData, usersData] = await Promise.all([getAdminTeams(), getAdminUsers()]);
      setTeams(teamsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les équipes.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadData(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, loadData]);

  const filteredTeams = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teams;
    return teams.filter((team) =>
      [team.name, team.short_name, team.city, team.manager?.name, team.manager?.email]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [search, teams]);

  const closeCreate = () => {
    setCreateOpen(false);
    setForm(emptyForm);
    setLogoFile(null);
    setLogoMode("url");
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createAdminTeam(form);
      closeCreate();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team: ApiTeam) => {
    if (!window.confirm(`Supprimer l'equipe "${team.name}" ?`)) return;

    setDeletingId(team.id);
    setError("");
    setSuccess("");

    try {
      await deleteTeam(team.id);
      setSuccess("Equipe supprimee.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Gestion des équipes" description="Toutes les équipes enregistrées" />
      <PageStack>
        <ComponentCard
          title="Gestion des équipes"
          desc="Toutes les équipes enregistrées"
          action={<Button type="button" onClick={() => setCreateOpen(true)}>Créer une équipe</Button>}
        >
          {!isAdmin ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Accès administrateur requis.</div>
          ) : (
            <div className="space-y-5">
              <input
                className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)}
                placeholder="Rechercher une équipe, ville ou responsable"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

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

              {loading ? (
                <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p>
              ) : filteredTeams.length === 0 ? (
                <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucune équipe disponible.</p>
              ) : (
                <div className="x-scroll overflow-x-auto">
                  <table className="w-full min-w-[1080px] table-fixed text-sm">
                    <thead>
                      <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Logo</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Nom court</th>
                        <th className="px-4 py-3">Ville</th>
                        <th className="px-4 py-3">Responsable</th>
                        <th className="px-4 py-3">Joueurs</th>
                        <th className="px-4 py-3">Créé le</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((team) => (
                        <tr key={team.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                          <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{team.id}</td>
                          <td className="px-4 py-3"><EntityImage src={team.logo_path} name={team.name} className="h-9 w-9 rounded-sm" /></td>
                          <td className={clsx("px-4 py-3", t.textPrimary)}>{team.name}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{team.short_name || "-"}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{team.city || "-"}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{managerText(team)}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{team.players_count ?? team.players?.length ?? 0}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{formatDate(team.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/admin/teams/${team.id}`} className="text-sm font-medium text-brand-500 hover:text-brand-400">Voir détails</Link>
                              <Button type="button" size="sm" variant="danger" disabled={deletingId === team.id} onClick={() => handleDelete(team)}>
                                {deletingId === team.id ? "Suppression..." : "Supprimer"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </ComponentCard>

        <XModal open={createOpen} onClose={closeCreate} title="Créer une équipe" className="max-w-3xl">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Nom *" value={form.name} required onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Nom court" value={form.short_name} onChange={(e) => setForm((current) => ({ ...current, short_name: e.target.value }))} />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Ville" value={form.city} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))} />
            <select className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} value={form.manager_id} onChange={(e) => setForm((current) => ({ ...current, manager_id: e.target.value ? Number(e.target.value) : "" }))}>
              <option value="">Responsable: admin actuel</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.name} - {user.email}</option>)}
            </select>
            <div className="md:col-span-2">
              <ImageSourceInput
                label="Logo"
                name="logo"
                mode={logoMode}
                onModeChange={setLogoMode}
                file={logoFile}
                onFileChange={(file) => {
                  setLogoFile(file);
                  setForm((current) => ({ ...current, logo: file }));
                }}
                url={form.logo_path ?? ""}
                onUrlChange={(value) => setForm((current) => ({ ...current, logo_path: value, logo_url: value }))}
                previewName={form.name || "Équipe"}
                disabled={saving}
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="secondary" onClick={closeCreate} disabled={saving}>Annuler</Button>
              <Button type="submit" disabled={saving}>{saving ? "Création..." : "Créer une équipe"}</Button>
            </div>
          </form>
        </XModal>
      </PageStack>
    </>
  );
}
