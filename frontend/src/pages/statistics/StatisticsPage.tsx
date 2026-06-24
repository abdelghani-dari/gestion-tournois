import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  ApiError,
  createStatistic,
  getMatches,
  getPlayers,
  getStatistics,
  getTeams,
  type ApiMatch,
  type ApiPlayer,
  type ApiStatistic,
  type ApiTeam,
  type StatisticPayload,
  type StatisticType,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import Badge from "../../components/ui/Badge";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { BoltIcon, PieChartIcon } from "../../icons";

const statTypes: Array<{ value: StatisticType; label: string }> = [
  { value: "goal", label: "But" },
  { value: "assist", label: "Passe décisive" },
  { value: "yellow_card", label: "Carton jaune" },
  { value: "red_card", label: "Carton rouge" },
  { value: "clean_sheet", label: "Match sans but encaissé" },
];

type StatisticForm = {
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

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function playerName(player?: ApiPlayer | null) {
  if (!player) return "";
  return `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim() || `Player #${player.id}`;
}

function teamName(teamId: number, teams: ApiTeam[], embedded?: ApiTeam | null) {
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Équipe #${teamId}`;
}

function playerLabel(playerId: number, players: ApiPlayer[], embedded?: ApiPlayer | null) {
  return playerName(embedded) || playerName(players.find((player) => player.id === playerId)) || `Joueur #${playerId}`;
}

function matchName(matchId: number, matches: ApiMatch[], embedded?: ApiMatch | null) {
  const match = embedded ?? matches.find((item) => item.id === matchId);
  if (!match) return `Match #${matchId}`;

  const home = match.homeTeam?.name ?? match.home_team?.name ?? `Équipe #${match.home_team_id}`;
  const away = match.awayTeam?.name ?? match.away_team?.name ?? `Équipe #${match.away_team_id}`;
  return `#${match.id} - ${home} vs ${away}`;
}

function statLabel(value: string) {
  return statTypes.find((type) => type.value === value)?.label ?? value;
}

function statBadgeColor(value: string) {
  if (value === "goal" || value === "clean_sheet") return "success";
  if (value === "yellow_card") return "warning";
  if (value === "red_card") return "error";
  return "info";
}

function getRouteFilters(pathname: string, id?: string): StatisticFilters {
  if (!id) return emptyFilters;
  if (pathname.includes("/matches/")) return { ...emptyFilters, match_game_id: id };
  if (pathname.includes("/teams/")) return { ...emptyFilters, team_id: id };
  if (pathname.includes("/players/")) return { ...emptyFilters, player_id: id };
  return emptyFilters;
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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [statistics, setStatistics] = useState<ApiStatistic[]>([]);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [filters, setFilters] = useState<StatisticFilters>(() => getRouteFilters(location.pathname, id));
  const [form, setForm] = useState<StatisticForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const loadData = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value !== ""),
      ) as Record<string, string>;

      const [statisticsData, matchesData, teamsData, playersData] = await Promise.all([
        getStatistics(params),
        getMatches(),
        getTeams(),
        getPlayers(),
      ]);

      setStatistics(statisticsData);
      setMatches(matchesData);
      setTeams(teamsData);
      setPlayers(playersData);
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
    const routeFilters = getRouteFilters(location.pathname, id);
    setFilters(routeFilters);
    void loadData(routeFilters);
  }, [id, location.pathname]);

  const updateForm = (key: keyof StatisticForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
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
    } catch (err) {
      setError(readableStatisticError(err, "Impossible de créer la statistique."));
    } finally {
      setSubmitting(false);
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

        <ComponentCard title="Ajouter une statistique" desc={user ? `${user.email} - ${user.role}` : "Connexion requise"}>
          {!isAuthenticated && !authLoading ? (
            <p className={clsx("text-sm", t.textSecondary)}>La connexion est requise pour ajouter une statistique. Les statistiques publiques restent visibles.</p>
          ) : (
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <label htmlFor="statistic-match" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match *</label>
                <select
                  id="statistic-match"
                  name="match_game_id"
                  value={form.match_game_id}
                  onChange={(event) => updateForm("match_game_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Sélectionner un match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {matchName(match.id, matches, match)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="statistic-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe *</label>
                <select
                  id="statistic-team"
                  name="team_id"
                  value={form.team_id}
                  onChange={(event) => updateForm("team_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Sélectionner une équipe</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="statistic-player" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Joueur *</label>
                <select
                  id="statistic-player"
                  name="player_id"
                  value={form.player_id}
                  onChange={(event) => updateForm("player_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Sélectionner un joueur</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>{playerLabel(player.id, players, player)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="statistic-type" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Type *</label>
                <select
                  id="statistic-type"
                  name="stat_type"
                  value={form.stat_type}
                  onChange={(event) => updateForm("stat_type", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  {statTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

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

              <div className="flex items-end md:col-span-4">
                <Button type="submit" disabled={submitting || loading || matches.length === 0 || teams.length === 0 || players.length === 0}>
                  {submitting ? "Enregistrement..." : "Ajouter la statistique"}
                </Button>
              </div>
            </form>
          )}

          {(success || error) && (
            <div
              className={clsx(
                "mt-4 rounded-sm border px-4 py-3 text-sm",
                error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
              )}
            >
              {error || success}
            </div>
          )}
        </ComponentCard>

        <ComponentCard title="Filtres" desc="Recherche simple par match, équipe, joueur ou type">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label htmlFor="statistics-filter-match" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match</label>
              <select
                id="statistics-filter-match"
                name="match_game_id"
                value={filters.match_game_id}
                onChange={(event) => updateFilter("match_game_id", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">Tous les matchs</option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>{matchName(match.id, matches, match)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statistics-filter-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe</label>
              <select
                id="statistics-filter-team"
                name="team_id"
                value={filters.team_id}
                onChange={(event) => updateFilter("team_id", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">Toutes les équipes</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statistics-filter-player" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Joueur</label>
              <select
                id="statistics-filter-player"
                name="player_id"
                value={filters.player_id}
                onChange={(event) => updateFilter("player_id", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">Tous les joueurs</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{playerLabel(player.id, players, player)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statistics-filter-type" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Type</label>
              <select
                id="statistics-filter-type"
                name="stat_type"
                value={filters.stat_type}
                onChange={(event) => updateFilter("stat_type", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">Tous les types</option>
                {statTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="button" onClick={handleApplyFilters} disabled={loading}>
                Appliquer
              </Button>
              <Button type="button" variant="secondary" onClick={handleResetFilters} disabled={loading}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Liste des statistiques" desc="Données enregistrées">
          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des statistiques...</p>
          )}

          {!loading && !error && statistics.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          )}

          {!loading && statistics.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[1040px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[20%]" />
                  <col className="w-[17%]" />
                  <col className="w-[18%]" />
                  <col className="w-[13%]" />
                  <col className="w-[9%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Équipe</th>
                    <th className="px-4 py-3">Joueur</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Valeur</th>
                    <th className="px-4 py-3">Création</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((statistic) => {
                    const embeddedMatch = statistic.matchGame ?? statistic.match_game;
                    return (
                      <tr key={statistic.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                        <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{statistic.id}</td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>
                          <span className="block truncate" title={matchName(statistic.match_game_id, matches, embeddedMatch)}>
                            {matchName(statistic.match_game_id, matches, embeddedMatch)}
                          </span>
                        </td>
                        <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                          <span className="block truncate" title={teamName(statistic.team_id, teams, statistic.team)}>
                            {teamName(statistic.team_id, teams, statistic.team)}
                          </span>
                        </td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>
                          <span className="block truncate" title={playerLabel(statistic.player_id, players, statistic.player)}>
                            {playerLabel(statistic.player_id, players, statistic.player)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={statBadgeColor(statistic.stat_type)}>{statLabel(statistic.stat_type)}</Badge>
                        </td>
                        <td className={clsx("px-4 py-3 font-semibold tabular-nums", t.textPrimary)}>{statistic.value}</td>
                        <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>
                          {formatDate(statistic.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </PageStack>
    </>
  );
}
