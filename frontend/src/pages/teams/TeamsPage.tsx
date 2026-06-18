import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, createTeam, getMyTeams, type ApiTeam, type TeamPayload } from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon } from "../../icons";

const emptyTeamForm: TeamPayload = {
  name: "",
  city: "",
};

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function managerLabel(team: ApiTeam) {
  const manager = team.manager ?? team.user;
  if (!manager) return "-";
  if (manager.name && manager.email) return `${manager.name} (${manager.email})`;
  return manager.name ?? manager.email ?? "-";
}

export default function TeamsPage() {
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [form, setForm] = useState<TeamPayload>(emptyTeamForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTeams = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const data = await getMyTeams();
      setTeams(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger vos équipes.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadTeams();
    }
    if (!authLoading && !isAuthenticated) {
      setTeams([]);
    }
  }, [authLoading, isAuthenticated]);

  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((team) =>
      [team.name, team.city ?? "", managerLabel(team)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [teams, searchQuery]);

  const handleCreateTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await createTeam({
        name: form.name,
        city: form.city?.trim() || undefined,
      });
      setSuccess("Équipe créée.");
      setForm(emptyTeamForm);
      await loadTeams();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de créer l'équipe.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <XPageMeta title="Équipes" description="Mes équipes" />
      <PageStack>
        {!authLoading && !isAuthenticated ? (
          <ComponentCard title="Équipes" desc="Connexion requise">
            <p className={clsx("text-sm", t.textSecondary)}>
              Connectez-vous pour créer et gérer vos équipes.
            </p>
            <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
              Aller a la connexion
            </Link>
          </ComponentCard>
        ) : (
          <>
            <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
              <ComponentCard title="Mon compte" desc={user ? `${user.email} - ${user.role}` : "Compte connecté"}>
                <div className={clsx("rounded-md border p-4", t.card)}>
                  <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Équipes créées</p>
                  <p className={clsx("mt-1 text-3xl font-bold", t.textPrimary)}>{teams.length}</p>
                </div>
              </ComponentCard>

              <ComponentCard title="Créer une équipe" desc="Votre compte sera associé automatiquement" className="xl:col-span-2">
                <form onSubmit={handleCreateTeam} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="team-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
                    <input
                      id="team-name"
                      name="name"
                      value={form.name}
                      onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                      required
                      disabled={submitting}
                      className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                    />
                  </div>
                  <div>
                    <label htmlFor="team-city" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
                    <input
                      id="team-city"
                      name="city"
                      value={form.city}
                      onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                      disabled={submitting}
                      className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    {success && (
                      <div className="mb-3 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {success}
                      </div>
                    )}
                    {error && (
                      <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                      </div>
                    )}
                    <Button type="submit" disabled={submitting} className="gap-2">
                      <PlusIcon className="size-4 shrink-0" />
                      {submitting ? "Création..." : "Créer l'équipe"}
                    </Button>
                  </div>
                </form>
              </ComponentCard>
            </div>

            <ComponentCard title="Mes équipes" desc="Équipes créées avec votre compte">
              <div className="mb-4">
                <FilterSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Rechercher une equipe..."
                />
              </div>

              {loading && (
                <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement de vos équipes...</p>
              )}

              {!loading && !error && teams.length === 0 && (
                <p className={clsx("py-10 text-center text-sm", t.textMuted)}>
                  Aucune équipe disponible.
                </p>
              )}

              {!loading && teams.length > 0 && (
                <div className="x-scroll overflow-x-auto">
                  <table className="w-full min-w-[760px] table-fixed text-sm">
                    <colgroup>
                      <col className="w-[70px]" />
                      <col className="w-[28%]" />
                      <col className="w-[20%]" />
                      <col className="w-[32%]" />
                      <col className="w-[20%]" />
                    </colgroup>
                    <thead>
                      <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Ville</th>
                        <th className="px-4 py-3">Manager</th>
                        <th className="px-4 py-3">Création</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((team) => (
                        <tr key={team.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                          <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{team.id}</td>
                          <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>{team.name}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{team.city || "-"}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>
                            <span className="block truncate" title={managerLabel(team)}>{managerLabel(team)}</span>
                          </td>
                          <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDate(team.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ComponentCard>
          </>
        )}
      </PageStack>
    </>
  );
}
