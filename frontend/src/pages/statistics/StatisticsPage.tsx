import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router";
import {
  ApiError,
  createStatistic,
  deleteStatistic,
  updateStatistic,
  getMatches,
  getPlayers,
  getMyTournaments,
  getStatistics,
  getTeams,
  getTournaments,
  type ApiMatch,
  type ApiPlayer,
  type ApiStatistic,
  type ApiTeam,
  type PublicTournament,
  type StatisticPayload,
  type StatisticType,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import ConfirmModal from "../../components/common/ConfirmModal";
import FormDrawer from "../../components/common/FormDrawer";
import FormSearchableSelect from "../../components/common/FormSearchableSelect";
import { modalFormFooterClass } from "../../components/common/formStyles";
import { buildMatchSelectOptions } from "../../components/matches/matchSelectOptions";
import { DropdownGroupProvider } from "../../components/common/SearchableFilter";
import PaginationControls, { usePagination } from "../../components/common/PaginationControls";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import TableRowsSkeleton from "../../components/common/skeletons/TableRowsSkeleton";
import {
  MatchLogosCell,
  PlayerPhotoNameCell,
  StatTypeBadge,
  TeamLogoNameCell,
} from "../../components/statistics/StatisticTableCells";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { BoltIcon, PieChartIcon } from "../../icons";
import SortableTh from "../../components/common/SortableTh";
import {
  playerSelectOptions,
  statTypeSelectOptions,
  teamSelectOptions,
} from "../../components/statistics/statisticSelectOptions";
import { tournamentSelectOptions } from "../../components/common/selectOptionBuilders";

const statTypes: Array<{ value: StatisticType; label: string }> = [
  { value: "goal", label: "But" },
  { value: "assist", label: "Passe décisive" },
  { value: "yellow_card", label: "Carton jaune" },
  { value: "red_card", label: "Carton rouge" },
  { value: "clean_sheet", label: "Match sans but encaissé" },
];

type StatisticForm = {
  tournament_id: string;
  match_game_id: string;
  team_id: string;
  player_id: string;
  stat_type: StatisticType;
  value: string;
};

type StatisticFilters = {
  match_game_id: string;
  team_id: string;
  player_id: string;
  stat_type: string;
};

const emptyForm: StatisticForm = {
  tournament_id: "",
  match_game_id: "",
  team_id: "",
  player_id: "",
  stat_type: "goal",
  value: "1",
};

const emptyFilters: StatisticFilters = {
  match_game_id: "",
  team_id: "",
  player_id: "",
  stat_type: "",
};

function playerName(player?: ApiPlayer | null) {
  if (!player) return "";
  return `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim() || `Player #${player.id}`;
}

function teamName(teamId: number | null | undefined, teams: ApiTeam[], embedded?: ApiTeam | null) {
  if (embedded?.name) return embedded.name;
  if (teamId == null) return "En attente";
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Équipe #${teamId}`;
}

function playerLabel(playerId: number, players: ApiPlayer[], embedded?: ApiPlayer | null) {
  return playerName(embedded) || playerName(players.find((player) => player.id === playerId)) || `Joueur #${playerId}`;
}

function statLabel(value: string) {
  return statTypes.find((type) => type.value === value)?.label ?? value;
}

function statBadgeColor(value: string): "success" | "warning" | "error" | "info" {
  if (value === "goal" || value === "clean_sheet") return "success";
  if (value === "yellow_card") return "warning";
  if (value === "red_card") return "error";
  return "info";
}

function resolveMatch(statistic: ApiStatistic, matches: ApiMatch[]) {
  return statistic.matchGame ?? statistic.match_game ?? matches.find((match) => match.id === statistic.match_game_id);
}

function resolveTeam(statistic: ApiStatistic, teams: ApiTeam[]) {
  return statistic.team ?? teams.find((team) => team.id === statistic.team_id);
}

function resolvePlayerRecord(statistic: ApiStatistic, players: ApiPlayer[]) {
  return statistic.player ?? players.find((player) => player.id === statistic.player_id);
}

function getRouteFilters(pathname: string, id?: string): Partial<StatisticFilters> {
  if (!id) return {};
  if (pathname.includes("/matches/")) return { match_game_id: id };
  if (pathname.includes("/teams/")) return { team_id: id };
  if (pathname.includes("/players/")) return { player_id: id };
  return {};
}

function getQueryFilters(searchParams: URLSearchParams): StatisticFilters {
  return {
    match_game_id: searchParams.get("match_game_id") ?? "",
    team_id: searchParams.get("team_id") ?? "",
    player_id: searchParams.get("player_id") ?? "",
    stat_type: searchParams.get("stat_type") ?? "",
  };
}

function getInitialFilters(pathname: string, id: string | undefined, searchParams: URLSearchParams): StatisticFilters {
  return {
    ...emptyFilters,
    ...getRouteFilters(pathname, id),
    ...getQueryFilters(searchParams),
  };
}

function readableStatisticError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }
  return err instanceof Error ? err.message : fallback;
}

export default function StatisticsPage() {
  const t = useThemeTokens();
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [statistics, setStatistics] = useState<ApiStatistic[]>([]);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<StatisticFilters>(() =>
    getInitialFilters(location.pathname, id, searchParams),
  );
  const [form, setForm] = useState<StatisticForm>(emptyForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<ApiStatistic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statToDelete, setStatToDelete] = useState<ApiStatistic | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totals = useMemo(() => {
    const byType = (type: string) =>
      statistics.filter((statistic) => statistic.stat_type === type).reduce((sum, statistic) => sum + Number(statistic.value || 0), 0);

    return {
      goals: byType("goal"),
      assists: byType("assist"),
      cards: byType("yellow_card") + byType("red_card"),
    };
  }, [statistics]);

  const matchSelectOptions = useMemo(() => {
    let scoped = form.tournament_id
      ? matches.filter((match) => String(match.tournament_id) === form.tournament_id)
      : matches;
    if (form.team_id) {
      const teamId = Number(form.team_id);
      scoped = scoped.filter((match) => match.home_team_id === teamId || match.away_team_id === teamId);
    }
    return buildMatchSelectOptions(scoped, teams);
  }, [matches, teams, form.tournament_id, form.team_id]);

  const matchSelectExpandedOptions = useMemo(() => {
    const scoped = form.tournament_id
      ? matches.filter((match) => String(match.tournament_id) === form.tournament_id)
      : matches;
    return buildMatchSelectOptions(scoped, teams);
  }, [matches, teams, form.tournament_id]);

  const filteredTeams = useMemo(() => {
    if (!form.tournament_id) return teams;
    const tournamentTeamIds = new Set(
      matches
        .filter((match) => String(match.tournament_id) === form.tournament_id)
        .flatMap((match) => [match.home_team_id, match.away_team_id]),
    );
    return teams.filter((team) => tournamentTeamIds.has(team.id));
  }, [teams, matches, form.tournament_id]);

  const formTeamOptions = useMemo(() => {
    if (form.match_game_id) {
      const match = matches.find((item) => String(item.id) === form.match_game_id);
      if (match) {
        const matchTeams = teams.filter(
          (team) => team.id === match.home_team_id || team.id === match.away_team_id,
        );
        return teamSelectOptions(matchTeams, user?.id);
      }
    }
    return teamSelectOptions(form.tournament_id ? filteredTeams : teams, user?.id);
  }, [form.match_game_id, form.tournament_id, matches, teams, filteredTeams, user?.id]);

  const formTeamExpandedOptions = useMemo(
    () => teamSelectOptions(form.tournament_id ? filteredTeams : teams, user?.id),
    [form.tournament_id, filteredTeams, teams, user?.id],
  );

  const filteredPlayers = useMemo(() => {
    if (!form.team_id) return players;
    return players.filter((player) => String(player.team_id) === form.team_id);
  }, [players, form.team_id]);

  const formPlayerOptions = useMemo(
    () => playerSelectOptions(filteredPlayers, (player) => playerLabel(player.id, players, player), user?.id),
    [filteredPlayers, players],
  );

  const formPlayerExpandedOptions = useMemo(
    () => playerSelectOptions(players, (player) => playerLabel(player.id, players, player), user?.id),
    [players],
  );

  const statisticsPagination = usePagination(statistics, Object.values(filters).join(":"));

  const loadData = async (activeFilters = filters, activeSortBy = sortBy, activeSortDir = sortDir) => {
    setLoading(true);
    setError("");

    try {
      const params = {
        ...Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value !== "")),
        sort_by: activeSortBy,
        sort_dir: activeSortDir,
      } as Record<string, string>;

      const tournamentsPromise = isAuthenticated
        ? getMyTournaments()
        : getTournaments();

      const [statisticsData, matchesData, teamsData, playersData, tournamentsData] = await Promise.all([
        getStatistics(params),
        getMatches(),
        getTeams(),
        getPlayers(),
        tournamentsPromise,
      ]);

      setStatistics(statisticsData);
      setMatches(matchesData);
      setTeams(teamsData);
      setPlayers(playersData);
      setTournaments(tournamentsData);
      setForm((current) => ({
        ...current,
        match_game_id: current.match_game_id || (matchesData[0]?.id ? String(matchesData[0].id) : ""),
        team_id: current.team_id || (teamsData[0]?.id ? String(teamsData[0].id) : ""),
        player_id: current.player_id || (playersData[0]?.id ? String(playersData[0].id) : ""),
      }));
    } catch (err) {
      setError(readableStatisticError(err, "Impossible de charger les statistiques."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialFilters = getInitialFilters(location.pathname, id, searchParams);
    setFilters(initialFilters);
    void loadData(initialFilters);
  }, [id, location.pathname, searchParams.toString()]);

  const updateForm = (key: keyof StatisticForm, value: string) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "tournament_id") {
        next.match_game_id = "";
        next.team_id = "";
        next.player_id = "";
      }
      if (key === "match_game_id") {
        const match = matches.find((item) => String(item.id) === value);
        if (match && next.team_id) {
          const teamId = Number(next.team_id);
          if (match.home_team_id !== teamId && match.away_team_id !== teamId) {
            next.team_id = "";
            next.player_id = "";
          }
        }
      }
      if (key === "team_id") {
        next.match_game_id = "";
        next.player_id = "";
      }
      if (key === "player_id") {
        const player = players.find((item) => String(item.id) === value);
        if (player) {
          next.team_id = String(player.team_id);
          next.match_game_id = "";
        }
      }
      return next;
    });
  };

  const handleSort = (column: string) => {
    const nextDir = sortBy === column ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    setSortBy(column);
    setSortDir(nextDir);
    void loadData(filters, column, nextDir);
  };

  const updateFilter = (key: keyof StatisticFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: StatisticPayload = {
      match_game_id: Number(form.match_game_id),
      team_id: Number(form.team_id),
      player_id: Number(form.player_id),
      stat_type: form.stat_type,
      value: Number(form.value),
    };

    try {
      await createStatistic(payload);
      setSuccess("Statistique créée.");
      setForm((current) => ({
        ...emptyForm,
        match_game_id: current.match_game_id,
        team_id: current.team_id,
        player_id: current.player_id,
      }));
      await loadData();
      setCreateOpen(false);
    } catch (err) {
      setError(readableStatisticError(err, "Impossible de créer la statistique."));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditStat = (statistic: ApiStatistic) => {
    setEditingStat(statistic);
    setForm({
      match_game_id: String(statistic.match_game_id),
      team_id: String(statistic.team_id),
      player_id: String(statistic.player_id),
      stat_type: statistic.stat_type as StatisticType,
      value: String(statistic.value ?? 0),
    });
    setError("");
    setSuccess("");
  };

  const closeEditStat = () => {
    setEditingStat(null);
    setForm(emptyForm);
  };

  const handleUpdateStat = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingStat || !isAuthenticated) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await updateStatistic(editingStat.id, {
        match_game_id: Number(form.match_game_id),
        team_id: Number(form.team_id),
        player_id: Number(form.player_id),
        stat_type: form.stat_type,
        value: Number(form.value),
      });
      setSuccess("Statistique modifiée.");
      closeEditStat();
      await loadData();
    } catch (err) {
      setError(readableStatisticError(err, "Impossible de modifier la statistique."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!statToDelete) return;

    setDeletingId(statToDelete.id);
    setError("");
    setSuccess("");

    try {
      await deleteStatistic(statToDelete.id);
      setSuccess("Statistique supprimee.");
      setStatToDelete(null);
      await loadData();
    } catch (err) {
      setError(readableStatisticError(err, "Impossible de supprimer la statistique."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleApplyFilters = () => {
    setSuccess("");
    void loadData();
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setSuccess("");
    void loadData(emptyFilters);
  };

  return (
    <>
      <XPageMeta title="Statistiques" description="Statistiques des tournois locaux" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 sm:grid-cols-3", GRID_GAP)}>
          {[
            { label: "Buts", value: totals.goals, icon: <PieChartIcon className="size-5 text-emerald-400" /> },
            { label: "Passes décisives", value: totals.assists, icon: <BoltIcon className="size-5 text-sky-400" /> },
            { label: "Cartons", value: totals.cards, icon: <PieChartIcon className="size-5 text-amber-400" /> },
          ].map((stat) => (
            <div key={stat.label} className={clsx("rounded-md border p-5", t.card)}>
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className={clsx("text-sm", t.textSecondary)}>{stat.label}</p>
                  <p className={clsx("text-2xl font-semibold", t.textPrimary)}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ComponentCard title="Ajouter une statistique" desc="Enregistrer buts, passes et cartons">
          <div className={clsx("flex flex-col gap-4 rounded-md border p-5 sm:flex-row sm:items-center sm:justify-between", t.card)}>
            <div>
              <p className={clsx("font-semibold", t.textPrimary)}>Ajouter une statistique</p>
              <p className={clsx("mt-1 text-sm", t.textSecondary)}>Le formulaire est disponible à la demande pour garder la page compacte.</p>
            </div>
            <Button
              type="button"
              disabled={!isAuthenticated || authLoading || loading || matches.length === 0 || teams.length === 0 || players.length === 0}
              onClick={() => setCreateOpen(true)}
            >
              Ajouter une statistique
            </Button>
          </div>
          {!isAuthenticated && !authLoading && (
            <p className={clsx("mt-4 text-sm", t.textSecondary)}>La connexion est requise pour ajouter une statistique. Les statistiques publiques restent visibles.</p>
          )}
        </ComponentCard>

        <ComponentCard title="Filtres" desc="Recherche simple par match, équipe, joueur ou type" className="relative z-30" bodyClassName="overflow-visible">
          <DropdownGroupProvider>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <FormSearchableSelect
                id="statistics-filter-match"
                label="Match"
                value={filters.match_game_id}
                onChange={(value) => updateFilter("match_game_id", value)}
                emptyOptionLabel="Tous les matchs"
                disabled={loading}
                options={matchSelectOptions}
              />

              <FormSearchableSelect
                id="statistics-filter-team"
                label="Équipe"
                value={filters.team_id}
                onChange={(value) => updateFilter("team_id", value)}
                emptyOptionLabel="Toutes les équipes"
                disabled={loading}
                options={teamSelectOptions(teams, user?.id)}
              />

              <FormSearchableSelect
                id="statistics-filter-player"
                label="Joueur"
                value={filters.player_id}
                onChange={(value) => updateFilter("player_id", value)}
                emptyOptionLabel="Tous les joueurs"
                disabled={loading}
                options={players.map((player) => ({
                  value: String(player.id),
                  label: playerLabel(player.id, players, player),
                }))}
              />

              <FormSearchableSelect
                id="statistics-filter-type"
                label="Type"
                value={filters.stat_type}
                onChange={(value) => updateFilter("stat_type", value)}
                emptyOptionLabel="Tous les types"
                disabled={loading}
                searchable={false}
                options={statTypes.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
              />

              <div className="flex items-end gap-2">
                <Button type="button" onClick={handleApplyFilters} disabled={loading}>
                  Appliquer
                </Button>
                <Button type="button" variant="secondary" onClick={handleResetFilters} disabled={loading}>
                  Réinitialiser
                </Button>
              </div>
            </div>
          </DropdownGroupProvider>
        </ComponentCard>

        <ComponentCard title="Liste des statistiques" desc="Données enregistrées" className="relative z-10">
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

          {loading && <TableRowsSkeleton rows={10} />}

          {!loading && !error && statistics.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          )}

          {!loading && statistics.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[920px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[120px]" />
                  <col className="w-[22%]" />
                  <col className="w-[24%]" />
                  <col className="w-[140px]" />
                  <col className="w-[72px]" />
                  <col className="w-[180px]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <SortableTh label="ID" column="id" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Équipe</th>
                    <th className="px-4 py-3">Joueur</th>
                    <SortableTh label="Type" column="stat_type" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" />
                    <SortableTh label="Valeur" column="value" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" />
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statisticsPagination.paginatedItems.map((statistic) => {
                    const embeddedMatch = resolveMatch(statistic, matches);
                    const embeddedTeam = resolveTeam(statistic, teams);
                    const embeddedPlayer = resolvePlayerRecord(statistic, players);
                    const teamLabel = teamName(statistic.team_id, teams, embeddedTeam);
                    const playerText = playerLabel(statistic.player_id, players, embeddedPlayer);

                    return (
                      <tr key={statistic.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                        <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{statistic.id}</td>
                        <td className="px-4 py-3">
                          <MatchLogosCell match={embeddedMatch} teams={teams} className={t.textSecondary} />
                        </td>
                        <td className={clsx("px-4 py-3", t.textPrimary)}>
                          <TeamLogoNameCell name={teamLabel} logoPath={embeddedTeam?.logo_path} />
                        </td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>
                          <PlayerPhotoNameCell name={playerText} photoPath={embeddedPlayer?.photo_path} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatTypeBadge label={statLabel(statistic.stat_type)} color={statBadgeColor(statistic.stat_type)} />
                        </td>
                        <td className={clsx("px-4 py-3 text-center font-semibold tabular-nums", t.textPrimary)}>{statistic.value}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-nowrap items-center gap-2">
                            <Button type="button" size="sm" variant="secondary" className="shrink-0 whitespace-nowrap" onClick={() => openEditStat(statistic)}>
                              Modifier
                            </Button>
                            <Button type="button" size="sm" variant="danger" className="shrink-0 whitespace-nowrap" disabled={deletingId === statistic.id} onClick={() => setStatToDelete(statistic)}>
                              {deletingId === statistic.id ? "Suppression..." : "Supprimer"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <PaginationControls
                page={statisticsPagination.page}
                pageSize={statisticsPagination.pageSize}
                totalItems={statistics.length}
                onPageChange={statisticsPagination.setPage}
                onPageSizeChange={statisticsPagination.setPageSize}
              />
            </div>
          )}
        </ComponentCard>

        <FormDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Ajouter une statistique"
          description="Associez une statistique à un match, une équipe et un joueur."
          className="max-h-[90dvh] max-w-lg"
          bodyClassName="overflow-visible"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <FormSearchableSelect
              id="statistic-tournament"
              label="Tournoi"
              value={form.tournament_id}
              onChange={(value) => updateForm("tournament_id", value)}
              emptyOptionLabel="Tous les tournois"
              disabled={submitting || loading}
              options={tournamentSelectOptions(tournaments, user?.id)}
            />

            <FormSearchableSelect
              id="statistic-match"
              label="Match *"
              value={form.match_game_id}
              onChange={(value) => updateForm("match_game_id", value)}
              emptyOptionLabel="Sélectionner un match"
              disabled={submitting || loading}
              options={matchSelectOptions}
              expandedOptions={matchSelectExpandedOptions}
            />

            <FormSearchableSelect
              id="statistic-team"
              label="Équipe *"
              value={form.team_id}
              onChange={(value) => updateForm("team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submitting || loading}
              options={formTeamOptions}
              expandedOptions={formTeamExpandedOptions}
            />

            <FormSearchableSelect
              id="statistic-player"
              label="Joueur *"
              value={form.player_id}
              onChange={(value) => updateForm("player_id", value)}
              emptyOptionLabel="Sélectionner un joueur"
              disabled={submitting || loading}
              options={formPlayerOptions}
              expandedOptions={formPlayerExpandedOptions}
            />

            <FormSearchableSelect
              id="statistic-type"
              label="Type *"
              value={form.stat_type}
              onChange={(value) => updateForm("stat_type", value as StatisticType)}
              disabled={submitting || loading}
              searchable={false}
              options={statTypeSelectOptions()}
            />

            <div>
              <label htmlFor="statistic-value" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Valeur *</label>
              <input
                id="statistic-value"
                name="value"
                type="number"
                min={0}
                value={form.value}
                onChange={(event) => updateForm("value", event.target.value)}
                required
                disabled={submitting || loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>

            {error && (
              <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <div className={modalFormFooterClass()}>
              <Button type="submit" disabled={submitting || loading || matches.length === 0 || teams.length === 0 || players.length === 0} className="w-full sm:w-auto">
                {submitting ? "Enregistrement..." : "Ajouter la statistique"}
              </Button>
            </div>
          </form>
        </FormDrawer>

        <FormDrawer
          open={Boolean(editingStat)}
          onClose={closeEditStat}
          title="Modifier la statistique"
          description={editingStat ? `#${editingStat.id}` : undefined}
        >
          <form onSubmit={handleUpdateStat} className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <FormSearchableSelect
              id="edit-statistic-match"
              label="Match *"
              className="md:col-span-2"
              value={form.match_game_id}
              onChange={(value) => updateForm("match_game_id", value)}
              emptyOptionLabel="Sélectionner un match"
              disabled={submitting || loading}
              options={matchSelectOptions}
            />
            <FormSearchableSelect
              id="edit-statistic-team"
              label="Équipe *"
              value={form.team_id}
              onChange={(value) => updateForm("team_id", value)}
              emptyOptionLabel="Sélectionner une équipe"
              disabled={submitting || loading}
              options={teamSelectOptions(teams, user?.id)}
            />
            <FormSearchableSelect
              id="edit-statistic-player"
              label="Joueur *"
              value={form.player_id}
              onChange={(value) => updateForm("player_id", value)}
              emptyOptionLabel="Sélectionner un joueur"
              disabled={submitting || loading}
              options={players.map((player) => ({
                value: String(player.id),
                label: playerLabel(player.id, players, player),
              }))}
            />
            <FormSearchableSelect
              id="edit-statistic-type"
              label="Type *"
              value={form.stat_type}
              onChange={(value) => updateForm("stat_type", value as StatisticType)}
              disabled={submitting || loading}
              searchable={false}
              options={statTypes.map((type) => ({ value: type.value, label: type.label }))}
            />
            <div>
              <label htmlFor="edit-statistic-value" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Valeur *</label>
              <input
                id="edit-statistic-value"
                type="number"
                min={0}
                value={form.value}
                onChange={(event) => updateForm("value", event.target.value)}
                required
                disabled={submitting || loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <div className="md:col-span-5">
              <div className={modalFormFooterClass()}>
                <Button type="submit" disabled={submitting || loading} className="w-full sm:w-auto">
                  {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </div>
          </form>
        </FormDrawer>

        <ConfirmModal
          open={Boolean(statToDelete)}
          onClose={() => setStatToDelete(null)}
          title="Supprimer la statistique"
          message={
            statToDelete
              ? `Voulez-vous vraiment supprimer la statistique #${statToDelete.id} ? Cette action est irréversible.`
              : ""
          }
          confirmLabel="Supprimer"
          loading={deletingId !== null}
          onConfirm={() => void handleConfirmDelete()}
        />
      </PageStack>
    </>
  );
}
