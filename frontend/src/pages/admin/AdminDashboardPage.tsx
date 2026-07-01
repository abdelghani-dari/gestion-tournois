import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  getAdminJoinRequests,
  getAdminMatches,
  getDashboardSummary,
  getPendingUsers,
  type ApiMatch,
  type ApiRanking,
  type DashboardSummary,
  type JoinRequest,
} from "../../api";
import EntityImage from "../../components/common/EntityImage";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  GridIcon,
  PaperPlaneIcon,
  PieChartIcon,
  ShootingStarIcon,
  TableIcon,
  TimeIcon,
  UserCircleIcon,
} from "../../icons";

type DonutItem = {
  label: string;
  value: number;
  color: string;
  textColor: string;
};

const quickLinks = [
  { title: "Tournois à valider", description: "Traiter les demandes", path: "/admin/tournaments/pending", icon: CheckCircleIcon, tone: "bg-emerald-500/10 text-emerald-300" },
  { title: "Tous les tournois", description: "Superviser les compétitions", path: "/admin/tournaments", icon: ShootingStarIcon, tone: "bg-cyan-500/10 text-cyan-300" },
  { title: "Matchs", description: "Suivre le calendrier", path: "/admin/matches", icon: TableIcon, tone: "bg-amber-500/10 text-amber-300" },
  { title: "Statistiques", description: "Consulter les données", path: "/statistics", icon: PieChartIcon, tone: "bg-purple-500/10 text-purple-300" },
] as const;

function sumStatus(statuses: Record<string, number> | undefined, keys: string[]) {
  return keys.reduce((total, key) => total + (statuses?.[key] ?? 0), 0);
}

function formatDate(value?: string | null) {
  return value
    ? new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "-";
}

function SectionTitle({ children, suffix }: { children: string; suffix?: string }) {
  const t = useThemeTokens();
  return (
    <div className="flex items-center gap-3">
      <h2 className={clsx("whitespace-nowrap text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{children}</h2>
      <div className={clsx("h-px flex-1", t.metricBg)} />
      {suffix && <span className={clsx("text-xs", t.textMuted)}>{suffix}</span>}
    </div>
  );
}

function DashboardCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const t = useThemeTokens();
  return <div className={clsx("rounded-md border p-5", t.card, className)}>{children}</div>;
}

function StatCard({ label, value, tone, icon: Icon }: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const styles = {
    green: "border-t-2 border-t-emerald-400 text-emerald-400",
    amber: "border-t-2 border-t-amber-400 text-amber-400",
    red: "border-t-2 border-t-red-400 text-red-400",
  };
  const iconStyles = {
    green: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
    red: "bg-red-500/10",
  };

  return (
    <DashboardCard className={clsx("flex min-h-28 items-start justify-between", styles[tone])}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-4xl font-bold tabular-nums">{value}</p>
      </div>
      <span className={clsx("flex h-10 w-10 items-center justify-center rounded-md", iconStyles[tone])}>
        <Icon className="size-5" />
      </span>
    </DashboardCard>
  );
}

function DonutChart({ title, subtitle, centerLabel, items }: {
  title: string;
  subtitle: string;
  centerLabel: string;
  items: DonutItem[];
}) {
  const t = useThemeTokens();
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <DashboardCard>
      <h3 className={clsx("text-sm font-semibold uppercase", t.textPrimary)}>{title}</h3>
      <p className={clsx("mt-1 text-xs", t.textMuted)}>{subtitle}</p>
      <div className="relative mx-auto mt-5 h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-label={`${total} ${centerLabel}`}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="14" className="text-white/[0.04]" />
          {total > 0 && items.map((item) => {
            const length = (item.value / total) * circumference;
            const circle = (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="14"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx("text-3xl font-bold tabular-nums", t.textPrimary)}>{total}</span>
          <span className={clsx("text-[10px] uppercase tracking-wider", t.textMuted)}>{centerLabel}</span>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className={t.textSecondary}>{item.label}</span>
            <span className={clsx("ml-auto font-semibold tabular-nums", item.textColor)}>{item.value}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function activitySeries(matches: ApiMatch[], requests: JoinRequest[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = dayKey(date);
    return {
      label: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
      matches: matches.filter((match) => match.status === "played" && match.match_date?.slice(0, 10) === key).length,
      requests: requests.filter((request) => request.created_at?.slice(0, 10) === key).length,
    };
  });
}

function MiniLineChart({ matches, requests }: { matches: ApiMatch[]; requests: JoinRequest[] }) {
  const t = useThemeTokens();
  const data = useMemo(() => activitySeries(matches, requests), [matches, requests]);
  const max = Math.max(1, ...data.flatMap((item) => [item.matches, item.requests]));
  const points = (key: "matches" | "requests") =>
    data.map((item, index) => `${8 + index * 14},${54 - (item[key] / max) * 42}`).join(" ");

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={clsx("text-sm font-semibold uppercase", t.textPrimary)}>Activité — 7 derniers jours</h3>
          <p className={clsx("mt-1 text-xs", t.textMuted)}>Activité enregistrée par jour</p>
        </div>
        <div className={clsx("flex gap-4 text-xs", t.textSecondary)}>
          <span className="flex items-center gap-2"><i className="h-1.5 w-5 rounded-full bg-emerald-400" />Matchs joués</span>
          <span className="flex items-center gap-2"><i className="h-1.5 w-5 rounded-full bg-cyan-400" />Demandes</span>
        </div>
      </div>
      <svg viewBox="0 0 100 68" preserveAspectRatio="none" className="mt-4 h-36 w-full" aria-label="Activité des sept derniers jours">
        {[12, 26, 40, 54].map((y) => <line key={y} x1="8" x2="92" y1={y} y2={y} stroke="currentColor" strokeWidth=".3" className="text-white/10" />)}
        <polyline points={points("matches")} fill="none" stroke="#34d399" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <polyline points={points("requests")} fill="none" stroke="#22d3ee" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={clsx("grid grid-cols-7 text-center text-[10px] uppercase", t.textMuted)}>
        {data.map((item) => <span key={item.label}>{item.label}</span>)}
      </div>
    </DashboardCard>
  );
}

function RankingPreview({ rankings }: { rankings: ApiRanking[] }) {
  const t = useThemeTokens();
  const max = Math.max(1, ...rankings.map((ranking) => ranking.points));

  return (
    <DashboardCard className="h-full">
      <h3 className={clsx("text-sm font-semibold uppercase", t.textPrimary)}>Classement</h3>
      <p className={clsx("mt-1 text-xs", t.textMuted)}>Points — premier tournoi</p>
      {rankings.length === 0 ? (
        <p className={clsx("py-12 text-center text-sm", t.textMuted)}>Aucun classement disponible.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {rankings.slice(0, 5).map((ranking) => (
            <div key={ranking.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className={clsx("truncate", t.textSecondary)}>{ranking.team?.name ?? `Équipe #${ranking.team_id}`}</span>
                <span className={clsx("font-semibold tabular-nums", t.textPrimary)}>{ranking.points} pts</span>
              </div>
              <div className={clsx("h-2 overflow-hidden rounded-sm", t.metricBg)}>
                <div className="h-full rounded-sm bg-emerald-400" style={{ width: `${Math.max(8, (ranking.points / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/rankings" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300">
        Classement complet <ArrowRightIcon className="size-4" />
      </Link>
    </DashboardCard>
  );
}

function MatchPreview({ matches }: { matches: ApiMatch[] }) {
  const t = useThemeTokens();

  return (
    <DashboardCard className="h-full">
      <h3 className={clsx("text-sm font-semibold uppercase", t.textPrimary)}>Tableau du tournoi</h3>
      <p className={clsx("mt-1 text-xs", t.textMuted)}>Derniers matchs</p>
      {matches.length === 0 ? (
        <p className={clsx("py-12 text-center text-sm", t.textMuted)}>Aucun match disponible.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {matches.slice(0, 2).map((match) => {
            const home = match.home_team ?? match.homeTeam;
            const away = match.away_team ?? match.awayTeam;
            return (
              <div key={match.id} className={clsx("overflow-hidden rounded-md border", t.border, t.metricBg)}>
                <div className={clsx("flex items-center justify-between border-b px-3 py-2", t.border)}>
                  <span className={clsx("text-xs font-semibold uppercase", t.textMuted)}>Match #{match.id}</span>
                  <span className={clsx("rounded-sm px-2 py-1 text-[10px] font-semibold", statusTone(match.result_status ?? match.status) || t.metricBg)}>
                    {statusLabel(match.result_status ?? match.status)}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {[
                    { team: home, score: match.home_score },
                    { team: away, score: match.away_score },
                  ].map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <EntityImage src={row.team?.logo_path} name={row.team?.name ?? "Équipe"} className="h-8 w-8 shrink-0 rounded-sm" />
                      <span className={clsx("min-w-0 flex-1 truncate text-sm font-medium", t.textPrimary)}>{row.team?.name ?? "Équipe"}</span>
                      <span className={clsx("text-lg font-bold tabular-nums", t.textPrimary)}>{row.score ?? "-"}</span>
                    </div>
                  ))}
                </div>
                <p className={clsx("border-t px-3 py-2 text-xs", t.border, t.textMuted)}>{formatDate(match.match_date)}</p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}

export default function AdminDashboardPage() {
  const t = useThemeTokens();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    const [summaryResult, matchesResult, requestsResult, usersResult] = await Promise.allSettled([
      getDashboardSummary(),
      getAdminMatches(),
      getAdminJoinRequests(),
      getPendingUsers(),
    ]);
    setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);
    setMatches(matchesResult.status === "fulfilled" ? matchesResult.value : []);
    setRequests(requestsResult.status === "fulfilled" ? requestsResult.value : []);
    setPendingUsers(usersResult.status === "fulfilled" ? usersResult.value.length : 0);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadDashboard(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, loadDashboard]);

  const tournamentItems: DonutItem[] = [
    { label: "Acceptés", value: sumStatus(summary?.tournament_status, ["accepted"]), color: "#34d399", textColor: "text-emerald-400" },
    { label: "En attente", value: sumStatus(summary?.tournament_status, ["pending"]), color: "#fbbf24", textColor: "text-amber-400" },
    { label: "Refusés", value: sumStatus(summary?.tournament_status, ["refused"]), color: "#f87171", textColor: "text-red-400" },
  ];
  const matchItems: DonutItem[] = [
    { label: "Planifiés", value: sumStatus(summary?.match_status, ["scheduled", "planned"]), color: "#22d3ee", textColor: "text-cyan-400" },
    { label: "Joués", value: sumStatus(summary?.match_status, ["played"]), color: "#34d399", textColor: "text-emerald-400" },
    { label: "Annulés", value: sumStatus(summary?.match_status, ["cancelled", "canceled"]), color: "#f87171", textColor: "text-red-400" },
  ];
  const resultItems: DonutItem[] = [
    { label: "En attente", value: sumStatus(summary?.result_status, ["pending"]), color: "#fbbf24", textColor: "text-amber-400" },
    { label: "Confirmés", value: sumStatus(summary?.result_status, ["confirmed"]), color: "#34d399", textColor: "text-emerald-400" },
    { label: "Contestés", value: sumStatus(summary?.result_status, ["disputed"]), color: "#f87171", textColor: "text-red-400" },
  ];
  const latestMatches = matches.length > 0 ? matches : summary?.match_preview ?? [];
  const pendingTournaments = summary?.pending_tournaments ?? [];

  return (
    <>
      <XPageMeta title="Admin" description="Vue d'ensemble des tournois locaux" />
      <PageStack>
        {!isAdmin ? (
          <DashboardCard>
            <p className="text-sm text-amber-300">Accès administrateur requis.</p>
          </DashboardCard>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <DashboardCard className="border-t-2 border-t-purple-400 xl:col-span-1">
                <div className="flex h-full min-h-28 items-center gap-4">
                  <EntityImage src={user?.avatar_url} name={user?.name ?? "Admin Principal"} className="h-14 w-14 shrink-0 rounded-md" />
                  <div className="min-w-0">
                    <p className={clsx("truncate text-base font-semibold", t.textPrimary)}>{user?.name ?? "Admin Principal"}</p>
                    <p className={clsx("truncate text-xs", t.textMuted)}>{user?.email}</p>
                    <span className="mt-2 inline-flex rounded-sm bg-purple-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                      Validation active
                    </span>
                  </div>
                </div>
              </DashboardCard>
              <StatCard label="Acceptés" value={tournamentItems[0].value} tone="green" icon={CheckCircleIcon} />
              <StatCard label="En attente" value={tournamentItems[1].value} tone="amber" icon={TimeIcon} />
              <StatCard label="Refusés" value={tournamentItems[2].value} tone="red" icon={GridIcon} />
            </div>

            <SectionTitle suffix={loading ? "Chargement..." : "Temps réel"}>Statut général</SectionTitle>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <DonutChart title="Tournois" subtitle="Répartition actuelle" centerLabel="tournois" items={tournamentItems} />
              <DonutChart title="Matchs" subtitle="Planifiés et joués" centerLabel="matchs" items={matchItems} />
              <DonutChart title="Résultats" subtitle="Validation des scores" centerLabel="résultats" items={resultItems} />
            </div>

            <MiniLineChart matches={matches} requests={requests} />

            <SectionTitle>Compétition en cours</SectionTitle>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
              <RankingPreview rankings={summary?.ranking_preview ?? []} />
              <MatchPreview matches={latestMatches} />
            </div>

            <SectionTitle suffix="Dernières demandes">Tournois à valider</SectionTitle>
            <DashboardCard>
              {pendingTournaments.length === 0 ? (
                <div className="py-8 text-center">
                  <ShootingStarIcon className={clsx("mx-auto size-8", t.textMuted)} />
                  <p className={clsx("mt-3 text-sm font-medium", t.textSecondary)}>Aucun tournoi en attente</p>
                  <p className={clsx("mt-1 text-xs", t.textMuted)}>Toutes les demandes ont été traitées.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {pendingTournaments.map((tournament) => (
                    <div key={tournament.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className={clsx("truncate text-sm font-semibold", t.textPrimary)}>{tournament.name}</p>
                        <p className={clsx("mt-1 text-xs", t.textMuted)}>{tournament.city || "Ville non renseignée"} · {formatDate(tournament.start_date)}</p>
                      </div>
                      <Link to="/admin/tournaments/pending" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">Examiner</Link>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>

            <SectionTitle>Accès rapides</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map(({ icon: Icon, ...item }) => (
                <Link key={item.path} to={item.path} className={clsx("group flex items-center gap-4 rounded-md border p-4 transition-colors", t.card, t.cardHover)}>
                  <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", item.tone)}>
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className={clsx("block truncate text-sm font-semibold", t.textPrimary)}>{item.title}</span>
                    <span className={clsx("mt-1 block text-xs", t.textMuted)}>{item.description}</span>
                  </span>
                  <ArrowRightIcon className={clsx("ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5", t.textMuted)} />
                </Link>
              ))}
            </div>

            <Link to="/admin/users/pending" className={clsx("flex items-center gap-3 rounded-md border px-4 py-3 text-sm", t.card, t.cardHover)}>
              <UserCircleIcon className="size-5 text-purple-300" />
              <span className={t.textSecondary}>Comptes utilisateurs en attente</span>
              <span className="ml-auto rounded-sm bg-purple-500/10 px-2.5 py-1 font-semibold text-purple-300">{pendingUsers}</span>
              <PaperPlaneIcon className={clsx("size-4", t.textMuted)} />
            </Link>
          </>
        )}
      </PageStack>
    </>
  );
}
