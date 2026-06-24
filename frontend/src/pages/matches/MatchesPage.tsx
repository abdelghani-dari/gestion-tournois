import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  confirmMatchResult,
  createMatch,
  disputeMatchResult,
  enterMatchResult,
  getMatches,
  getMyTournaments,
  getTeams,
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
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon } from "../../icons";

type MatchForm = {
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
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

function teamName(teamId: number, teams: ApiTeam[], embedded?: ApiTeam | null) {
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Équipe #${teamId}`;
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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [matchForm, setMatchForm] = useState<MatchForm>(emptyMatchForm);
  const [resultForm, setResultForm] = useState<ResultForm>(emptyResultForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingMatch, setSubmittingMatch] = useState(false);
  const [submittingResult, setSubmittingResult] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setMyTournaments(tournamentData);
        setMatchForm((current) => ({
          ...current,
          tournament_id: current.tournament_id || (tournamentData[0]?.id ? String(tournamentData[0].id) : ""),
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
    } catch (err) {
      setError(readableActionError(err, "Impossible de créer le match."));
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

  return (
    <>
      <XPageMeta title="Matchs" description="Liste des matchs" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Compte connecté" desc={user ? `${user.email} - ${user.role}` : "Connexion requise"}>
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Matchs</p>
              <p className={clsx("mt-1 text-3xl font-bold", t.textPrimary)}>{matches.length}</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Planifier un match" desc="Tournois que vous avez créés" className="xl:col-span-2">
            {!isAuthenticated && !authLoading ? (
              <p className={clsx("text-sm", t.textSecondary)}>Connectez-vous pour créer et gérer des matchs.</p>
            ) : myTournaments.length === 0 && !loading ? (
              <p className={clsx("text-sm", t.textSecondary)}>Créez d'abord un tournoi accepté.</p>
            ) : teams.length < 2 && !loading ? (
              <p className={clsx("text-sm", t.textSecondary)}>Sélectionnez au moins deux équipes.</p>
            ) : (
              <form onSubmit={handleCreateMatch} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="match-tournament" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Tournoi *</label>
                  <select
                    id="match-tournament"
                    name="tournament_id"
                    value={matchForm.tournament_id}
                    onChange={(e) => updateMatchForm("tournament_id", e.target.value)}
                    required
                    disabled={submittingMatch || loading}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  >
                    <option value="">Sélectionner un tournoi</option>
                    {myTournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                    ))}
                  </select>
                </div>
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
                <div>
                  <label htmlFor="match-home-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe domicile *</label>
                  <select
                    id="match-home-team"
                    name="home_team_id"
                    value={matchForm.home_team_id}
                    onChange={(e) => updateMatchForm("home_team_id", e.target.value)}
                    required
                    disabled={submittingMatch || loading}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  >
                    <option value="">Sélectionner une équipe</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="match-away-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe extérieure *</label>
                  <select
                    id="match-away-team"
                    name="away_team_id"
                    value={matchForm.away_team_id}
                    onChange={(e) => updateMatchForm("away_team_id", e.target.value)}
                    required
                    disabled={submittingMatch || loading}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  >
                    <option value="">Sélectionner une équipe</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={submittingMatch || loading || teams.length < 2} className="gap-2">
                    <PlusIcon className="size-4 shrink-0" />
                    {submittingMatch ? "Création..." : "Créer le match"}
                  </Button>
                </div>
              </form>
            )}
          </ComponentCard>
        </div>

        <ComponentCard title="Résultat" desc="Saisie et validation">
          <form onSubmit={handleEnterResult} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label htmlFor="result-match" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match *</label>
              <select
                id="result-match"
                name="match_id"
                value={resultForm.match_id}
                onChange={(e) => updateResultForm("match_id", e.target.value)}
                required
                disabled={!isAuthenticated || submittingResult || loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">Sélectionner un match</option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    #{match.id} - {teamName(match.home_team_id, teams, match.home_team)} vs {teamName(match.away_team_id, teams, match.away_team)}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="md:col-span-4">
              {(success || error) && (
                <div
                  className={clsx(
                    "mb-3 rounded-sm border px-4 py-3 text-sm",
                    error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                  )}
                >
                  {error || success}
                </div>
              )}
              <Button type="submit" disabled={!isAuthenticated || submittingResult || loading}>
                {submittingResult ? "Enregistrement..." : "Enregistrer le résultat"}
              </Button>
            </div>
          </form>
        </ComponentCard>

        <ComponentCard title="Liste des matchs" desc="Matchs enregistrés">
          <div className="mb-4 flex flex-wrap gap-3">
            <FilterSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un match..."
            />
            <select
              id="matches-tournament-filter"
              name="tournament_filter"
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className={clsx("rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
            >
              <option value="">Tous les tournois</option>
              {myTournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
              ))}
            </select>
          </div>

          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des matchs...</p>
          )}

          {!loading && !error && matches.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          )}

          {!loading && matches.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[1120px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[64px]" />
                  <col className="w-[17%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[15%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tournoi</th>
                    <th className="px-4 py-3">Domicile</th>
                    <th className="px-4 py-3">Extérieur</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Résultat</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{match.id}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={tournamentName(match, myTournaments)}>{tournamentName(match, myTournaments)}</span>
                      </td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                        <span className="block truncate" title={teamName(match.home_team_id, teams, match.home_team)}>
                          {teamName(match.home_team_id, teams, match.home_team)}
                        </span>
                      </td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                        <span className="block truncate" title={teamName(match.away_team_id, teams, match.away_team)}>
                          {teamName(match.away_team_id, teams, match.away_team)}
                        </span>
                      </td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDateTime(match.match_date)}</td>
                      <td className={clsx("px-4 py-3 font-mono tabular-nums", t.textSecondary)}>
                        {match.home_score ?? "-"} - {match.away_score ?? "-"}
                      </td>
                      <td className="px-4 py-3"><StatusPill value={match.status} /></td>
                      <td className="px-4 py-3"><StatusPill value={match.result_status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
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
                          {(match.status !== "played" || match.home_score == null || match.away_score == null || match.result_status === "confirmed") && (
                            <span className={t.textMuted}>-</span>
                          )}
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
