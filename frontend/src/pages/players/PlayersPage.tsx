/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { Link, useSearchParams } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createPlayer,
  deletePlayer,
  getMyTeams,
  getPlayers,
  getTeams,
  getTournaments,
  updatePlayer,
  type ApiPlayer,
  type ApiTeam,
  type PaginatedResult,
  type PlayerPayload,
  type PublicTournament,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import ComponentCard from "../../components/common/ComponentCard";
import GlassCard from "../../components/common/GlassCard";
import ConfirmModal from "../../components/common/ConfirmModal";
import FormSearchableSelect from "../../components/common/FormSearchableSelect";
import { teamSelectOptions } from "../../components/common/selectOptionBuilders";
import { resolvePlayerPhoto } from "../../components/common/playerAssets";
import NationalityFlag from "../../components/ui/NationalityFlag";
import { MOROCCO_COUNTRY, MOROCCO_FLAG_URL } from "../../components/common/nationalityAssets";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import FormDrawer from "../../components/common/FormDrawer";
import { formInputClass, modalFormFooterClass } from "../../components/common/formStyles";
import MediaImage from "../../components/common/MediaImage";
import SearchableFilter, { DropdownGroupProvider } from "../../components/common/SearchableFilter";
import XModal from "../../components/common/XModal";
import PlayersTable from "../../components/players/PlayersTable";
import ScorersRankingTable from "../../components/players/ScorersRankingTable";
import TableRowsSkeleton from "../../components/common/skeletons/TableRowsSkeleton";
import PaginationControls from "../../components/common/PaginationControls";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { canDeletePlayer, canEditPlayer } from "../../utils/permissions";
import FilterTabs from "../../components/common/FilterTabs";
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

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function PlayersPage() {
  const t = useThemeTokens();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [scopeFilter, setScopeFilter] = useState<"all" | "my">("all");
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [myTeams, setMyTeams] = useState<ApiTeam[]>([]);
  const [form, setForm] = useState<PlayerForm>(emptyPlayerForm);
  const [photoMode, setPhotoMode] = useState<ImageSourceMode>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<ApiPlayer | null>(null);
  const [detailsPlayer, setDetailsPlayer] = useState<ApiPlayer | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<ApiPlayer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [myTeamsLoading, setMyTeamsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [topScorers, setTopScorers] = useState<ApiPlayer[]>([]);

  const teamFilterId = searchParams.get("team") ? Number(searchParams.get("team")) : null;
  const tournamentFilterId = searchParams.get("tournament") ? Number(searchParams.get("tournament")) : null;

  const setFilter = useCallback(
    (key: "team" | "tournament", value: number | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, String(value));
        return next;
      });
    },
    [setSearchParams],
  );

  const loadPlayers = async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {
        search: searchQuery.trim() || undefined,
        team_id: teamFilterId,
        tournament_id: tournamentFilterId,
        manager_id: scopeFilter === "my" && user?.id ? user.id : undefined,
        page,
        per_page: pageSize,
      };
      const [playersResult, teamsData, tournamentsData, scorersResult] = await Promise.all([
        getPlayers(filters),
        getTeams({ tournament_id: tournamentFilterId }),
        getTournaments(),
        getPlayers({
          search: searchQuery.trim() || undefined,
          team_id: teamFilterId,
          tournament_id: tournamentFilterId,
          manager_id: scopeFilter === "my" && user?.id ? user.id : undefined,
          per_page: 50,
        }),
      ]);

      const paginated = playersResult as PaginatedResult<ApiPlayer>;
      setPlayers(paginated.data);
      setTotalPlayers(paginated.meta.total);
      setTeams(Array.isArray(teamsData) ? teamsData : teamsData.data);
      setTournaments(tournamentsData);
      setTopScorers(Array.isArray(scorersResult) ? scorersResult : scorersResult.data);
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
    const timer = window.setTimeout(() => {
      void loadPlayers();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery, teamFilterId, tournamentFilterId, scopeFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, teamFilterId, tournamentFilterId, scopeFilter, pageSize]);

  useEffect(() => {
    if (!authLoading) {
      void loadMyTeams();
    }
  }, [authLoading, isAuthenticated]);

  const teamOptions = useMemo(
    () => teams.map((team) => ({ id: team.id, label: team.name })),
    [teams],
  );

  const tournamentOptions = useMemo(
    () => tournaments.map((tournament) => ({ id: tournament.id, label: tournament.name })),
    [tournaments],
  );

  const deletableTeamIds = useMemo(() => {
    const ids = teams
      .filter((team) => canDeletePlayer(user, team))
      .map((team) => team.id);
    return new Set(ids);
  }, [teams, user]);

  const editableTeamIds = useMemo(() => {
    const ids = teams
      .filter((team) => canEditPlayer(user, team))
      .map((team) => team.id);
    return new Set(ids);
  }, [teams, user]);

  const hasFilters =
    searchQuery.trim() !== "" || teamFilterId !== null || tournamentFilterId !== null;

  const resetFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

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
      setSuccess("Joueur créé.");
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

  const openEditPlayer = (player: ApiPlayer) => {
    if (!editableTeamIds.has(player.team_id)) return;
    setEditingPlayer(player);
    setDetailsPlayer(null);
    setForm({
      team_id: String(player.team_id),
      first_name: player.first_name,
      last_name: player.last_name,
      birth_date: player.birth_date ?? "",
      position: player.position ?? "",
      number: player.number != null ? String(player.number) : "",
      photo_path: player.photo_path ?? "",
    });
    setPhotoFile(null);
    setPhotoMode(player.photo_path ? "url" : "upload");
    setError("");
    setSuccess("");
  };

  const closeEditPlayer = () => {
    setEditingPlayer(null);
    setForm(emptyPlayerForm);
    setPhotoFile(null);
  };

  const handleUpdatePlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await updatePlayer(editingPlayer.id, {
        team_id: Number(form.team_id),
        first_name: form.first_name,
        last_name: form.last_name,
        birth_date: form.birth_date || undefined,
        position: form.position.trim() || undefined,
        number: form.number ? Number(form.number) : undefined,
        photo: photoFile,
        photo_url: form.photo_path.trim() || undefined,
      });
      setSuccess("Joueur modifié.");
      closeEditPlayer();
      await loadPlayers();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de modifier le joueur.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    setDeletingId(playerToDelete.id);
    setSuccess("");
    setError("");

    try {
      await deletePlayer(playerToDelete.id);
      setSuccess("Joueur supprimé.");
      if (detailsPlayer?.id === playerToDelete.id) setDetailsPlayer(null);
      setPlayerToDelete(null);
      await loadPlayers();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer les joueurs de vos équipes.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer le joueur.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Joueurs" description="Effectifs de la saison active" />
      <PageStack>
        <SectionBar
          action={
            isAuthenticated && myTeams.length > 0 ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Ajouter
              </Button>
            ) : undefined
          }
        >
          <DropdownGroupProvider>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un joueur…"
              />
              <SearchableFilter
                filterId="players-team"
                label="Équipe"
                value={teamFilterId}
                options={teamOptions}
                onChange={(id) => setFilter("team", id)}
                allLabel="Toutes les équipes"
                searchPlaceholder="Rechercher…"
              />
              <SearchableFilter
                filterId="players-tournament"
                label="Tournoi"
                value={tournamentFilterId}
                options={tournamentOptions}
                onChange={(id) => setFilter("tournament", id)}
                allLabel="Tous tournois"
                searchPlaceholder="Rechercher…"
              />
              {isAuthenticated && (
                <FilterTabs
                  tabs={[
                    { id: "all", label: "Tous les joueurs" },
                    { id: "my", label: "Mes joueurs" },
                  ]}
                  active={scopeFilter}
                  onChange={(val) => setScopeFilter(val as "all" | "my")}
                />
              )}
              {hasFilters && (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </DropdownGroupProvider>
        </SectionBar>

        {(success || error) && (
          <div
            className={clsx(
              "rounded-sm border px-4 py-3 text-sm",
              error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
            )}
          >
            {error || success}
          </div>
        )}

        {!isAuthenticated && !authLoading && (
          <p className={clsx("text-sm", t.textSecondary)}>
            <Link to="/login" className="font-medium text-brand-500 hover:text-brand-400">
              Connectez-vous
            </Link>{" "}
            pour ajouter un joueur à vos équipes.
          </p>
        )}

        {isAuthenticated && myTeams.length === 0 && !myTeamsLoading && (
          <p className={clsx("text-sm", t.textSecondary)}>Créez d'abord une équipe.</p>
        )}

        {loading && (
          <div className={clsx("grid grid-cols-1 xl:grid-cols-4", GRID_GAP)}>
            <div className="xl:col-span-3">
              <GlassCard padding="none" className="overflow-hidden">
                <TableRowsSkeleton rows={12} className="rounded-none border-0" />
              </GlassCard>
            </div>
            <div className="xl:col-span-1">
              <ComponentCard title="Classement buteurs" desc="Chargement...">
                <TableRowsSkeleton rows={10} compact className="rounded-none border-0" />
              </ComponentCard>
            </div>
          </div>
        )}

        {!loading && (
          <div className={clsx("grid grid-cols-1 xl:grid-cols-4", GRID_GAP)}>
            <div className="xl:col-span-3">
              <PlayersTable
                players={players}
                teams={teams}
                emptyMessage="Aucun joueur"
                onSelect={setDetailsPlayer}
              />
              <PaginationControls
                page={page}
                pageSize={pageSize}
                totalItems={totalPlayers}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
            <div className="xl:col-span-1">
              <ComponentCard title="Classement buteurs" desc={`${totalPlayers} joueurs · G`}>
                <ScorersRankingTable
                  players={topScorers}
                  teams={teams}
                  onSelect={setDetailsPlayer}
                />
              </ComponentCard>
            </div>
          </div>
        )}

        <FormDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Ajouter un joueur"
          description="Renseignez les informations du joueur."
          className="max-w-lg w-full"
        >
          <form onSubmit={handleCreatePlayer} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormSearchableSelect
              id="player-team"
              label="Équipe *"
              className="md:col-span-1"
              value={form.team_id}
              onChange={(value) => updateForm("team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submitting || myTeamsLoading}
              options={teamSelectOptions(myTeams, user?.id)}
            />
            <div>
              <label htmlFor="player-first-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Prénom *</label>
              <input
                id="player-first-name"
                name="first_name"
                value={form.first_name}
                onChange={(e) => updateForm("first_name", e.target.value)}
                required
                disabled={submitting}
                placeholder="Youssef"
                className={formInputClass(t)}
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
                placeholder="En-Nesyri"
                className={formInputClass(t)}
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
                className={formInputClass(t)}
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
                className={formInputClass(t)}
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
                placeholder="9"
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div className="md:col-span-3">
              <ImageSourceInput
                label="Photo"
                name="photo"
                variant="photo"
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
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submitting || myTeams.length === 0} className="w-full sm:w-auto">
                  {submitting ? "Création..." : "Créer le joueur"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <FormDrawer
          open={Boolean(editingPlayer)}
          onClose={closeEditPlayer}
          title="Modifier le joueur"
          description={editingPlayer ? playerName(editingPlayer) : undefined}
          className="max-w-lg w-full"
        >
          <form onSubmit={handleUpdatePlayer} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormSearchableSelect
              id="edit-player-team"
              label="Équipe *"
              className="md:col-span-1"
              value={form.team_id}
              onChange={(value) => updateForm("team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submitting}
              options={teamSelectOptions(myTeams, user?.id)}
            />
            <div>
              <label htmlFor="edit-player-first-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Prénom *</label>
              <input
                id="edit-player-first-name"
                value={form.first_name}
                onChange={(e) => updateForm("first_name", e.target.value)}
                required
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div>
              <label htmlFor="edit-player-last-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
              <input
                id="edit-player-last-name"
                value={form.last_name}
                onChange={(e) => updateForm("last_name", e.target.value)}
                required
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div>
              <label htmlFor="edit-player-birth-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Naissance</label>
              <input
                id="edit-player-birth-date"
                type="date"
                value={form.birth_date}
                onChange={(e) => updateForm("birth_date", e.target.value)}
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div>
              <label htmlFor="edit-player-position" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Poste</label>
              <input
                id="edit-player-position"
                value={form.position}
                onChange={(e) => updateForm("position", e.target.value)}
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div>
              <label htmlFor="edit-player-number" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Numéro</label>
              <input
                id="edit-player-number"
                type="number"
                min={0}
                value={form.number}
                onChange={(e) => updateForm("number", e.target.value)}
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div className="md:col-span-3">
              <ImageSourceInput
                label="Photo"
                name="edit-photo"
                variant="photo"
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
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <XModal
          open={Boolean(detailsPlayer)}
          onClose={() => setDetailsPlayer(null)}
          title={detailsPlayer ? playerName(detailsPlayer) : "Détails du joueur"}
        >
          {detailsPlayer && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <MediaImage
                  src={detailsPlayer.photo_path}
                  fallback={resolvePlayerPhoto(null)}
                  alt={playerName(detailsPlayer)}
                  className="h-20 w-20 shrink-0 object-contain"
                />
                <div>
                  <p className={clsx("text-base font-semibold", t.textPrimary)}>{playerName(detailsPlayer)}</p>
                  <p className={clsx("text-sm", t.textSecondary)}>
                    {teamName(detailsPlayer, teams)}{detailsPlayer.number != null ? ` · #${detailsPlayer.number}` : ""}
                  </p>
                  <div className="mt-2">
                    <NationalityFlag flagUrl={MOROCCO_FLAG_URL} country={MOROCCO_COUNTRY} size="md" />
                  </div>
                </div>
              </div>
              {[
                ["Nom", playerName(detailsPlayer)],
                ["Poste", detailsPlayer.position || "-"],
                ["Numéro", detailsPlayer.number != null ? String(detailsPlayer.number) : "-"],
                ["Équipe", teamName(detailsPlayer, teams)],
                ["Buts", String(detailsPlayer.goals ?? 0)],
                ["Passes déc.", String(detailsPlayer.assists ?? 0)],
                ["Création", formatDate(detailsPlayer.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className={t.textMuted}>{label}</span>
                  <span className={clsx("text-right", t.textPrimary)}>{value}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button type="button" variant="secondary" size="sm" onClick={() => setDetailsPlayer(null)}>
                  Fermer
                </Button>
                {isAuthenticated && editableTeamIds.has(detailsPlayer.team_id) && (
                  <Button type="button" size="sm" onClick={() => openEditPlayer(detailsPlayer)}>
                    Modifier
                  </Button>
                )}
                {isAuthenticated && deletableTeamIds.has(detailsPlayer.team_id) && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={deletingId === detailsPlayer.id}
                    onClick={() => setPlayerToDelete(detailsPlayer)}
                  >
                    {deletingId === detailsPlayer.id ? "Suppression..." : "Supprimer"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </XModal>

        <ConfirmModal
          open={Boolean(playerToDelete)}
          onClose={() => setPlayerToDelete(null)}
          title="Supprimer le joueur"
          message={
            playerToDelete
              ? `Voulez-vous vraiment supprimer « ${playerName(playerToDelete)} » ? Cette action est irréversible.`
              : ""
          }
          confirmLabel="Supprimer"
          loading={deletingId !== null}
          onConfirm={() => void handleDeletePlayer()}
        />
      </PageStack>
    </>
  );
}
