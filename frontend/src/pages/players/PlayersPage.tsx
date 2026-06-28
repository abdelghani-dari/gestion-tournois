/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createPlayer,
  deletePlayer,
  getMyTeams,
  getPlayers,
  getTeams,
  type ApiPlayer,
  type ApiTeam,
  type PlayerPayload,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import FormDrawer from "../../components/common/FormDrawer";
import PaginationControls, { usePagination } from "../../components/common/PaginationControls";
import XModal from "../../components/common/XModal";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon } from "../../icons";

type PlayerForm = {
  team_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: string;
  number: string;
  photo_path: string;
};

const emptyPlayerForm: PlayerForm = {
  team_id: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  position: "",
  number: "",
  photo_path: "",
};

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function playerName(player: ApiPlayer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

function teamName(player: ApiPlayer, teams: ApiTeam[]) {
  return player.team?.name ?? teams.find((team) => team.id === player.team_id)?.name ?? `Équipe #${player.team_id}`;
}

export default function PlayersPage() {
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [myTeams, setMyTeams] = useState<ApiTeam[]>([]);
  const [form, setForm] = useState<PlayerForm>(emptyPlayerForm);
  const [photoMode, setPhotoMode] = useState<ImageSourceMode>("url");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsPlayer, setDetailsPlayer] = useState<ApiPlayer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [myTeamsLoading, setMyTeamsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPlayers = async () => {
    setLoading(true);
    setError("");

    try {
      const [playersData, teamsData] = await Promise.all([getPlayers(), getTeams()]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les joueurs.");
    } finally {
      setLoading(false);
    }
  };

  const loadMyTeams = async () => {
    if (!isAuthenticated) {
      setMyTeams([]);
      return;
    }

    setMyTeamsLoading(true);

    try {
      const data = await getMyTeams();
      setMyTeams(data);
      setForm((current) => ({
        ...current,
        team_id: current.team_id || (data[0]?.id ? String(data[0].id) : ""),
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger vos équipes.");
      }
    } finally {
      setMyTeamsLoading(false);
    }
  };

  useEffect(() => {
    void loadPlayers();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      void loadMyTeams();
    }
  }, [authLoading, isAuthenticated]);

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((player) =>
      [
        player.id,
        playerName(player),
        teamName(player, teams),
        player.position ?? "",
        player.number ?? "",
        player.birth_date ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [players, teams, searchQuery]);
  const playersPagination = usePagination(filteredPlayers, searchQuery);

  const deletableTeamIds = useMemo(
    () => new Set(myTeams.map((team) => team.id)),
    [myTeams],
  );

  const updateForm = (key: keyof PlayerForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreatePlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || myTeams.length === 0) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    const payload: PlayerPayload = {
      team_id: Number(form.team_id),
      first_name: form.first_name,
      last_name: form.last_name,
      birth_date: form.birth_date || undefined,
      position: form.position.trim() || undefined,
      number: form.number ? Number(form.number) : undefined,
      photo: photoFile,
      photo_url: form.photo_path.trim() || undefined,
    };

    try {
      await createPlayer(payload);
      setSuccess("Player created.");
      setForm({ ...emptyPlayerForm, team_id: form.team_id });
      setPhotoFile(null);
      await loadPlayers();
      setCreateOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de créer le joueur.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlayer = async (player: ApiPlayer) => {
    if (!window.confirm(`Supprimer le joueur "${playerName(player)}" ?`)) return;

    setDeletingId(player.id);
    setSuccess("");
    setError("");

    try {
      await deletePlayer(player.id);
      setSuccess("Joueur supprime.");
      if (detailsPlayer?.id === player.id) setDetailsPlayer(null);
      await loadPlayers();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expire. Veuillez vous reconnecter.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer les joueurs de vos equipes.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer le joueur.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Joueurs" description="Liste des joueurs" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Joueurs" desc="Données enregistrées">
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Total joueurs</p>
              <p className={clsx("mt-1 text-3xl font-bold", t.textPrimary)}>{players.length}</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Créer un joueur" desc="Associé à une de vos équipes" className="xl:col-span-2">
            <div className={clsx("flex flex-col gap-4 rounded-md border p-5 sm:flex-row sm:items-center sm:justify-between", t.card)}>
              <div>
                <p className={clsx("font-semibold", t.textPrimary)}>Ajouter un joueur</p>
                <p className={clsx("mt-1 text-sm", t.textSecondary)}>
                  Ouvrez le formulaire uniquement quand vous ajoutez un effectif.
                </p>
              </div>
              <Button type="button" disabled={!isAuthenticated || myTeams.length === 0} onClick={() => setCreateOpen(true)} className="gap-2">
                <PlusIcon className="size-4 shrink-0" />
                Ajouter un joueur
              </Button>
            </div>
            {!isAuthenticated && !authLoading && (
              <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
                Aller a la connexion
              </Link>
            )}
            {isAuthenticated && myTeams.length === 0 && !myTeamsLoading && (
              <p className={clsx("mt-4 text-sm", t.textSecondary)}>Créez d'abord une équipe.</p>
            )}
          </ComponentCard>
        </div>

        <ComponentCard title="Liste des joueurs" desc="Joueurs enregistrés">
          <div className="mb-4">
            <FilterSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un joueur..."
            />
          </div>

          {(success || error) && (
            <div
              className={clsx(
                "mb-4 rounded-sm border px-4 py-3 text-sm",
                error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
              )}
            >
              {error || success}
            </div>
          )}

          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des joueurs...</p>
          )}

          {!loading && !error && players.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          )}

          {!loading && players.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[980px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[17%]" />
                  <col className="w-[17%]" />
                  <col className="w-[24%]" />
                  <col className="w-[13%]" />
                  <col className="w-[10%]" />
                  <col className="w-[17%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Prénom</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Équipe</th>
                    <th className="px-4 py-3">Poste</th>
                    <th className="px-4 py-3">Numéro</th>
                    <th className="px-4 py-3">Naissance</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playersPagination.paginatedItems.map((player) => (
                    <tr key={player.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{player.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <EntityImage src={player.photo_path} name={playerName(player)} className="h-9 w-9 shrink-0 rounded-sm" />
                          <span className={clsx("truncate font-medium", t.textPrimary)}>{player.first_name}</span>
                        </div>
                      </td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>{player.last_name}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={teamName(player, teams)}>{teamName(player, teams)}</span>
                      </td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{player.position || "-"}</td>
                      <td className={clsx("px-4 py-3 font-mono tabular-nums", t.textSecondary)}>{player.number ?? "-"}</td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDate(player.birth_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => setDetailsPlayer(player)}>
                            Détails
                          </Button>
                          {deletableTeamIds.has(player.team_id) && (
                            <Button type="button" size="sm" variant="danger" disabled={deletingId === player.id} onClick={() => handleDeletePlayer(player)}>
                              {deletingId === player.id ? "Suppression..." : "Supprimer"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls
                page={playersPagination.page}
                pageSize={playersPagination.pageSize}
                totalItems={filteredPlayers.length}
                onPageChange={playersPagination.setPage}
                onPageSizeChange={playersPagination.setPageSize}
              />
            </div>
          )}
        </ComponentCard>

        <FormDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Ajouter un joueur"
          description="Renseignez les informations du joueur."
        >
          <form onSubmit={handleCreatePlayer} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="player-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe *</label>
              <select
                id="player-team"
                name="team_id"
                value={form.team_id}
                onChange={(e) => updateForm("team_id", e.target.value)}
                required
                disabled={submitting || myTeamsLoading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">Sélectionner une équipe</option>
                {myTeams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="player-first-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Prenom *</label>
              <input
                id="player-first-name"
                name="first_name"
                value={form.first_name}
                onChange={(e) => updateForm("first_name", e.target.value)}
                required
                disabled={submitting}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div>
              <label htmlFor="player-last-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
              <input
                id="player-last-name"
                name="last_name"
                value={form.last_name}
                onChange={(e) => updateForm("last_name", e.target.value)}
                required
                disabled={submitting}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div>
              <label htmlFor="player-birth-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Naissance</label>
              <input
                id="player-birth-date"
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={(e) => updateForm("birth_date", e.target.value)}
                disabled={submitting}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div>
              <label htmlFor="player-position" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Poste</label>
              <input
                id="player-position"
                name="position"
                value={form.position}
                onChange={(e) => updateForm("position", e.target.value)}
                placeholder="ST"
                disabled={submitting}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div>
              <label htmlFor="player-number" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Numéro</label>
              <input
                id="player-number"
                name="number"
                type="number"
                min={0}
                value={form.number}
                onChange={(e) => updateForm("number", e.target.value)}
                disabled={submitting}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div className="md:col-span-3">
              <ImageSourceInput
                label="Photo"
                name="photo"
                mode={photoMode}
                onModeChange={setPhotoMode}
                file={photoFile}
                onFileChange={setPhotoFile}
                url={form.photo_path}
                onUrlChange={(value) => updateForm("photo_path", value)}
                previewName={`${form.first_name} ${form.last_name}`.trim() || "Joueur"}
                disabled={submitting}
              />
            </div>
            <div className="md:col-span-3">
              {error && (
                <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={submitting || myTeams.length === 0} className="gap-2">
                <PlusIcon className="size-4 shrink-0" />
                {submitting ? "Création..." : "Créer le joueur"}
              </Button>
            </div>
          </form>
        </FormDrawer>

        <XModal
          open={Boolean(detailsPlayer)}
          onClose={() => setDetailsPlayer(null)}
          title={detailsPlayer ? playerName(detailsPlayer) : "Détails du joueur"}
        >
          {detailsPlayer && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-4">
                <EntityImage src={detailsPlayer.photo_path} name={playerName(detailsPlayer)} className="h-16 w-16 shrink-0 rounded-md" />
                <div>
                  <p className={clsx("text-base font-semibold", t.textPrimary)}>{playerName(detailsPlayer)}</p>
                  <p className={clsx("text-sm", t.textSecondary)}>
                    {teamName(detailsPlayer, teams)}{detailsPlayer.number != null ? ` - #${detailsPlayer.number}` : ""}
                  </p>
                </div>
              </div>
              {[
                ["Nom", playerName(detailsPlayer)],
                ["Poste", detailsPlayer.position || "-"],
                ["Numéro", detailsPlayer.number != null ? String(detailsPlayer.number) : "-"],
                ["Équipe", teamName(detailsPlayer, teams)],
                ["Création", formatDate(detailsPlayer.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className={t.textMuted}>{label}</span>
                  <span className={clsx("text-right", t.textPrimary)}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </XModal>
      </PageStack>
    </>
  );
}
