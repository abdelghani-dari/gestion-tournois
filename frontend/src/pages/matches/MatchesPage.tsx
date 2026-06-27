import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  confirmMatchResult,
  createMatch,
  deleteMatch,
  disputeMatchResult,
  enterMatchResult,
  getMatches,
  getMyTournaments,
  getTeams,
  updateMatch,
  type ApiMatch,
  type ApiTeam,
  type MatchPayload,
  type MatchResultPayload,
  type MyTournament,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import FilterTabs from "../../components/common/FilterTabs";
import FormDrawer from "../../components/common/FormDrawer";
import { modalFormFooterClass } from "../../components/common/formStyles";
import FormSearchableSelect from "../../components/common/FormSearchableSelect";
import SearchableSelect from "../../components/common/SearchableSelect";
import SectionBar from "../../components/common/SectionBar";
import { DropdownGroupProvider } from "../../components/common/SearchableFilter";
import MatchRowList from "../../components/matches/MatchRowList";
import MatchSelectRow from "../../components/matches/MatchSelectRow";
import {
  buildMatchSelectOptions,
  findMatchById,
  resolveMatchTeams,
} from "../../components/matches/matchSelectOptions";
import { teamSelectOptions, tournamentSelectOptions } from "../../components/common/selectOptionBuilders";
import MatchRowSkeleton from "../../components/common/skeletons/MatchRowSkeleton";
import ConfirmModal from "../../components/common/ConfirmModal";
import PaginationControls, { usePagination } from "../../components/common/PaginationControls";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { canManageTournamentMatches } from "../../utils/permissions";

type MatchForm = {
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  home_score: string;
  away_score: string;
};

type ResultForm = {
  match_id: string;
  home_score: string;
  away_score: string;
};

const emptyMatchForm: MatchForm = {
  tournament_id: "",
  home_team_id: "",
  away_team_id: "",
  match_date: "",
  home_score: "",
  away_score: "",
};

const emptyResultForm: ResultForm = {
  match_id: "",
  home_score: "",
  away_score: "",
};

function formatDateTime(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toApiDateTime(value: string) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

function StatusPill({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  return (
    <span className={clsx("inline-flex rounded-sm px-2 py-0.5 text-xs font-medium", statusTone(value) || clsx(t.metricBg, t.textSecondary))}>
      {statusLabel(value)}
    </span>
  );
}

function tournamentName(match: ApiMatch, tournaments: MyTournament[]) {
  return match.tournament?.name ?? tournaments.find((t) => t.id === match.tournament_id)?.name ?? `Tournoi #${match.tournament_id}`;
}

function teamName(teamId: number | null | undefined, teams: ApiTeam[], embedded?: ApiTeam | null) {
  if (embedded?.name) return embedded.name;
  if (teamId == null) return "En attente";
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Équipe #${teamId}`;
}

function matchNeedsResult(match: ApiMatch) {
  if (match.home_score != null && match.away_score != null) return false;
  if ((match.result_status ?? "").toLowerCase() === "confirmed") return false;
  return true;
}

function readableActionError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 403) {
    return "Vous pouvez seulement créer des matchs pour vos tournois.";
  }
  if (err instanceof ApiError && err.status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }
  return err instanceof Error ? err.message : fallback;
}

export default function MatchesPage() {
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading, user, isAdmin } = useAuth();
  const isCreator = user?.role === 'creator';
  const canSchedule = isAdmin || isCreator;
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [matchForm, setMatchForm] = useState<MatchForm>(emptyMatchForm);
  const [resultForm, setResultForm] = useState<ResultForm>(emptyResultForm);
  const [createMatchOpen, setCreateMatchOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<ApiMatch | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submittingMatch, setSubmittingMatch] = useState(false);
  const [submittingResult, setSubmittingResult] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<ApiMatch | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManageMatch = (match: ApiMatch) => {
    if (isAdmin) return true;
    const tournament =
      match.tournament ??
      myTournaments.find((item) => item.id === match.tournament_id) ??
      null;
    return canManageTournamentMatches(user, tournament);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [matchData, teamData] = await Promise.all([
        getMatches(tournamentFilter ? { tournament_id: tournamentFilter } : undefined),
        getTeams(),
      ]);
      setMatches(matchData);
      setTeams(teamData);

      if (isAuthenticated) {
        const tournamentData = await getMyTournaments();
        // Only show approved/accepted tournaments in the scheduling dropdown
        const approvedTournaments = tournamentData.filter(
          (t) => (t as {approval_status?: string}).approval_status === 'accepted' || !('approval_status' in t)
        );
        setMyTournaments(approvedTournaments);
        setMatchForm((current) => ({
          ...current,
          tournament_id: current.tournament_id || (approvedTournaments[0]?.id ? String(approvedTournaments[0].id) : ""),
          home_team_id: current.home_team_id || (teamData[0]?.id ? String(teamData[0].id) : ""),
          away_team_id: current.away_team_id || (teamData[1]?.id ? String(teamData[1].id) : ""),
        }));
      } else {
        setMyTournaments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les matchs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      void loadData();
    }
  }, [authLoading, isAuthenticated, tournamentFilter]);

  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((match) =>
      [
        match.id,
        tournamentName(match, myTournaments),
        teamName(match.home_team_id, teams, match.home_team),
        teamName(match.away_team_id, teams, match.away_team),
        match.match_date ?? "",
        match.status ?? "",
        match.result_status ?? "",
        match.home_score ?? "",
        match.away_score ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [matches, teams, myTournaments, searchQuery]);

  const statusCounts = useMemo(
    () => ({
      all: filteredMatches.length,
      scheduled: filteredMatches.filter((match) => match.status === "scheduled").length,
      completed: filteredMatches.filter((match) => match.status === "played" || match.status === "completed").length,
      live: filteredMatches.filter((match) => match.status === "live").length,
    }),
    [filteredMatches],
  );

  const displayedMatches = useMemo(() => {
    if (statusFilter === "scheduled") {
      return filteredMatches.filter((match) => match.status === "scheduled");
    }
    if (statusFilter === "completed") {
      return filteredMatches.filter((match) => match.status === "played" || match.status === "completed");
    }
    if (statusFilter === "live") {
      return filteredMatches.filter((match) => match.status === "live");
    }
    return filteredMatches;
  }, [filteredMatches, statusFilter]);

  const resultEligibleMatches = useMemo(
    () => matches.filter((match) => matchNeedsResult(match) && canManageMatch(match)),
    [matches, myTournaments, user, isAdmin],
  );
  const matchSelectOptions = useMemo(() => buildMatchSelectOptions(resultEligibleMatches, teams), [resultEligibleMatches, teams]);
  const selectedResultMatch = useMemo(
    () => findMatchById(matches, resultForm.match_id),
    [matches, resultForm.match_id],
  );
  const selectedResultTeams = useMemo(
    () => resolveMatchTeams(selectedResultMatch, teams),
    [selectedResultMatch, teams],
  );

  const matchesPagination = usePagination(displayedMatches, `${searchQuery}:${tournamentFilter}:${statusFilter}`);

  const updateMatchForm = (key: keyof MatchForm, value: string) => {
    setMatchForm((current) => ({ ...current, [key]: value }));
  };

  const updateResultForm = (key: keyof ResultForm, value: string) => {
    setResultForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreateMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmittingMatch(true);
    setSuccess("");
    setError("");

    const payload: MatchPayload = {
      tournament_id: Number(matchForm.tournament_id),
      home_team_id: Number(matchForm.home_team_id),
      away_team_id: Number(matchForm.away_team_id),
      match_date: toApiDateTime(matchForm.match_date),
    };

    try {
      await createMatch(payload);
      setSuccess("Match created.");
      setMatchForm((current) => ({ ...emptyMatchForm, tournament_id: current.tournament_id }));
      await loadData();
      setCreateMatchOpen(false);
    } catch (err) {
      setError(readableActionError(err, "Impossible de créer le match."));
    } finally {
      setSubmittingMatch(false);
    }
  };

  const openEditMatch = (match: ApiMatch) => {
    setEditingMatch(match);
    setMatchForm({
      tournament_id: String(match.tournament_id),
      home_team_id: String(match.home_team_id ?? ""),
      away_team_id: String(match.away_team_id ?? ""),
      match_date: toDateTimeLocal(match.match_date),
      home_score: match.home_score != null ? String(match.home_score) : "",
      away_score: match.away_score != null ? String(match.away_score) : "",
    });
    setError("");
    setSuccess("");
  };

  const closeEditMatch = () => {
    setEditingMatch(null);
    setMatchForm(emptyMatchForm);
  };

  const handleUpdateMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMatch || !isAuthenticated) return;

    setSubmittingMatch(true);
    setSuccess("");
    setError("");

    try {
      await updateMatch(editingMatch.id, {
        tournament_id: editingMatch.tournament_id,
        home_team_id: Number(matchForm.home_team_id),
        away_team_id: Number(matchForm.away_team_id),
        match_date: toApiDateTime(matchForm.match_date),
      });

      const hasHomeScore = matchForm.home_score.trim() !== "";
      const hasAwayScore = matchForm.away_score.trim() !== "";
      if (hasHomeScore || hasAwayScore) {
        if (!hasHomeScore || !hasAwayScore) {
          setError("Renseignez les deux scores ou laissez-les vides.");
          return;
        }
        await enterMatchResult(editingMatch.id, {
          home_score: Number(matchForm.home_score),
          away_score: Number(matchForm.away_score),
        });
      }

      setSuccess("Match modifié.");
      closeEditMatch();
      await loadData();
    } catch (err) {
      setError(readableActionError(err, "Impossible de modifier le match."));
    } finally {
      setSubmittingMatch(false);
    }
  };

  const handleEnterResult = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmittingResult(true);
    setSuccess("");
    setError("");

    const payload: MatchResultPayload = {
      home_score: Number(resultForm.home_score),
      away_score: Number(resultForm.away_score),
    };

    try {
      await enterMatchResult(Number(resultForm.match_id), payload);
      setSuccess("Résultat enregistré.");
      setResultForm(emptyResultForm);
      await loadData();
      setResultOpen(false);
    } catch (err) {
      setError(readableActionError(err, "Impossible d'enregistrer le résultat."));
    } finally {
      setSubmittingResult(false);
    }
  };

  const handleConfirm = async (id: number) => {
    setWorkingId(id);
    setSuccess("");
    setError("");

    try {
      await confirmMatchResult(id);
      setSuccess("Résultat confirmé.");
      await loadData();
    } catch (err) {
      setError(readableActionError(err, "Impossible de confirmer le résultat."));
    } finally {
      setWorkingId(null);
    }
  };

  const handleDispute = async (id: number) => {
    setWorkingId(id);
    setSuccess("");
    setError("");

    try {
      await disputeMatchResult(id);
      setSuccess("Résultat contesté.");
      await loadData();
    } catch (err) {
      setError(readableActionError(err, "Impossible de contester le résultat."));
    } finally {
      setWorkingId(null);
    }
  };

  const handleConfirmDeleteMatch = async () => {
    if (!matchToDelete) return;

    setDeletingId(matchToDelete.id);
    setSuccess("");
    setError("");

    try {
      await deleteMatch(matchToDelete.id);
      setSuccess("Match supprime.");
      setMatchToDelete(null);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer les matchs de vos tournois.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expire. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer le match.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Matchs" description="Liste des matchs" />
      <PageStack>
        {canSchedule && (
        <div className={clsx("grid grid-cols-1 lg:grid-cols-2", GRID_GAP)}>
          <ComponentCard title="Planifier un match" desc="Tournois que vous avez créés">
            <div className={clsx("flex flex-col gap-4 rounded-md border p-5 sm:flex-row sm:items-center sm:justify-between", t.card)}>
              <div>
                <p className={clsx("font-semibold", t.textPrimary)}>Créer un match</p>
                <p className={clsx("mt-1 text-sm", t.textSecondary)}>Planifiez une rencontre sans allonger la page.</p>
              </div>
              <Button
                type="button"
                disabled={!isAuthenticated || loading || myTournaments.length === 0 || teams.length < 2}
                onClick={() => setCreateMatchOpen(true)}
              >
                Créer un match
              </Button>
            </div>
            {isAuthenticated && myTournaments.length === 0 && !loading && <p className={clsx("mt-4 text-sm", t.textSecondary)}>Créez d'abord un tournoi accepté.</p>}
            {isAuthenticated && teams.length < 2 && !loading && <p className={clsx("mt-4 text-sm", t.textSecondary)}>Sélectionnez au moins deux équipes.</p>}
          </ComponentCard>

          <ComponentCard title="Résultat" desc="Saisie et validation">
            <div className={clsx("flex flex-col gap-4 rounded-md border p-5 sm:flex-row sm:items-center sm:justify-between", t.card)}>
              <div className="min-w-0 flex-1">
                <p className={clsx("font-semibold", t.textPrimary)}>Saisir un résultat</p>
                <p className={clsx("mt-1 text-sm", t.textSecondary)}>Modifier le score d'un match.</p>
              </div>
              <Button type="button" disabled={!isAuthenticated || loading || matches.length === 0} onClick={() => setResultOpen(true)} className="shrink-0 whitespace-nowrap">
                Saisir le score
              </Button>
            </div>
          </ComponentCard>
        </div>
        )}

        <ComponentCard title="Liste des matchs" desc="Matchs enregistrés" className="relative z-10">
          <div className="relative z-30 mb-4 flex flex-wrap gap-3 overflow-visible">
            <FilterSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un match..."
            />
            <DropdownGroupProvider>
              <SearchableSelect
                selectId="matches-tournament-filter"
                variant="filter"
                panelLabel="Tournoi"
                value={tournamentFilter}
                onChange={setTournamentFilter}
                emptyOptionLabel="Tous les tournois"
                options={tournamentSelectOptions(myTournaments, user?.id)}
              />
            </DropdownGroupProvider>
          </div>

          <div className="relative z-20 mb-4 overflow-visible">
            <SectionBar>
              <FilterTabs
                tabs={[
                  { id: "all", label: "Tous", count: statusCounts.all },
                  { id: "scheduled", label: "Programmés", count: statusCounts.scheduled },
                  { id: "completed", label: "Terminés", count: statusCounts.completed },
                  { id: "live", label: "En direct", count: statusCounts.live },
                ]}
                active={statusFilter}
                onChange={setStatusFilter}
              />
            </SectionBar>
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

          {loading && <MatchRowSkeleton rows={8} />}

          {!loading && !error && matches.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          )}

          {!loading && displayedMatches.length > 0 && (
            <>
              <MatchRowList
                matches={matchesPagination.paginatedItems}
                teams={teams}
                renderActions={
                  isAuthenticated
                    ? (match) =>
                        canManageMatch(match) ? (
                        <>
                          {match.status === "played" && match.home_score != null && match.away_score != null && match.result_status === "pending" && (
                            <>
                              <Button size="sm" variant="secondary" disabled={workingId === match.id} onClick={() => handleConfirm(match.id)}>
                                Confirmer
                              </Button>
                              <Button size="sm" variant="danger" disabled={workingId === match.id} onClick={() => handleDispute(match.id)}>
                                Contester
                              </Button>
                            </>
                          )}
                          {match.status === "played" && match.home_score != null && match.away_score != null && match.result_status === "disputed" && (
                            <Button size="sm" variant="secondary" disabled={workingId === match.id} onClick={() => handleConfirm(match.id)}>
                              Confirmer
                            </Button>
                          )}
                          <Button size="sm" variant="secondary" disabled={workingId === match.id} onClick={() => openEditMatch(match)}>
                            Modifier
                          </Button>
                          <Button size="sm" variant="danger" disabled={deletingId === match.id} onClick={() => setMatchToDelete(match)}>
                            {deletingId === match.id ? "Suppression..." : "Supprimer"}
                          </Button>
                        </>
                        ) : undefined
                    : undefined
                }
              />
              <PaginationControls
                page={matchesPagination.page}
                pageSize={matchesPagination.pageSize}
                totalItems={displayedMatches.length}
                onPageChange={matchesPagination.setPage}
                onPageSizeChange={matchesPagination.setPageSize}
              />
            </>
          )}

          {!loading && displayedMatches.length === 0 && matches.length > 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucun match dans cette catégorie.</p>
          )}
        </ComponentCard>

        <FormDrawer
          open={createMatchOpen}
          onClose={() => setCreateMatchOpen(false)}
          title="Créer un match"
          description="Planifiez une rencontre pour l'un de vos tournois."
        >
          <form onSubmit={handleCreateMatch} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSearchableSelect
              id="match-tournament"
              label="Tournoi *"
              value={matchForm.tournament_id}
              onChange={(value) => updateMatchForm("tournament_id", value)}
              emptyOptionLabel="Sélectionner un tournoi"
              disabled={submittingMatch || loading}
              options={tournamentSelectOptions(myTournaments, user?.id)}
            />
            <div>
              <label htmlFor="match-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date *</label>
              <input
                id="match-date"
                name="match_date"
                type="datetime-local"
                value={matchForm.match_date}
                onChange={(e) => updateMatchForm("match_date", e.target.value)}
                required
                disabled={submittingMatch || loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <FormSearchableSelect
              id="match-home-team"
              label="Équipe domicile *"
              value={matchForm.home_team_id}
              onChange={(value) => updateMatchForm("home_team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submittingMatch || loading}
              options={teamSelectOptions(teams, user?.id)}
            />
            <FormSearchableSelect
              id="match-away-team"
              label="Équipe extérieure *"
              value={matchForm.away_team_id}
              onChange={(value) => updateMatchForm("away_team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submittingMatch || loading}
              options={teamSelectOptions(teams, user?.id)}
            />
            <div className="md:col-span-2">
              {error && (
                <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submittingMatch || loading || teams.length < 2} className="w-full sm:w-auto">
                  {submittingMatch ? "Création..." : "Créer le match"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <FormDrawer
          open={Boolean(editingMatch)}
          onClose={closeEditMatch}
          title="Modifier le match"
          description={editingMatch ? `${teamName(editingMatch.home_team_id, teams, editingMatch.home_team)} vs ${teamName(editingMatch.away_team_id, teams, editingMatch.away_team)}` : undefined}
        >
          <form onSubmit={handleUpdateMatch} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSearchableSelect
              id="edit-match-home-team"
              label="Équipe domicile *"
              value={matchForm.home_team_id}
              onChange={(value) => updateMatchForm("home_team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submittingMatch || loading}
              options={teamSelectOptions(teams, user?.id)}
            />
            <FormSearchableSelect
              id="edit-match-away-team"
              label="Équipe extérieure *"
              value={matchForm.away_team_id}
              onChange={(value) => updateMatchForm("away_team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submittingMatch || loading}
              options={teamSelectOptions(teams, user?.id)}
            />
            <div className="md:col-span-2">
              <label htmlFor="edit-match-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date *</label>
              <input
                id="edit-match-date"
                type="datetime-local"
                value={matchForm.match_date}
                onChange={(e) => updateMatchForm("match_date", e.target.value)}
                required
                disabled={submittingMatch || loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div>
              <label htmlFor="edit-home-score" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Score domicile</label>
              <input
                id="edit-home-score"
                type="number"
                min={0}
                value={matchForm.home_score}
                onChange={(e) => updateMatchForm("home_score", e.target.value)}
                disabled={submittingMatch || loading}
                placeholder="—"
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div>
              <label htmlFor="edit-away-score" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Score extérieur</label>
              <input
                id="edit-away-score"
                type="number"
                min={0}
                value={matchForm.away_score}
                onChange={(e) => updateMatchForm("away_score", e.target.value)}
                disabled={submittingMatch || loading}
                placeholder="—"
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div className="md:col-span-2">
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submittingMatch || loading} className="w-full sm:w-auto">
                  {submittingMatch ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <FormDrawer
          open={resultOpen}
          onClose={() => setResultOpen(false)}
          title="Saisir un résultat"
          description="Enregistrez le score d'un match."
          className="max-w-4xl"
        >
          <form onSubmit={handleEnterResult} className="space-y-4">
            <FormSearchableSelect
              id="result-match"
              label="Match *"
              value={resultForm.match_id}
              onChange={(value) => updateResultForm("match_id", value)}
              emptyOptionLabel="Sélectionner un match"
              disabled={!isAuthenticated || submittingResult || loading}
              options={matchSelectOptions}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="result-home-score" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Score domicile *</label>
                <input
                  id="result-home-score"
                  name="home_score"
                  type="number"
                  min={0}
                  value={resultForm.home_score}
                  onChange={(e) => updateResultForm("home_score", e.target.value)}
                  required
                  disabled={!isAuthenticated || submittingResult || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div>
                <label htmlFor="result-away-score" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Score exterieur *</label>
                <input
                  id="result-away-score"
                  name="away_score"
                  type="number"
                  min={0}
                  value={resultForm.away_score}
                  onChange={(e) => updateResultForm("away_score", e.target.value)}
                  required
                  disabled={!isAuthenticated || submittingResult || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
            </div>

            {selectedResultMatch && (
              <div className={clsx("rounded-md border px-4 py-3", t.border, t.metricBg)}>
                <p className={clsx("mb-2 text-xs font-medium uppercase tracking-wide", t.textMuted)}>Match sélectionné</p>
                <MatchSelectRow
                  home={selectedResultTeams.home}
                  away={selectedResultTeams.away}
                  matchId={selectedResultMatch.id}
                />
              </div>
            )}

            {error && (
              <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className={modalFormFooterClass()}>
              <Button type="submit" disabled={!isAuthenticated || submittingResult || loading} className="w-full sm:w-auto">
                {submittingResult ? "Enregistrement..." : "Enregistrer le résultat"}
              </Button>
            </div>
          </form>
        </FormDrawer>

        <ConfirmModal
          open={Boolean(matchToDelete)}
          onClose={() => setMatchToDelete(null)}
          title="Supprimer le match"
          message={
            matchToDelete
              ? `Voulez-vous vraiment supprimer le match « ${teamName(matchToDelete.home_team_id, teams, matchToDelete.home_team)} vs ${teamName(matchToDelete.away_team_id, teams, matchToDelete.away_team)} » ? Cette action est irréversible.`
              : ""
          }
          confirmLabel="Supprimer"
          loading={deletingId !== null}
          onConfirm={() => void handleConfirmDeleteMatch()}
        />
      </PageStack>
    </>
  );
}
