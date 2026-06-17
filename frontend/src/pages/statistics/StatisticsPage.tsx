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
  { value: "goal", label: "Goal" },
  { value: "assist", label: "Assist" },
  { value: "yellow_card", label: "Yellow card" },
  { value: "red_card", label: "Red card" },
  { value: "clean_sheet", label: "Clean sheet" },
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
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Team #${teamId}`;
}

function playerLabel(playerId: number, players: ApiPlayer[], embedded?: ApiPlayer | null) {
  return playerName(embedded) || playerName(players.find((player) => player.id === playerId)) || `Player #${playerId}`;
}

function matchName(matchId: number, matches: ApiMatch[], embedded?: ApiMatch | null) {
  const match = embedded ?? matches.find((item) => item.id === matchId);
  if (!match) return `Match #${matchId}`;

  const home = match.home_team?.name ?? `Team #${match.home_team_id}`;
  const away = match.away_team?.name ?? `Team #${match.away_team_id}`;
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
    return "Your session has expired. Please log in again.";
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
      setError(readableStatisticError(err, "Unable to load statistics."));
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
      setSuccess("Statistic created.");
      setForm((current) => ({
        ...emptyForm,
        match_game_id: current.match_game_id,
        team_id: current.team_id,
        player_id: current.player_id,
      }));
      await loadData();
    } catch (err) {
      setError(readableStatisticError(err, "Unable to create statistic."));
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
            { label: "Goals", value: totals.goals, icon: <PieChartIcon className="size-5 text-emerald-400" /> },
            { label: "Assists", value: totals.assists, icon: <BoltIcon className="size-5 text-sky-400" /> },
            { label: "Cards", value: totals.cards, icon: <PieChartIcon className="size-5 text-amber-400" /> },
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
            <p className={clsx("text-sm", t.textSecondary)}>Login is required to add statistics. Public statistics remain visible.</p>
          ) : (
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match *</label>
                <select
                  value={form.match_game_id}
                  onChange={(event) => updateForm("match_game_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Select match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {matchName(match.id, matches, match)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Team *</label>
                <select
                  value={form.team_id}
                  onChange={(event) => updateForm("team_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Player *</label>
                <select
                  value={form.player_id}
                  onChange={(event) => updateForm("player_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Select player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>{playerLabel(player.id, players, player)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Type *</label>
                <select
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
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Value *</label>
                <input
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
                  {submitting ? "Saving..." : "Add statistic"}
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

        <ComponentCard title="Filtres" desc="Recherche simple par match, equipe, joueur ou type">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match</label>
              <select
                value={filters.match_game_id}
                onChange={(event) => updateFilter("match_game_id", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">All matches</option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>{matchName(match.id, matches, match)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Team</label>
              <select
                value={filters.team_id}
                onChange={(event) => updateFilter("team_id", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">All teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Player</label>
              <select
                value={filters.player_id}
                onChange={(event) => updateFilter("player_id", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">All players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{playerLabel(player.id, players, player)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Type</label>
              <select
                value={filters.stat_type}
                onChange={(event) => updateFilter("stat_type", event.target.value)}
                disabled={loading}
                className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="">All types</option>
                {statTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="button" onClick={handleApplyFilters} disabled={loading}>
                Apply
              </Button>
              <Button type="button" variant="secondary" onClick={handleResetFilters} disabled={loading}>
                Reset
              </Button>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Liste des statistiques" desc="Donnees backend">
          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Loading statistics...</p>
          )}

          {!loading && !error && statistics.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>No statistics available yet.</p>
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
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Created</th>
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
