import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createTournament,
  getMyTournaments,
  type CreateTournamentPayload,
  type MyTournament,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import ProgressLine from "../../components/common/ProgressLine";
import TournamentMetrics from "../../components/widgets/TournamentMetrics";
import GoalsLineChart from "../../components/charts/GoalsLineChart";
import MatchBarChart from "../../components/charts/MatchBarChart";
import RecentMatchesTable from "../../components/widgets/RecentMatchesTable";
import TopScorersCard from "../../components/widgets/TopScorersCard";
import RankingPreviewTable from "../../components/widgets/RankingPreviewTable";
import {
  ChampionshipPreviewList,
  TournamentPreviewList,
} from "../../components/widgets/CompetitionPreviewList";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useSeasonData } from "../../components/context/SeasonContext";
import { useAuth } from "../../context/AuthContext";

const SEASON_PROGRESS = 68;
const MATCHDAYS_PLAYED = 22;
const MATCHDAYS_TOTAL = 30;
const RECENT_MATCHES_LIMIT = 4;

const emptyForm: CreateTournamentPayload = {
  name: "",
  description: "",
  city: "",
  location: "",
  start_date: "",
  end_date: "",
};

function formatTournamentDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SmallStatus({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  const normalized = value ?? "-";
  const positive = ["accepted", "open", "active", "approved"].includes(normalized);
  const pending = ["pending", "draft", "upcoming"].includes(normalized);
  const refused = ["refused", "rejected", "cancelled"].includes(normalized);

  return (
    <span
      className={clsx(
        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium capitalize",
        positive && "bg-emerald-500/15 text-emerald-400",
        pending && "bg-amber-500/15 text-amber-400",
        refused && "bg-red-500/15 text-red-300",
        !positive && !pending && !refused && clsx(t.metricBg, t.textSecondary),
      )}
    >
      {normalized}
    </span>
  );
}

export default function DashboardPage() {
  const t = useThemeTokens();
  const { matches, season } = useSeasonData();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [myTournamentsLoading, setMyTournamentsLoading] = useState(false);
  const [myTournamentsError, setMyTournamentsError] = useState("");
  const [form, setForm] = useState<CreateTournamentPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
      ),
    [matches]
  );

  const hasMoreMatches = sortedMatches.length > RECENT_MATCHES_LIMIT;
  const completedCount = matches.filter((m) => m.status === "completed").length;
  const scheduledCount = matches.filter((m) => m.status === "scheduled").length;
  const seasonLabel = season.name.replace("Saison ", "");

  const loadMyTournaments = async () => {
    if (!isAuthenticated) return;

    setMyTournamentsLoading(true);
    setMyTournamentsError("");

    try {
      const data = await getMyTournaments();
      setMyTournaments(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setMyTournamentsError("Your session has expired. Please log in again.");
      } else {
        setMyTournamentsError(err instanceof Error ? err.message : "Unable to load your tournaments.");
      }
    } finally {
      setMyTournamentsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadMyTournaments();
    }
    if (!authLoading && !isAuthenticated) {
      setMyTournaments([]);
    }
  }, [authLoading, isAuthenticated]);

  const updateForm = (key: keyof CreateTournamentPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreateTournament = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setMyTournamentsError("");

    try {
      await createTournament({
        name: form.name,
        description: form.description?.trim() || undefined,
        city: form.city?.trim() || undefined,
        location: form.location?.trim() || undefined,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      setSuccess("Tournament created and sent for approval.");
      setForm(emptyForm);
      await loadMyTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setMyTournamentsError("Your session has expired. Please log in again.");
      } else {
        setMyTournamentsError(err instanceof Error ? err.message : "Unable to create tournament.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <XPageMeta title="Dashboard" description="Vue generale de l'application" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
          <ComponentCard
            title="Mon espace"
            desc={user ? `${user.email} - ${user.role}` : "Connexion requise"}
          >
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className={clsx("rounded-md border p-4", t.card)}>
                  <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Utilisateur</p>
                  <p className={clsx("mt-1 text-lg font-semibold", t.textPrimary)}>{user?.name}</p>
                  <p className={clsx("text-sm", t.textSecondary)}>{user?.email}</p>
                </div>
                <div className={clsx("grid grid-cols-2 gap-3 border-t pt-4", t.border)}>
                  <div className={clsx("rounded-md px-3 py-3 text-center", t.metricBg)}>
                    <p className="text-lg font-bold tabular-nums text-brand-400">{myTournaments.length}</p>
                    <p className={clsx("mt-0.5 text-xs", t.textMuted)}>Crees</p>
                  </div>
                  <div className={clsx("rounded-md px-3 py-3 text-center", t.metricBg)}>
                    <p className="text-lg font-bold tabular-nums text-amber-400">
                      {myTournaments.filter((tr) => tr.approval_status === "pending").length}
                    </p>
                    <p className={clsx("mt-0.5 text-xs", t.textMuted)}>En attente</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className={clsx("text-sm", t.textSecondary)}>
                  Connectez-vous pour creer et suivre vos tournois.
                </p>
                <Link to="/login" className="inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
                  Aller a la connexion
                </Link>
              </div>
            )}
          </ComponentCard>

          <ComponentCard title="Creer un tournoi" desc="Validation admin requise" className="xl:col-span-2">
            <form onSubmit={handleCreateTournament} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                  disabled={!isAuthenticated || submitting}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
                <input
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  disabled={!isAuthenticated || submitting}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Lieu</label>
                <input
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  disabled={!isAuthenticated || submitting}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  disabled={!isAuthenticated || submitting}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date debut *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateForm("start_date", e.target.value)}
                  required
                  disabled={!isAuthenticated || submitting}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date fin *</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => updateForm("end_date", e.target.value)}
                  required
                  disabled={!isAuthenticated || submitting}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>
              <div className="lg:col-span-2">
                {success && (
                  <div className="mb-3 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {success}
                  </div>
                )}
                {myTournamentsError && (
                  <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {myTournamentsError}
                  </div>
                )}
                <Button type="submit" disabled={!isAuthenticated || submitting}>
                  {submitting ? "Creation..." : "Creer le tournoi"}
                </Button>
              </div>
            </form>
          </ComponentCard>
        </div>

        <ComponentCard title="Mes tournois" desc="Tournois crees avec votre compte">
          {myTournamentsLoading && (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement de vos tournois...</p>
          )}

          {!myTournamentsLoading && !myTournamentsError && myTournaments.length === 0 && (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>
              You have not created any tournaments yet.
            </p>
          )}

          {!myTournamentsLoading && myTournaments.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[960px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[20%]" />
                  <col className="w-[13%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[11%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Lieu</th>
                    <th className="px-4 py-3">Debut</th>
                    <th className="px-4 py-3">Fin</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Validation</th>
                    <th className="px-4 py-3">Note admin</th>
                  </tr>
                </thead>
                <tbody>
                  {myTournaments.map((tr) => (
                    <tr key={tr.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{tr.id}</td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>{tr.name}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{tr.city || "-"}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={tr.location ?? ""}>{tr.location || "-"}</span>
                      </td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatTournamentDate(tr.start_date)}</td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatTournamentDate(tr.end_date)}</td>
                      <td className="px-4 py-3"><SmallStatus value={tr.status} /></td>
                      <td className="px-4 py-3"><SmallStatus value={tr.approval_status} /></td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={tr.admin_note ?? ""}>{tr.admin_note || "-"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>

        <TournamentMetrics />

        <div className={clsx("grid grid-cols-12 items-stretch", GRID_GAP)}>
          <div className="col-span-12 flex xl:col-span-8">
            <ComponentCard
              fill
              title="Statistiques de la saison"
              desc="Buts marques vs encaisses par mois"
            >
              <GoalsLineChart />
            </ComponentCard>
          </div>

          <div className="col-span-12 flex xl:col-span-4">
            <ComponentCard
              fill
              title="Meilleurs buteurs"
              desc="Top 5 de la saison"
              action={
                <Link to="/players" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                  Voir plus
                </Link>
              }
            >
              <TopScorersCard fill />
            </ComponentCard>
          </div>

          <div className="col-span-12 flex xl:col-span-8">
            <ComponentCard
              fill
              title="Derniers matchs"
              desc="Resultats recents"
              action={
                hasMoreMatches ? (
                  <Link to="/matches" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                    Voir plus
                  </Link>
                ) : undefined
              }
            >
              <RecentMatchesTable limit={RECENT_MATCHES_LIMIT} fill />
            </ComponentCard>
          </div>

          <div className="col-span-12 flex xl:col-span-4">
            <ComponentCard fill title="Progression" desc={seasonLabel}>
              <div className="flex flex-1 flex-col justify-between gap-5">
                <ProgressLine
                  value={SEASON_PROGRESS}
                  label="Saison completee"
                  sublabel={`${MATCHDAYS_PLAYED} / ${MATCHDAYS_TOTAL} journees jouees`}
                />
                <div className={clsx("grid grid-cols-2 gap-3 border-t pt-4", t.border)}>
                  <div className={clsx("rounded-md px-3 py-3 text-center", t.metricBg)}>
                    <p className="text-lg font-bold tabular-nums text-emerald-400">{completedCount}</p>
                    <p className={clsx("mt-0.5 text-xs", t.textMuted)}>Matchs joues</p>
                  </div>
                  <div className={clsx("rounded-md px-3 py-3 text-center", t.metricBg)}>
                    <p className="text-lg font-bold tabular-nums text-brand-400">{scheduledCount}</p>
                    <p className={clsx("mt-0.5 text-xs", t.textMuted)}>A venir</p>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>

        <ComponentCard
          title="Classement"
          desc={`Top 10 - ${seasonLabel}`}
          action={
            <Link to="/rankings" className="text-xs font-medium text-brand-500 hover:text-brand-400">
              Voir plus
            </Link>
          }
        >
          <RankingPreviewTable limit={10} />
        </ComponentCard>

        <ComponentCard title="Forme des equipes" desc="Victoires / Nuls / Defaites">
          <MatchBarChart fullWidth embedded />
        </ComponentCard>

        <div className={clsx("grid grid-cols-1 items-stretch lg:grid-cols-2", GRID_GAP)}>
          <ComponentCard
            title="Championnats"
            desc={seasonLabel}
            action={
              <Link to="/championships" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                Voir plus
              </Link>
            }
          >
            <ChampionshipPreviewList />
          </ComponentCard>

          <ComponentCard
            title="Tournois"
            desc={seasonLabel}
            action={
              <Link to="/tournaments" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                Voir plus
              </Link>
            }
          >
            <TournamentPreviewList />
          </ComponentCard>
        </div>
      </PageStack>
    </>
  );
}
