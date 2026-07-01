/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ApiError,
  getDashboardSummary,
  getTeams,
  type ApiTeam,
  type BarChartPoint,
  type DashboardSummary,
} from "../../api";
import CardMoreLink from "../../components/common/CardMoreLink";
import ComponentCard from "../../components/common/ComponentCard";
import UserAvatar from "../../components/common/UserAvatar";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import GoalsLineChart from "../../components/dashboard/GoalsLineChart";
import TeamSeasonChart from "../../components/dashboard/TeamSeasonChart";
import DashboardBarChart from "../../components/dashboard/DashboardBarChart";
import CreatorTournamentRankList from "../../components/dashboard/CreatorTournamentRankList";
import RankingPreviewTable from "../../components/dashboard/RankingPreviewTable";
import TopScorersCard from "../../components/dashboard/TopScorersCard";
import TournamentPreviewList from "../../components/dashboard/TournamentPreviewList";
import MatchRowList from "../../components/matches/MatchRowList";
import SearchableSelect from "../../components/common/SearchableSelect";
import OwnedItemBadge from "../../components/common/OwnedItemBadge";
import { teamSelectOptions } from "../../components/common/selectOptionBuilders";
import { Skeleton } from "../../components/common/skeletons/Skeleton";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import {
  GroupIcon,
  PaperPlaneIcon,
  PieChartIcon,
  ShootingStarIcon,
  TableIcon,
  TaskIcon,
  UserIcon,
} from "../../icons";

const summaryPromises: Record<string, Promise<DashboardSummary>> = {};
function fetchDashboardSummaryCached(tournamentId?: number, teamId?: number) {
  const key = `${tournamentId ?? ""}:${teamId ?? ""}`;
  if (!summaryPromises[key]) {
    summaryPromises[key] = getDashboardSummary(tournamentId, teamId).finally(() => {
      delete summaryPromises[key];
    });
  }
  return summaryPromises[key];
}

function dashboardErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
    if (error.status === 404) return "Une ressource du tableau de bord est introuvable.";
    if (error.status >= 500) return "Le serveur ne peut pas charger le tableau de bord pour le moment.";
  }
  return error instanceof Error ? error.message : "Impossible de charger le tableau de bord.";
}

function MetricCard({
  label,
  value,
  tone,
  icon,
  loading,
}: {
  label: string;
  value: number;
  tone?: string;
  icon: ReactNode;
  loading?: boolean;
}) {
  const t = useThemeTokens();
  return (
    <div className={clsx("rounded-md border p-4", t.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{label}</p>
          {loading ? (
            <Skeleton className={clsx("mt-2 h-9 w-16 rounded", t.metricBg)} />
          ) : (
            <p className={clsx("mt-2 text-3xl font-bold tabular-nums", tone ?? t.textPrimary)}>{value}</p>
          )}
        </div>
        <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10", tone ?? "text-brand-400")}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function TournamentFilterSelect({
  selectId,
  options,
  value,
  onChange,
  disabled,
  ownerUserId,
}: {
  selectId: string;
  options: DashboardSummary["tournament_options"];
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
  ownerUserId?: number | null;
}) {
  if (options.length <= 1) return null;

  return (
    <SearchableSelect
      selectId={selectId}
      variant="filter"
      panelLabel="TOURNOI"
      value={String(value ?? options[0]?.id ?? "")}
      onChange={(next) => onChange(Number(next))}
      options={options.map((option) => ({
        value: String(option.id),
        label: option.name,
        content: (
          <div className="flex w-full min-w-0 items-center gap-2">
            <span className="min-w-0 truncate font-medium">{option.name}</span>
            <OwnedItemBadge owned={ownerUserId != null && Number(option.created_by) === Number(ownerUserId)} />
          </div>
        ),
      }))}
      searchable={options.length > 4}
      disabled={disabled}
    />
  );
}

type WidgetKey =
  | "season"
  | "teamSeason"
  | "progress"
  | "week"
  | "topMatches"
  | "topTeams"
  | "yellowCards"
  | "redCards"
  | "ranking"
  | "topScorers"
  | "recent";

function ChartSkeleton() {
  const t = useThemeTokens();
  return (
    <div className="space-y-3 py-2">
      <Skeleton className={clsx("h-4 w-1/3", t.metricBg)} />
      <Skeleton className={clsx("h-[220px] w-full rounded-md", t.metricBg)} />
    </div>
  );
}

function ChartCard({
  title,
  desc,
  loading,
  data,
  children,
  tournamentFilter,
}: {
  title: string;
  desc: string;
  loading: boolean;
  data: BarChartPoint[];
  children: ReactNode;
  tournamentFilter?: ReactNode;
}) {
  if (!loading && data.length === 0) return null;

  return (
    <ComponentCard
      fill
      title={title}
      desc={desc}
      action={tournamentFilter}
    >
      {loading ? <ChartSkeleton /> : children}
    </ComponentCard>
  );
}

function DashboardMessage({ children, error = false }: { children: string; error?: boolean }) {
  const t = useThemeTokens();
  return <p className={clsx("py-8 text-center text-sm", error ? "text-red-300" : t.textMuted)}>{children}</p>;
}

function tournamentChartFallback(items: DashboardSummary["creator_tournament_rankings"]): BarChartPoint[] {
  return items.map((item) => ({
    label: item.name,
    value: item.total_goals ?? 0,
  }));
}

export default function DashboardPage() {
  const t = useThemeTokens();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [widgetSummaries, setWidgetSummaries] = useState<Partial<Record<WidgetKey, DashboardSummary>>>({});
  const [widgetTournamentIds, setWidgetTournamentIds] = useState<Partial<Record<WidgetKey, number>>>({});
  const [widgetLoading, setWidgetLoading] = useState<Partial<Record<WidgetKey, boolean>>>({});
  const [teamSeasonTeams, setTeamSeasonTeams] = useState<ApiTeam[]>([]);
  const [teamSeasonTeamId, setTeamSeasonTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const loadedDashboardFor = useRef("");

  const counts = summary?.counts;
  const tournamentOptions = summary?.tournament_options ?? [];
  const dashboardView = summary?.dashboard_view;
  const isCreatorScope = dashboardView?.is_creator_scope ?? !isAdmin;
  const showTournamentSidebar = isAdmin || dashboardView?.sidebar_mode === "tournaments";
  const creatorRankings = summary?.creator_tournament_rankings ?? [];

  const defaultTournamentId = useMemo(() => {
    if (!summary || tournamentOptions.length === 0) return null;
    const d10Champs = tournamentOptions.find(
      (option) => option.name?.trim().toLowerCase() === "d10-champs"
    );
    return d10Champs ? d10Champs.id : (summary.selected_tournament_id ?? tournamentOptions[0]?.id ?? null);
  }, [summary, tournamentOptions]);

  const tournamentNameFor = useCallback(
    (key: WidgetKey) => {
      const tid = widgetTournamentIds[key] ?? defaultTournamentId;
      return tournamentOptions.find((option) => option.id === tid)?.name ?? summary?.featured_tournament?.name ?? "Tournoi sélectionné";
    },
    [widgetTournamentIds, defaultTournamentId, tournamentOptions, summary?.featured_tournament?.name],
  );

  const widgetSummary = useCallback(
    (key: WidgetKey) => widgetSummaries[key] ?? summary,
    [widgetSummaries, summary],
  );

  const recentMatches = widgetSummary("recent")?.recent_matches ?? summary?.recent_matches ?? [];

  const progress = widgetSummary("progress")?.selected_tournament_progress ?? summary?.selected_tournament_progress;
  const playedCount = progress?.played ?? summary?.match_status.played ?? 0;
  const scheduledCount = progress?.scheduled ?? summary?.match_status.scheduled ?? 0;
  const totalMatches = progress?.total ?? playedCount + scheduledCount;
  const teamsInTournament = progress?.teams_count ?? 0;
  const progressPct = totalMatches > 0 ? Math.round((playedCount / totalMatches) * 100) : 0;
  const featuredName = tournamentNameFor("season");

  const tournamentGoalsChart = useMemo(() => {
    const fromStats = summary?.chart_stats?.top_tournaments_by_goals ?? [];
    if (fromStats.length > 0 || !isCreatorScope) return fromStats;
    return tournamentChartFallback(creatorRankings);
  }, [summary, isCreatorScope, creatorRankings]);

  const loadDashboard = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setDashboardError("");

    try {
      const data = await fetchDashboardSummaryCached();
      setSummary(data);
      setWidgetSummaries({});
      setWidgetTournamentIds({});
      setTeamSeasonTeams([]);
      setTeamSeasonTeamId(null);
    } catch (err) {
      console.error("Dashboard request failed: /dashboard/summary", err);
      setDashboardError(dashboardErrorMessage(err));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const loadWidget = useCallback(async (key: WidgetKey, tournamentId: number) => {
    setWidgetTournamentIds((prev) => ({ ...prev, [key]: tournamentId }));
    setWidgetLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const data = await fetchDashboardSummaryCached(tournamentId);
      setWidgetSummaries((prev) => ({ ...prev, [key]: data }));
    } catch (err) {
      console.error(`Dashboard widget failed: ${key}`, err);
    } finally {
      setWidgetLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const loadTeamSeasonWithTeam = useCallback(async (tournamentId: number, teamId: number) => {
    setWidgetTournamentIds((prev) => ({ ...prev, teamSeason: tournamentId }));
    setTeamSeasonTeamId(teamId);
    setWidgetLoading((prev) => ({ ...prev, teamSeason: true }));

    try {
      const data = await fetchDashboardSummaryCached(tournamentId, teamId);
      setWidgetSummaries((prev) => ({ ...prev, teamSeason: data }));
    } catch (err) {
      console.error("Dashboard team season widget failed", err);
    } finally {
      setWidgetLoading((prev) => ({ ...prev, teamSeason: false }));
    }
  }, []);

  const loadTeamSeasonForTournament = useCallback(
    async (tournamentId: number, preferredTeamId?: number | null) => {
      setWidgetTournamentIds((prev) => ({ ...prev, teamSeason: tournamentId }));
      setWidgetLoading((prev) => ({ ...prev, teamSeason: true }));

      try {
         const teamsResponse = await getTeams({ tournament_id: tournamentId });
         const teams = Array.isArray(teamsResponse) ? teamsResponse : teamsResponse.data ?? [];
         setTeamSeasonTeams(teams);

         const resolvedTeamId =
           preferredTeamId && teams.some((team) => team.id === preferredTeamId)
             ? preferredTeamId
             : teams[0]?.id ?? null;

         setTeamSeasonTeamId(resolvedTeamId);

         if (resolvedTeamId) {
           const data = await fetchDashboardSummaryCached(tournamentId, resolvedTeamId);
           setWidgetSummaries((prev) => ({ ...prev, teamSeason: data }));
         } else {
           setWidgetSummaries((prev) => ({ ...prev, teamSeason: undefined }));
         }
      } catch (err) {
        console.error("Dashboard team season widget failed", err);
      } finally {
        setWidgetLoading((prev) => ({ ...prev, teamSeason: false }));
      }
    },
    [],
  );

  const makeWidgetFilter = useCallback(
    (key: WidgetKey) =>
      tournamentOptions.length > 1 ? (
        <TournamentFilterSelect
          selectId={`dashboard-${key}`}
          options={tournamentOptions}
          value={widgetTournamentIds[key] ?? defaultTournamentId}
          onChange={(id) => void loadWidget(key, id)}
          disabled={!!widgetLoading[key]}
          ownerUserId={user?.id}
        />
      ) : null,
    [tournamentOptions, widgetTournamentIds, defaultTournamentId, loadWidget, widgetLoading, user?.id],
  );

  const isWidgetLoading = useCallback(
    (key: WidgetKey) => loading || !!widgetLoading[key],
    [loading, widgetLoading],
  );

  const rankingTournamentId = widgetTournamentIds.ranking ?? defaultTournamentId;
  const teamSeasonTournamentId = widgetTournamentIds.teamSeason ?? defaultTournamentId;
  const selectedTeamSeasonTeam = teamSeasonTeams.find((team) => team.id === teamSeasonTeamId) ?? null;

  useEffect(() => {
    if (loading || !defaultTournamentId) return;
    void loadTeamSeasonForTournament(defaultTournamentId);
  }, [loading, defaultTournamentId, loadTeamSeasonForTournament]);

  // If the preferred default tournament (e.g. D10-champs) differs from the backend's
  // selection, load all chart widgets for the correct tournament so data matches the dropdown.
  useEffect(() => {
    if (loading || !defaultTournamentId || !summary) return;
    const backendDefault = summary.selected_tournament_id ?? null;
    if (defaultTournamentId === backendDefault) return; // already in sync
    void loadWidget("season", defaultTournamentId);
    void loadWidget("ranking", defaultTournamentId);
    void loadWidget("progress", defaultTournamentId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, defaultTournamentId, summary?.selected_tournament_id]);

  useEffect(() => {
    const loadKey = isAuthenticated ? `${user?.id ?? user?.email ?? "authenticated"}:${isAdmin}` : "anonymous";
    if (loadedDashboardFor.current === loadKey) return;
    loadedDashboardFor.current = loadKey;
    void loadDashboard();
  }, [isAuthenticated, isAdmin, user?.email, user?.id]);

  const userQuickLinks = [
    { label: "Créer un tournoi", desc: "Nouvelle demande", to: "/tournaments?create=1", icon: <ShootingStarIcon className="size-5" /> },
    { label: "Gérer les équipes", desc: "Vos équipes locales", to: "/teams", icon: <GroupIcon className="size-5" /> },
    { label: "Gérer les joueurs", desc: "Effectifs et postes", to: "/players", icon: <UserIcon className="size-5" /> },
    { label: "Demandes", desc: "Participations", to: "/join-requests", icon: <PaperPlaneIcon className="size-5" /> },
    { label: "Matchs", desc: "Calendrier et résultats", to: "/matches", icon: <TableIcon className="size-5" /> },
    { label: "Classements", desc: "Points et positions", to: "/rankings", icon: <TaskIcon className="size-5" /> },
  ];

  const adminQuickLinks = [
    { label: "Admin tournois", desc: "Valider les demandes", to: "/tournaments", icon: <UserIcon className="size-5" /> },
    { label: "Tournois publics", desc: "Voir les tournois acceptés", to: "/tournaments", icon: <ShootingStarIcon className="size-5" /> },
    { label: "Matchs", desc: "Suivre les résultats", to: "/matches", icon: <TableIcon className="size-5" /> },
    { label: "Classements", desc: "Contrôler les points", to: "/rankings", icon: <PieChartIcon className="size-5" /> },
  ];

  const sidebarTitle = showTournamentSidebar
    ? isCreatorScope
      ? (dashboardView?.my_tournament_count ?? 0) > 1
        ? "Top tournois créés"
        : "Vos tournois créés"
      : "Top tournois"
    : "Meilleurs buteurs";

  const sidebarDesc = showTournamentSidebar
    ? isCreatorScope
      ? (dashboardView?.my_tournament_count ?? 0) > 1
        ? "Classés par buts marqués · tournois que vous avez créés"
        : "Tournois que vous avez créés"
      : "Classés par buts marqués · tous les tournois"
    : `Top 5 · ${featuredName}`;

  const hasGoalsChartData = (widgetSummary("season")?.goals_by_month ?? []).some(
    (point) =>
      point.scored > 0 ||
      (point.yellow_cards ?? 0) > 0 ||
      (point.red_cards ?? 0) > 0,
  );
  const hasTeamSeasonData =
    (widgetSummary("teamSeason")?.team_stats_by_month ?? []).some(
      (point) =>
        point.goals_scored > 0 ||
        point.goals_conceded > 0 ||
        point.points > 0 ||
        point.yellow_cards > 0 ||
        point.red_cards > 0,
    ) || teamSeasonTeams.length > 0;
  const hasSidebarContent = showTournamentSidebar
    ? isCreatorScope && (dashboardView?.my_tournament_count ?? 0) > 1
      ? creatorRankings.length > 0
      : (summary?.tournaments_preview ?? []).length > 0
    : (summary?.top_scorers ?? []).length > 0;
  const hasRankingPreview = (widgetSummary("ranking")?.ranking_preview ?? []).length > 0;
  const hasProgress = totalMatches > 0 || teamsInTournament > 0;

  return (
    <>
      <XPageMeta title="Dashboard" description="Gestion des tournois locaux" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4", GRID_GAP)}>
          {isAdmin ? (
            <>
              <MetricCard label="En attente" value={summary?.tournament_status.pending ?? 0} tone="text-amber-400" icon={<PaperPlaneIcon className="size-5" />} loading={loading} />
              <MetricCard label="Acceptés" value={summary?.tournament_status.accepted ?? 0} tone="text-emerald-400" icon={<ShootingStarIcon className="size-5" />} loading={loading} />
              <MetricCard label="Matchs joués" value={playedCount} tone="text-rose-400" icon={<TaskIcon className="size-5" />} loading={isWidgetLoading("progress")} />
              <MetricCard label="Résultats confirmés" value={counts?.confirmed_results ?? 0} tone="text-cyan-400" icon={<TableIcon className="size-5" />} loading={loading} />
            </>
          ) : (
            <>
              <MetricCard label="Mes tournois" value={counts?.my_tournaments ?? 0} tone="text-brand-400" icon={<ShootingStarIcon className="size-5" />} loading={loading} />
              <MetricCard label="Mes équipes" value={counts?.my_teams ?? 0} tone="text-cyan-400" icon={<GroupIcon className="size-5" />} loading={loading} />
              <MetricCard label="Mes joueurs" value={counts?.my_players ?? 0} tone="text-indigo-400" icon={<UserIcon className="size-5" />} loading={loading} />
              <MetricCard label="Matchs" value={counts?.matches ?? 0} tone="text-rose-400" icon={<TaskIcon className="size-5" />} loading={loading} />
            </>
          )}
        </div>

        {dashboardError && <DashboardMessage error>{dashboardError}</DashboardMessage>}

        <div className={clsx("grid grid-cols-12 items-stretch", GRID_GAP)}>
          {(loading || hasGoalsChartData) && (
            <div className="col-span-12 flex xl:col-span-8">
              <div className={clsx("flex h-full w-full flex-col overflow-visible rounded-md", t.panelGlass)}>
                <div className="p-4 sm:p-6">
                  <GoalsLineChart
                    data={widgetSummary("season")?.goals_by_month ?? []}
                    tournamentName={tournamentNameFor("season")}
                    loading={isWidgetLoading("season")}
                    filter={makeWidgetFilter("season")}
                  />
                </div>
              </div>
            </div>
          )}

          {(loading || hasSidebarContent) && (
            <div className={clsx("col-span-12 flex", hasGoalsChartData || loading ? "xl:col-span-4" : "xl:col-span-12")}>
              <ComponentCard
                fill
                title={sidebarTitle}
                desc={sidebarDesc}
                action={
                  showTournamentSidebar ? (
                    <CardMoreLink to="/tournaments" />
                  ) : (
                    <CardMoreLink to="/players" />
                  )
                }
              >
                {loading ? (
                  <DashboardMessage>Chargement...</DashboardMessage>
                ) : showTournamentSidebar ? (
                  isCreatorScope && (dashboardView?.my_tournament_count ?? 0) > 1 ? (
                    <CreatorTournamentRankList items={creatorRankings} />
                  ) : (
                    <TournamentPreviewList items={summary?.tournaments_preview ?? []} />
                  )
                ) : (
                  <TopScorersCard fill scorers={summary?.top_scorers ?? []} />
                )}
              </ComponentCard>
            </div>
          )}

        </div>

        <div className={clsx("grid grid-cols-1 xl:grid-cols-2", GRID_GAP)}>
          {isCreatorScope && (dashboardView?.my_tournament_count ?? 0) > 1 && (
            <ChartCard
              title="Buts par tournoi"
              desc="Vos tournois créés · classés par buts marqués"
              loading={loading}
              data={tournamentGoalsChart}
            >
              <DashboardBarChart title="Buts par tournoi" data={tournamentGoalsChart} color="#38bdf8" />
            </ChartCard>
          )}

          <ChartCard
            title="Buts par semaine"
            desc={`Activité hebdomadaire · ${tournamentNameFor("week")}`}
            loading={isWidgetLoading("week")}
            data={widgetSummary("week")?.chart_stats?.goals_by_week ?? []}
            tournamentFilter={makeWidgetFilter("week")}
          >
            <DashboardBarChart
              title="Buts / semaine"
              data={widgetSummary("week")?.chart_stats?.goals_by_week ?? []}
              color="#818cf8"
            />
          </ChartCard>

          <ChartCard
            title="Matchs les plus prolifiques"
            desc={`Rencontres avec le plus de buts · ${tournamentNameFor("topMatches")}`}
            loading={isWidgetLoading("topMatches")}
            data={widgetSummary("topMatches")?.chart_stats?.top_matches_by_goals ?? []}
            tournamentFilter={makeWidgetFilter("topMatches")}
          >
            <DashboardBarChart
              title="Buts par match"
              data={widgetSummary("topMatches")?.chart_stats?.top_matches_by_goals ?? []}
              color="#f472b6"
            />
          </ChartCard>

          {isAdmin ? (
            <>
              <ChartCard
                title="Tournois les plus prolifiques"
                desc="Total de buts marqués · tous les tournois acceptés"
                loading={loading}
                data={summary?.chart_stats?.top_tournaments_by_goals ?? []}
              >
                <DashboardBarChart
                  title="Buts par tournoi"
                  data={summary?.chart_stats?.top_tournaments_by_goals ?? []}
                  color="#38bdf8"
                />
              </ChartCard>

              <ChartCard
                title="Équipes les plus offensives"
                desc={`Buts marqués · ${tournamentNameFor("topTeams")}`}
                loading={isWidgetLoading("topTeams")}
                data={widgetSummary("topTeams")?.chart_stats?.top_teams_by_goals ?? []}
                tournamentFilter={makeWidgetFilter("topTeams")}
              >
                <DashboardBarChart
                  title="Buts marqués"
                  data={widgetSummary("topTeams")?.chart_stats?.top_teams_by_goals ?? []}
                  color="#34d399"
                />
              </ChartCard>

              <ChartCard
                title="Cartons jaunes"
                desc={`Joueurs les plus avertis · ${tournamentNameFor("yellowCards")}`}
                loading={isWidgetLoading("yellowCards")}
                data={widgetSummary("yellowCards")?.chart_stats?.top_yellow_cards ?? []}
                tournamentFilter={makeWidgetFilter("yellowCards")}
              >
                <DashboardBarChart
                  title="Cartons jaunes"
                  data={widgetSummary("yellowCards")?.chart_stats?.top_yellow_cards ?? []}
                  color="#fbbf24"
                />
              </ChartCard>

              <ChartCard
                title="Cartons rouges"
                desc={`Joueurs exclus · ${tournamentNameFor("redCards")}`}
                loading={isWidgetLoading("redCards")}
                data={widgetSummary("redCards")?.chart_stats?.top_red_cards ?? []}
                tournamentFilter={makeWidgetFilter("redCards")}
              >
                <DashboardBarChart
                  title="Cartons rouges"
                  data={widgetSummary("redCards")?.chart_stats?.top_red_cards ?? []}
                  color="#f87171"
                />
              </ChartCard>
            </>
          ) : (
            <>
              <ChartCard
                title="Équipes les plus offensives"
                desc={`Buts marqués · ${tournamentNameFor("topTeams")}`}
                loading={isWidgetLoading("topTeams")}
                data={widgetSummary("topTeams")?.chart_stats?.top_teams_by_goals ?? []}
                tournamentFilter={makeWidgetFilter("topTeams")}
              >
                <DashboardBarChart
                  title="Buts marqués"
                  data={widgetSummary("topTeams")?.chart_stats?.top_teams_by_goals ?? []}
                  color="#34d399"
                />
              </ChartCard>

              {(dashboardView?.my_tournament_count ?? 0) <= 1 && (loading || (widgetSummary("topScorers")?.top_scorers ?? []).length > 0) && (
                <ComponentCard fill title="Meilleurs buteurs" desc={`Top 5 · ${tournamentNameFor("topScorers")}`} action={makeWidgetFilter("topScorers")}>
                  {isWidgetLoading("topScorers") ? (
                    <DashboardMessage>Chargement...</DashboardMessage>
                  ) : (
                    <TopScorersCard scorers={widgetSummary("topScorers")?.top_scorers ?? []} />
                  )}
                </ComponentCard>
              )}
            </>
          )}
        </div>

        <div className={clsx("grid grid-cols-12 items-stretch", GRID_GAP)}>
          {(loading || recentMatches.length > 0) && (
            <div className="col-span-12 flex xl:col-span-8">
              <ComponentCard
                fill
                title="Derniers matchs"
                desc={`Résultats récents · ${tournamentNameFor("recent")}`}
                action={
                  <div className="flex shrink-0 items-center gap-2">
                    {makeWidgetFilter("recent")}
                    {recentMatches.length > 0 ? <CardMoreLink to="/matches" /> : null}
                  </div>
                }
              >
                {isWidgetLoading("recent") ? (
                  <DashboardMessage>Chargement...</DashboardMessage>
                ) : (
                  <MatchRowList matches={recentMatches} teams={[]} compact />
                )}
              </ComponentCard>
            </div>
          )}

          {(loading || hasProgress) && (
            <div className="col-span-12 flex xl:col-span-4">
              <ComponentCard fill title="Progression" desc={tournamentNameFor("progress")} action={makeWidgetFilter("progress")}>
                {isWidgetLoading("progress") ? (
                  <ChartSkeleton />
                ) : (
                  <div className="flex flex-1 flex-col gap-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className={t.textSecondary}>Avancement du tournoi</span>
                        <span className={clsx("font-mono tabular-nums font-semibold", t.textPrimary)}>{progressPct}%</span>
                      </div>
                      <div className={clsx("h-2.5 overflow-hidden rounded-full", t.metricBg)}>
                        <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${Math.max(totalMatches > 0 ? 4 : 0, progressPct)}%` }} />
                      </div>
                      <p className={clsx("mt-2 text-[11px]", t.textMuted)}>
                        {playedCount} joués · {scheduledCount} à venir · {totalMatches} au total
                      </p>
                    </div>
                    <div className={clsx("grid grid-cols-3 gap-2 border-t pt-3", t.border)}>
                      <div className={clsx("rounded-md px-2 py-2.5 text-center", t.metricBg)}>
                        <p className="text-base font-bold tabular-nums text-emerald-400">{playedCount}</p>
                        <p className={clsx("mt-0.5 text-[10px]", t.textMuted)}>Joués</p>
                      </div>
                      <div className={clsx("rounded-md px-2 py-2.5 text-center", t.metricBg)}>
                        <p className="text-base font-bold tabular-nums text-brand-400">{scheduledCount}</p>
                        <p className={clsx("mt-0.5 text-[10px]", t.textMuted)}>À venir</p>
                      </div>
                      <div className={clsx("rounded-md px-2 py-2.5 text-center", t.metricBg)}>
                        <p className="text-base font-bold tabular-nums text-cyan-400">{teamsInTournament}</p>
                        <p className={clsx("mt-0.5 text-[10px]", t.textMuted)}>Équipes</p>
                      </div>
                    </div>
                  </div>
                )}
              </ComponentCard>
            </div>
          )}
        </div>

        {(loading || hasTeamSeasonData) && (
          <div className={clsx("overflow-visible rounded-md", t.panelGlass)}>
            <div className="p-4 sm:p-6">
              <TeamSeasonChart
                data={widgetSummary("teamSeason")?.team_stats_by_month ?? []}
                teamName={selectedTeamSeasonTeam?.name}
                tournamentName={tournamentNameFor("teamSeason")}
                loading={isWidgetLoading("teamSeason")}
                filter={
                  <>
                    {tournamentOptions.length > 1 ? (
                      <TournamentFilterSelect
                        selectId="dashboard-teamSeason-tournament"
                        options={tournamentOptions}
                        value={teamSeasonTournamentId}
                        onChange={(id) => void loadTeamSeasonForTournament(id)}
                        disabled={!!widgetLoading.teamSeason}
                        ownerUserId={user?.id}
                      />
                    ) : null}
                    {teamSeasonTeams.length > 0 ? (
                      <SearchableSelect
                        selectId="dashboard-teamSeason-team"
                        variant="filter"
                        panelLabel="ÉQUIPE"
                        value={String(teamSeasonTeamId ?? teamSeasonTeams[0]?.id ?? "")}
                        onChange={(next) => {
                          const tournamentId = teamSeasonTournamentId;
                          if (!tournamentId) return;
                          void loadTeamSeasonWithTeam(tournamentId, Number(next));
                        }}
                        options={teamSelectOptions(teamSeasonTeams, user?.id)}
                        searchable
                        disabled={!!widgetLoading.teamSeason}
                      />
                    ) : null}
                  </>
                }
              />
            </div>
          </div>
        )}

        {(loading || hasRankingPreview) && (
          <ComponentCard
            title="Classement"
            desc={`Top 10 · ${tournamentNameFor("ranking")}`}
            action={
              <div className="flex shrink-0 items-center gap-2">
                {makeWidgetFilter("ranking")}
                {hasRankingPreview && rankingTournamentId ? (
                  <CardMoreLink to={`/tournaments/${rankingTournamentId}/ranking`} />
                ) : null}
              </div>
            }
          >
            {isWidgetLoading("ranking") ? (
              <DashboardMessage>Chargement...</DashboardMessage>
            ) : (
              <RankingPreviewTable rankings={widgetSummary("ranking")?.ranking_preview ?? []} limit={10} />
            )}
          </ComponentCard>
        )}

        <ComponentCard title="Mon compte" desc={user?.email ?? "Compte connecté"}>
          <div className={clsx("flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center", t.card)}>
            <UserAvatar user={user} name={user?.name} showRoleRing className="mx-auto h-14 w-14 sm:mx-0" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className={clsx("text-lg font-semibold", t.textPrimary)}>{user?.name}</p>
              <p className={clsx("text-sm", t.textSecondary)}>
                {isAdmin ? "Validation et supervision des tournois." : "Organisation de vos tournois locaux."}
              </p>
            </div>
            <CardMoreLink to="/profile" label="Mon profil" />
          </div>
        </ComponentCard>

        <ComponentCard title="Accès rapides" desc={isAdmin ? "Actions d'administration" : "Votre espace de gestion"}>
          <div className={clsx("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3", GRID_GAP)}>
            {(isAdmin ? adminQuickLinks : userQuickLinks).map((item) => (
              <Link key={item.to + item.label} to={item.to} className={clsx("rounded-md border p-5 transition-colors", t.card, t.cardHover)}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-500/15 text-brand-400">{item.icon}</span>
                  <div className="min-w-0">
                    <p className={clsx("font-semibold", t.textPrimary)}>{item.label}</p>
                    <p className={clsx("mt-1 text-sm", t.textSecondary)}>{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ComponentCard>
      </PageStack>
    </>
  );
}
