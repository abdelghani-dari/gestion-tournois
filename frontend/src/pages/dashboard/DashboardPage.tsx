import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createTournament,
  getAdminTournaments,
  getJoinRequests,
  getMatches,
  getTeams,
  getMyTeams,
  getMyTournaments,
  getPlayers,
  getRankings,
  type ApiMatch,
  type ApiRanking,
  type ApiTeam,
  type CreateTournamentPayload,
  type JoinRequest,
  type MyTournament,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import {
  GroupIcon,
  PaperPlaneIcon,
  PieChartIcon,
  ShootingStarIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
  UserIcon,
} from "../../icons";

const emptyForm: CreateTournamentPayload = {
  name: "",
  description: "",
  city: "",
  location: "",
  banner_path: "",
  start_date: "",
  end_date: "",
};

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function teamName(teamId: number, teams: ApiTeam[], embedded?: ApiTeam | null) {
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Équipe #${teamId}`;
}

function teamData(teamId: number, teams: ApiTeam[], embedded?: ApiTeam | null) {
  return embedded ?? teams.find((team) => team.id === teamId) ?? null;
}

function matchWinner(match: ApiMatch) {
  if (match.status !== "played" || match.result_status !== "confirmed") return null;
  if (match.home_score == null || match.away_score == null) return null;
  if (match.home_score === match.away_score) return null;
  return match.home_score > match.away_score ? match.home_team_id : match.away_team_id;
}

function StatusPill({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  return (
    <span className={clsx("inline-flex rounded-sm px-2 py-0.5 text-xs font-medium", statusTone(value) || clsx(t.metricBg, t.textSecondary))}>
      {statusLabel(value)}
    </span>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const t = useThemeTokens();
  return (
    <div className={clsx("rounded-md border p-4", t.card)}>
      <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{label}</p>
      <p className={clsx("mt-2 text-3xl font-bold tabular-nums", tone ?? t.textPrimary)}>{value}</p>
    </div>
  );
}

function HorizontalBars({ items }: { items: Array<{ label: string; value: number; tone: string }> }) {
  const t = useThemeTokens();
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className={t.textSecondary}>{item.label}</span>
            <span className={clsx("font-mono tabular-nums", t.textPrimary)}>{item.value}</span>
          </div>
          <div className={clsx("h-2 overflow-hidden rounded-sm", t.metricBg)}>
            <div className={clsx("h-full rounded-sm", item.tone)} style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingBars({ rankings }: { rankings: ApiRanking[] }) {
  const t = useThemeTokens();
  const max = Math.max(1, ...rankings.map((ranking) => ranking.points));

  if (rankings.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun classement disponible.</p>;
  }

  return (
    <div className="space-y-3">
      {rankings.slice(0, 6).map((ranking) => (
        <div key={ranking.id}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className={clsx("truncate", t.textSecondary)}>{ranking.team?.name ?? `Équipe #${ranking.team_id}`}</span>
            <span className={clsx("font-mono tabular-nums", t.textPrimary)}>{ranking.points} pts</span>
          </div>
          <div className={clsx("h-2 overflow-hidden rounded-sm", t.metricBg)}>
            <div className="h-full rounded-sm bg-brand-500" style={{ width: `${Math.max(8, (ranking.points / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TournamentBracket({ matches, teams }: { matches: ApiMatch[]; teams: ApiTeam[] }) {
  const t = useThemeTokens();

  if (matches.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun match disponible.</p>;
  }

  return (
    <div className="x-scroll overflow-x-auto">
      <div className="flex min-w-[720px] gap-4">
        {matches.slice(0, 6).map((match, index) => {
          const winnerId = matchWinner(match);
          const homeTeam = teamData(match.home_team_id, teams, match.home_team);
          const awayTeam = teamData(match.away_team_id, teams, match.away_team);
          const home = teamName(match.home_team_id, teams, homeTeam);
          const away = teamName(match.away_team_id, teams, awayTeam);

          return (
            <div key={match.id} className={clsx("w-64 shrink-0 rounded-md border p-4", t.card)}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Match {index + 1}</p>
                <StatusPill value={match.result_status ?? match.status} />
              </div>
              <div className="space-y-2">
                <div className={clsx("flex items-center justify-between gap-3 rounded-sm px-3 py-2", winnerId === match.home_team_id ? "bg-emerald-500/10 text-emerald-300" : t.metricBg)}>
                  <span className="flex min-w-0 items-center gap-2">
                    <EntityImage src={homeTeam?.logo_path} name={home} className="h-7 w-7 shrink-0 rounded-sm" />
                    <span className="truncate">{homeTeam?.short_name ? `${homeTeam.short_name} - ${home}` : home}</span>
                  </span>
                  <span className="font-mono tabular-nums">{match.home_score ?? "-"}</span>
                </div>
                <div className={clsx("flex items-center justify-between gap-3 rounded-sm px-3 py-2", winnerId === match.away_team_id ? "bg-emerald-500/10 text-emerald-300" : t.metricBg)}>
                  <span className="flex min-w-0 items-center gap-2">
                    <EntityImage src={awayTeam?.logo_path} name={away} className="h-7 w-7 shrink-0 rounded-sm" />
                    <span className="truncate">{awayTeam?.short_name ? `${awayTeam.short_name} - ${away}` : away}</span>
                  </span>
                  <span className="font-mono tabular-nums">{match.away_score ?? "-"}</span>
                </div>
              </div>
              <p className={clsx("mt-3 text-xs", t.textMuted)}>{formatDate(match.match_date)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useThemeTokens();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [allTournaments, setAllTournaments] = useState<MyTournament[]>([]);
  const [myTeams, setMyTeams] = useState<ApiTeam[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [rankings, setRankings] = useState<ApiRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateTournamentPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const sourceTournaments = isAdmin ? allTournaments : myTournaments;
  const tournamentIds = useMemo(() => new Set(sourceTournaments.map((tournament) => tournament.id)), [sourceTournaments]);
  const relatedMatches = useMemo(
    () => matches.filter((match) => tournamentIds.size === 0 || tournamentIds.has(match.tournament_id)),
    [matches, tournamentIds],
  );
  const teamIds = useMemo(() => new Set(myTeams.map((team) => team.id)), [myTeams]);
  const relatedRequests = useMemo(
    () => joinRequests.filter((request) => tournamentIds.has(request.tournament_id) || teamIds.has(request.team_id)),
    [joinRequests, teamIds, tournamentIds],
  );

  const tournamentStatusItems = [
    { label: "Acceptés", value: sourceTournaments.filter((item) => item.approval_status === "accepted").length, tone: "bg-emerald-500" },
    { label: "En attente", value: sourceTournaments.filter((item) => item.approval_status === "pending").length, tone: "bg-amber-500" },
    { label: "Refusés", value: sourceTournaments.filter((item) => item.approval_status === "refused").length, tone: "bg-red-500" },
  ];

  const matchStatusItems = [
    { label: "Planifiés", value: relatedMatches.filter((match) => match.status === "scheduled").length, tone: "bg-sky-500" },
    { label: "Joués", value: relatedMatches.filter((match) => match.status === "played").length, tone: "bg-emerald-500" },
  ];

  const resultStatusItems = [
    { label: "En attente", value: relatedMatches.filter((match) => match.result_status === "pending").length, tone: "bg-amber-500" },
    { label: "Confirmés", value: relatedMatches.filter((match) => match.result_status === "confirmed").length, tone: "bg-emerald-500" },
    { label: "Contestés", value: relatedMatches.filter((match) => match.result_status === "disputed").length, tone: "bg-red-500" },
  ];

  const loadDashboard = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const [myTournamentData, myTeamsData, teamsData, playersData, requestData, matchData, adminTournamentData] = await Promise.all([
        getMyTournaments(),
        getMyTeams(),
        getTeams(),
        getPlayers(),
        getJoinRequests(),
        getMatches(),
        isAdmin ? getAdminTournaments() : Promise.resolve([]),
      ]);

      setMyTournaments(myTournamentData);
      setMyTeams(myTeamsData);
      setTeams(teamsData);
      setPlayersCount(playersData.filter((player) => myTeamsData.some((team) => team.id === player.team_id)).length);
      setJoinRequests(requestData);
      setMatches(matchData);
      setAllTournaments(isAdmin ? adminTournamentData : myTournamentData);

      const rankingTournament = (isAdmin ? adminTournamentData : myTournamentData).find((tournament) => tournament.approval_status === "accepted");
      if (rankingTournament) {
        setRankings(await getRankings(rankingTournament.id));
      } else {
        setRankings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [isAuthenticated, isAdmin]);

  const updateForm = (key: keyof CreateTournamentPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreateTournament = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await createTournament({
        name: form.name,
        description: form.description?.trim() || undefined,
        city: form.city?.trim() || undefined,
        location: form.location?.trim() || undefined,
        banner_path: form.banner_path?.trim() || undefined,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      setSuccess("Tournoi créé et envoyé pour validation.");
      setForm(emptyForm);
      await loadDashboard();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de créer le tournoi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const userQuickLinks = [
    { label: "Créer un tournoi", desc: "Nouvelle demande", to: "/dashboard", icon: <ShootingStarIcon className="size-5" /> },
    { label: "Gérer les équipes", desc: "Vos équipes locales", to: "/teams", icon: <GroupIcon className="size-5" /> },
    { label: "Gérer les joueurs", desc: "Effectifs et postes", to: "/players", icon: <UserIcon className="size-5" /> },
    { label: "Demandes", desc: "Participations", to: "/join-requests", icon: <PaperPlaneIcon className="size-5" /> },
    { label: "Matchs", desc: "Calendrier et résultats", to: "/matches", icon: <TableIcon className="size-5" /> },
    { label: "Classements", desc: "Points et positions", to: "/rankings", icon: <TaskIcon className="size-5" /> },
  ];

  const adminQuickLinks = [
    { label: "Admin tournois", desc: "Valider les demandes", to: "/admin/tournaments", icon: <UserCircleIcon className="size-5" /> },
    { label: "Tournois publics", desc: "Voir les tournois acceptés", to: "/tournaments", icon: <ShootingStarIcon className="size-5" /> },
    { label: "Matchs", desc: "Suivre les résultats", to: "/matches", icon: <TableIcon className="size-5" /> },
    { label: "Classements", desc: "Contrôler les points", to: "/rankings", icon: <PieChartIcon className="size-5" /> },
  ];

  return (
    <>
      <XPageMeta title="Dashboard" description="Gestion des tournois locaux" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 xl:grid-cols-4", GRID_GAP)}>
          <ComponentCard title={isAdmin ? "Dashboard admin" : "Mon dashboard"} desc={user ? `${user.email} - ${user.role}` : "Compte connecté"}>
            <div className={clsx("rounded-md border p-4", t.card)}>
              <div className="flex items-center gap-3">
                <EntityImage src={user?.avatar_url} name={user?.name ?? "Compte"} className="h-12 w-12 shrink-0 rounded-md" />
                <div className="min-w-0">
                  <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{isAdmin ? "Validation" : "Organisation"}</p>
                  <p className={clsx("mt-1 truncate text-lg font-semibold", t.textPrimary)}>{user?.name}</p>
                  <p className={clsx("text-sm", t.textSecondary)}>
                    {isAdmin ? "Priorité aux tournois à valider." : "Suivi de vos tournois, équipes et matchs."}
                  </p>
                </div>
              </div>
            </div>
            {isAdmin && (
              <Link to="/dashboard" className="mt-4 inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
                Créer un tournoi reste possible via votre compte.
              </Link>
            )}
          </ComponentCard>

          {isAdmin ? (
            <>
              <MetricCard label="En attente" value={allTournaments.filter((item) => item.approval_status === "pending").length} tone="text-amber-400" />
              <MetricCard label="Acceptés" value={allTournaments.filter((item) => item.approval_status === "accepted").length} tone="text-emerald-400" />
              <MetricCard label="Refusés" value={allTournaments.filter((item) => item.approval_status === "refused").length} tone="text-red-300" />
            </>
          ) : (
            <>
              <MetricCard label="Mes tournois" value={myTournaments.length} tone="text-brand-400" />
              <MetricCard label="Mes équipes" value={myTeams.length} tone="text-cyan-400" />
              <MetricCard label="Mes joueurs" value={playersCount} tone="text-indigo-400" />
            </>
          )}
        </div>

        {error && (
          <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Statut des tournois" desc="Répartition actuelle">
            {loading ? <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p> : <HorizontalBars items={tournamentStatusItems} />}
          </ComponentCard>
          <ComponentCard title="Statut des matchs" desc="Planifiés et joués">
            {loading ? <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p> : <HorizontalBars items={matchStatusItems} />}
          </ComponentCard>
          <ComponentCard title="Statut des résultats" desc="Validation des scores">
            {loading ? <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p> : <HorizontalBars items={resultStatusItems} />}
          </ComponentCard>
        </div>

        <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Points du classement" desc="Premier tournoi disponible">
            <RankingBars rankings={rankings} />
          </ComponentCard>

          <ComponentCard title="Tableau du tournoi" desc="Bracket simplifié depuis les matchs" className="xl:col-span-2">
            <TournamentBracket matches={relatedMatches} teams={teams} />
          </ComponentCard>
        </div>

        {isAdmin ? (
          <ComponentCard title="Tournois à valider" desc="Dernières demandes en attente">
            {allTournaments.filter((item) => item.approval_status === "pending").length === 0 ? (
              <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucune demande en attente.</p>
            ) : (
              <div className="space-y-3">
                {allTournaments.filter((item) => item.approval_status === "pending").slice(0, 5).map((tournament) => (
                  <div key={tournament.id} className={clsx("flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between", t.card)}>
                    <div>
                      <p className={clsx("font-semibold", t.textPrimary)}>{tournament.name}</p>
                      <p className={clsx("text-sm", t.textSecondary)}>{tournament.city || "-"} - {formatDate(tournament.start_date)}</p>
                    </div>
                    <Link to="/admin/tournaments" className="text-sm font-medium text-brand-500 hover:text-brand-400">
                      Ouvrir la validation
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </ComponentCard>
        ) : (
          <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
            <ComponentCard title="Créer un tournoi" desc="Validation admin requise" className="xl:col-span-2">
              <form onSubmit={handleCreateTournament} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label htmlFor="dashboard-tournament-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
                  <input id="dashboard-tournament-name" name="name" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div>
                  <label htmlFor="dashboard-tournament-city" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
                  <input id="dashboard-tournament-city" name="city" value={form.city} onChange={(e) => updateForm("city", e.target.value)} disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div>
                  <label htmlFor="dashboard-tournament-location" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Lieu</label>
                  <input id="dashboard-tournament-location" name="location" value={form.location} onChange={(e) => updateForm("location", e.target.value)} disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div>
                  <label htmlFor="dashboard-tournament-description" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Description</label>
                  <input id="dashboard-tournament-description" name="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div className="lg:col-span-2">
                  <label htmlFor="dashboard-tournament-banner" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Image du tournoi</label>
                  <input id="dashboard-tournament-banner" name="banner_path" value={form.banner_path} onChange={(e) => updateForm("banner_path", e.target.value)} placeholder="https://..." disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div>
                  <label htmlFor="dashboard-tournament-start-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date début *</label>
                  <input id="dashboard-tournament-start-date" name="start_date" type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} required disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div>
                  <label htmlFor="dashboard-tournament-end-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date fin *</label>
                  <input id="dashboard-tournament-end-date" name="end_date" type="date" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} required disabled={submitting} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
                </div>
                <div className="lg:col-span-2">
                  {success && <div className="mb-3 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}
                  <Button type="submit" disabled={submitting}>{submitting ? "Création..." : "Créer le tournoi"}</Button>
                </div>
              </form>
            </ComponentCard>

            <ComponentCard title="Activité" desc="Demandes et matchs">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Demandes" value={relatedRequests.length} tone="text-teal-400" />
                <MetricCard label="Matchs" value={relatedMatches.length} tone="text-rose-400" />
                <MetricCard label="Confirmés" value={relatedMatches.filter((match) => match.result_status === "confirmed").length} tone="text-emerald-400" />
                <MetricCard label="En attente" value={relatedRequests.filter((request) => request.status === "pending").length} tone="text-amber-400" />
              </div>
            </ComponentCard>
          </div>
        )}

        <ComponentCard title="Accès rapides" desc={isAdmin ? "Actions d'administration" : "Votre espace de gestion"}>
          <div className={clsx("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4", GRID_GAP)}>
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
