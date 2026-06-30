/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createTeam,
  deleteTeam,
  getPlayers,
  getTeams,
  getTournaments,
  updateTeam,
  type ApiPlayer,
  type ApiTeam,
  type PaginatedResult,
  type PublicTournament,
  type TeamPayload,
} from "../../api";
import ConfirmModal from "../../components/common/ConfirmModal";
import PaginationControls from "../../components/common/PaginationControls";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import SearchableFilter, { DropdownGroupProvider } from "../../components/common/SearchableFilter";
import FormDrawer from "../../components/common/FormDrawer";
import { formInputClass, modalFormFooterClass } from "../../components/common/formStyles";
import TeamCard from "../../components/teams/TeamCard";
import TeamCardSkeleton from "../../components/common/skeletons/TeamCardSkeleton";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { canDeleteTeam, canEditTeam } from "../../utils/permissions";
import FilterTabs from "../../components/common/FilterTabs";

const PAGE_SIZE_OPTIONS = [8, 12, 24];
const emptyTeamForm: TeamPayload = {
  name: "",
  short_name: "",
  logo_path: "",
  city: "",
};

export default function TeamsPage() {
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [scopeFilter, setScopeFilter] = useState<"all" | "my">("all");
  const [form, setForm] = useState<TeamPayload>(emptyTeamForm);
  const [logoMode, setLogoMode] = useState<ImageSourceMode>("upload");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ApiTeam | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<ApiTeam | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalTeams, setTotalTeams] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTeams = async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {
        search: searchQuery.trim() || undefined,
        tournament_id: tournamentId,
        manager_id: scopeFilter === "my" && user?.id ? user.id : undefined,
        page,
        per_page: pageSize,
      };
      const [teamsResult, tournamentsData] = await Promise.all([
        getTeams(filters),
        getTournaments(),
      ]);

      const paginated = teamsResult as PaginatedResult<ApiTeam>;
      const visibleTeams = paginated.data;
      setTeams(visibleTeams);
      setTotalTeams(paginated.meta.total);

      if (visibleTeams.length > 0) {
        const playerBatches = await Promise.all(
          visibleTeams.map((team) => getPlayers({ team_id: team.id, per_page: 50 })),
        );
        setPlayers(
          playerBatches.flatMap((batch) => (Array.isArray(batch) ? batch : batch.data)),
        );
      } else {
        setPlayers([]);
      }

      setTournaments(tournamentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les équipes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => {
        void loadTeams();
      }, 250);
      return () => window.clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated, searchQuery, tournamentId, scopeFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, tournamentId, scopeFilter, pageSize]);

  const tournamentOptions = useMemo(
    () => tournaments.map((tournament) => ({ id: tournament.id, label: tournament.name })),
    [tournaments],
  );

  const hasFilters = searchQuery.trim() !== "" || tournamentId !== null;

  const resetFilters = () => {
    setSearchQuery("");
    setTournamentId(null);
  };

  const handleCreateTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await createTeam({
        name: form.name,
        short_name: form.short_name?.trim() || undefined,
        logo: logoFile,
        logo_url: form.logo_path?.trim() || undefined,
        city: form.city?.trim() || undefined,
      });
      setSuccess("Équipe créée.");
      setForm(emptyTeamForm);
      setLogoFile(null);
      await loadTeams();
      setCreateOpen(false);
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

  const openEditTeam = (team: ApiTeam) => {
    if (!canEditTeam(user, team)) return;
    setEditingTeam(team);
    setForm({
      name: team.name,
      short_name: team.short_name ?? "",
      logo_path: team.logo_path ?? "",
      city: team.city ?? "",
    });
    setLogoFile(null);
    // If there is any existing path/url, switch to URL mode so user can see it
    setLogoMode(team.logo_path ? "url" : "upload");
    setError("");
    setSuccess("");
  };

  const closeEditTeam = () => {
    setEditingTeam(null);
    setForm(emptyTeamForm);
    setLogoFile(null);
  };

  const handleUpdateTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await updateTeam(editingTeam.id, {
        name: form.name,
        short_name: form.short_name?.trim() || undefined,
        logo: logoFile,
        logo_url: form.logo_path?.trim() || undefined,
        city: form.city?.trim() || undefined,
      });
      setSuccess("Équipe modifiée.");
      closeEditTeam();
      await loadTeams();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Vous ne pouvez modifier que vos propres équipes.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de modifier l'équipe.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeletingId(teamToDelete.id);
    setSuccess("");
    setError("");

    try {
      await deleteTeam(teamToDelete.id);
      setSuccess("Équipe supprimée.");
      setTeamToDelete(null);
      await loadTeams();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer vos propres équipes.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer l'équipe.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Équipes" description="Clubs de la saison active" />
      <PageStack>
        <SectionBar
          action={
            isAuthenticated ? (
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
                placeholder="Rechercher une équipe…"
              />
              <SearchableFilter
                filterId="teams-tournament"
                label="Tournoi"
                value={tournamentId}
                options={tournamentOptions}
                onChange={setTournamentId}
                allLabel="Tous tournois"
                searchPlaceholder="Rechercher…"
              />
              {isAuthenticated && (
                <FilterTabs
                  tabs={[
                    { id: "all", label: "Tous les clubs" },
                    { id: "my", label: "Mes clubs" },
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

        {!authLoading && !isAuthenticated && (
          <p className={clsx("text-sm", t.textSecondary)}>
            <Link to="/login" className="font-medium text-brand-500 hover:text-brand-400">
              Connectez-vous
            </Link>{" "}
            pour créer ou gérer vos équipes.
          </p>
        )}

        {loading && (
          <div className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", GRID_GAP)}>
            {Array.from({ length: 8 }).map((_, index) => (
              <TeamCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && teams.length > 0 ? (
          <>
            <div className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", GRID_GAP)}>
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  players={players}
                  canEdit={canEditTeam(user, team)}
                  canDelete={canDeleteTeam(user, team)}
                  deleting={deletingId === team.id}
                  onDelete={setTeamToDelete}
                  onEdit={openEditTeam}
                />
              ))}
            </div>
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={totalTeams}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        ) : (
          !loading && (
            <p className={clsx("py-12 text-center text-sm", t.textMuted)}>Aucune équipe trouvée.</p>
          )
        )}

        <FormDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Créer une équipe"
          description="Ajoutez une équipe à votre compte."
          className="max-w-lg w-full"
        >
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
                placeholder="ex : Derb Sultan FC"
                className={formInputClass(t)}
              />
            </div>
            <div>
              <label htmlFor="team-short-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom court</label>
              <input
                id="team-short-name"
                name="short_name"
                value={form.short_name}
                onChange={(e) => setForm((current) => ({ ...current, short_name: e.target.value.toUpperCase().slice(0, 3) }))}
                maxLength={3}
                placeholder="ex : DSF"
                disabled={submitting}
                className={clsx(formInputClass(t), "uppercase")}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="team-city" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
              <input
                id="team-city"
                name="city"
                value={form.city}
                onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                placeholder="ex : Casablanca"
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div className="md:col-span-2">
              <ImageSourceInput
                label="Logo"
                name="logo"
                mode={logoMode}
                onModeChange={setLogoMode}
                file={logoFile}
                onFileChange={setLogoFile}
                url={form.logo_path ?? ""}
                onUrlChange={(value) => setForm((current) => ({ ...current, logo_path: value }))}
                previewName={form.name || "Équipe"}
                disabled={submitting}
              />
            </div>
            <div className="md:col-span-2">
              {error && (
                <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? "Création..." : "Créer l'équipe"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <FormDrawer
          open={Boolean(editingTeam)}
          onClose={closeEditTeam}
          title="Modifier l'équipe"
          description={editingTeam ? editingTeam.name : undefined}
          className="max-w-lg w-full"
        >
          <form onSubmit={handleUpdateTeam} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="edit-team-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
              <input
                id="edit-team-name"
                name="name"
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                required
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div>
              <label htmlFor="edit-team-short-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom court</label>
              <input
                id="edit-team-short-name"
                name="short_name"
                value={form.short_name}
                onChange={(e) => setForm((current) => ({ ...current, short_name: e.target.value.toUpperCase().slice(0, 3) }))}
                maxLength={3}
                disabled={submitting}
                className={clsx(formInputClass(t), "uppercase")}
              />
            </div>
            <div>
              <label htmlFor="edit-team-city" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
              <input
                id="edit-team-city"
                name="city"
                value={form.city}
                onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                disabled={submitting}
                className={formInputClass(t)}
              />
            </div>
            <div className="md:col-span-2">
              <ImageSourceInput
                label="Logo"
                name="edit-logo"
                mode={logoMode}
                onModeChange={setLogoMode}
                file={logoFile}
                onFileChange={setLogoFile}
                url={form.logo_path ?? ""}
                onUrlChange={(value) => setForm((current) => ({ ...current, logo_path: value }))}
                previewName={form.name || "Équipe"}
                disabled={submitting}
              />
            </div>
            <div className="md:col-span-2">
              {error && (
                <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <ConfirmModal
          open={Boolean(teamToDelete)}
          onClose={() => setTeamToDelete(null)}
          title="Supprimer l'équipe"
          message={
            teamToDelete
              ? `Voulez-vous vraiment supprimer l'équipe « ${teamToDelete.name} » ? Cette action est irréversible.`
              : ""
          }
          confirmLabel="Supprimer"
          loading={deletingId !== null}
          onConfirm={() => void handleDeleteTeam()}
        />
      </PageStack>
    </>
  );
}
