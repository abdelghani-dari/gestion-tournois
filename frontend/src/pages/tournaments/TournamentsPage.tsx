import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { Link } from "react-router";
import {
  ApiError,
  deleteTournament,
  generateTournamentBracket,
  getMyTournaments,
  getPublicTournaments,
  type MyTournament,
  type PublicTournament,
} from "../../api";
import Button from "../../components/common/Button";
import EntityImage from "../../components/common/EntityImage";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import PaginationControls, { usePagination } from "../../components/common/PaginationControls";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { PaperPlaneIcon, PlusIcon, ShootingStarIcon } from "../../icons";

type TournamentTab = "all" | "mine" | "open" | "knockout" | "league";
type FormatFilter = "all" | "league" | "knockout";
type StatusFilter = "all" | "open" | "active" | "finished";

type TournamentCardItem = PublicTournament & {
  isMine: boolean;
  isPublic: boolean;
};

const PAGE_SIZE_OPTIONS = [6, 12, 24];

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(tournament: PublicTournament) {
  if (!tournament.start_date && !tournament.end_date) return "Dates à confirmer";
  if (tournament.start_date && tournament.end_date) {
    return `${formatDate(tournament.start_date)} - ${formatDate(tournament.end_date)}`;
  }
  return tournament.start_date ? `À partir du ${formatDate(tournament.start_date)}` : `Jusqu'au ${formatDate(tournament.end_date)}`;
}

function normalizeStatus(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isAccepted(tournament: PublicTournament) {
  const approval = normalizeStatus(tournament.approval_status);
  return !approval || ["accepted", "approved"].includes(approval);
}

function isOpenForRequests(tournament: PublicTournament) {
  return ["open", "active"].includes(normalizeStatus(tournament.status));
}

function isKnockout(tournament: PublicTournament) {
  return tournament.format === "knockout";
}

function isLeague(tournament: PublicTournament) {
  return !tournament.format || tournament.format === "league";
}

function formatLabel(tournament: PublicTournament) {
  return isKnockout(tournament) ? "Knockout" : "Ligue";
}

function tournamentLocation(tournament: PublicTournament) {
  if (tournament.city && tournament.location) return `${tournament.city} - ${tournament.location}`;
  return tournament.city || tournament.location || "Lieu à confirmer";
}

function tournamentTeamCount(tournament: PublicTournament) {
  const withCounts = tournament as PublicTournament & {
    teams_count?: number;
    team_count?: number;
    participants_count?: number;
  };

  return withCounts.teams_count ?? withCounts.team_count ?? withCounts.participants_count ?? tournament.teams?.length ?? null;
}

function creatorLabel(tournament: PublicTournament) {
  const creator = tournament.creator ?? tournament.user ?? tournament.created_by_user;
  if (!creator) return "Organisateur non renseigné";
  return creator.name ?? creator.email ?? "Organisateur non renseigné";
}

function tournamentStatusLabel(value?: string | null) {
  const normalized = normalizeStatus(value);
  if (normalized === "finished") return "Terminé";
  return statusLabel(value);
}

function tournamentStatusTone(value?: string | null) {
  const normalized = normalizeStatus(value);
  if (normalized === "finished") return "bg-emerald-500/15 text-emerald-400";
  return statusTone(value);
}

function mergeTournaments(
  publicTournaments: PublicTournament[],
  myTournaments: MyTournament[],
  userId?: number,
) {
  const myIds = new Set(myTournaments.map((tournament) => tournament.id));
  const byId = new Map<number, TournamentCardItem>();

  for (const tournament of publicTournaments) {
    byId.set(tournament.id, {
      ...tournament,
      isMine: myIds.has(tournament.id) || (userId != null && Number(tournament.created_by) === Number(userId)),
      isPublic: true,
    });
  }

  for (const tournament of myTournaments) {
    byId.set(tournament.id, {
      ...(byId.get(tournament.id) ?? {}),
      ...tournament,
      isMine: true,
      isPublic: byId.get(tournament.id)?.isPublic ?? isAccepted(tournament),
    });
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aDate = new Date(a.start_date ?? a.end_date ?? 0).getTime();
    const bDate = new Date(b.start_date ?? b.end_date ?? 0).getTime();
    return bDate - aDate;
  });
}

function matchesStatusFilter(tournament: PublicTournament, statusFilter: StatusFilter) {
  const status = normalizeStatus(tournament.status);
  if (statusFilter === "all") return true;
  if (statusFilter === "finished") return ["finished", "completed"].includes(status);
  return status === statusFilter;
}

function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

function StatusBadge({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  return (
    <Badge className={tournamentStatusTone(value) || clsx(t.metricBg, t.textSecondary)}>
      {tournamentStatusLabel(value)}
    </Badge>
  );
}

function ApprovalBadge({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  return (
    <Badge className={statusTone(value) || clsx(t.metricBg, t.textSecondary)}>
      {statusLabel(value)}
    </Badge>
  );
}

function ActionLink({
  to,
  children,
  variant = "secondary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const t = useThemeTokens();
  const variants = {
    primary: "border-brand-500/50 bg-brand-500 text-white hover:bg-brand-600",
    secondary: t.btnSecondary,
    ghost: clsx(t.textMuted, "border border-transparent hover:bg-white/[0.04] hover:text-white"),
  };

  return (
    <Link
      to={to}
      className={clsx(
        "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
        variants[variant],
      )}
    >
      {children}
    </Link>
  );
}

function TournamentCard({
  tournament,
  canManage,
  deletingId,
  generatingId,
  onDelete,
  onGenerateBracket,
}: {
  tournament: TournamentCardItem;
  canManage: boolean;
  deletingId: number | null;
  generatingId: number | null;
  onDelete: (tournament: TournamentCardItem) => void;
  onGenerateBracket: (tournament: TournamentCardItem) => void;
}) {
  const t = useThemeTokens();
  const teamCount = tournamentTeamCount(tournament);
  const canGenerateBracket = canManage && isKnockout(tournament) && isAccepted(tournament);

  return (
    <article className={clsx("group flex min-h-full flex-col overflow-hidden rounded-md border", t.card)}>
      <div className="relative h-40 overflow-hidden border-b border-white/[0.06]">
        <EntityImage
          src={tournament.banner_path}
          name={tournament.name}
          className="h-full w-full border-0 bg-slate-800 text-slate-300"
          imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent px-4 pb-3 pt-12">
          <Badge className={isKnockout(tournament) ? "bg-cyan-500/15 text-cyan-300" : "bg-lime-500/15 text-lime-300"}>
            {formatLabel(tournament)}
          </Badge>
          <StatusBadge value={tournament.status} />
          {tournament.isMine && <Badge className="bg-brand-500/15 text-brand-300">À vous</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="min-w-0">
          <h2 className={clsx("truncate text-lg font-semibold", t.textPrimary)} title={tournament.name}>
            {tournament.name}
          </h2>
          <p className={clsx("mt-1 line-clamp-2 min-h-10 text-sm", t.textSecondary)}>
            {tournament.description || "Tournoi public disponible pour les équipes locales."}
          </p>
        </div>

        <div className={clsx("mt-4 grid grid-cols-2 gap-3 text-sm", t.textSecondary)}>
          <div>
            <p className={clsx("text-xs uppercase tracking-wider", t.textMuted)}>Lieu</p>
            <p className={clsx("mt-1 truncate font-medium", t.textPrimary)} title={tournamentLocation(tournament)}>
              {tournamentLocation(tournament)}
            </p>
          </div>
          <div>
            <p className={clsx("text-xs uppercase tracking-wider", t.textMuted)}>Équipes</p>
            <p className={clsx("mt-1 font-medium tabular-nums", t.textPrimary)}>
              {teamCount == null ? "-" : teamCount}
            </p>
          </div>
          <div className="col-span-2">
            <p className={clsx("text-xs uppercase tracking-wider", t.textMuted)}>Dates</p>
            <p className={clsx("mt-1 font-medium", t.textPrimary)}>{formatDateRange(tournament)}</p>
          </div>
        </div>

        <div className={clsx("mt-4 flex flex-wrap items-center gap-2 border-t pt-4", t.border)}>
          <ApprovalBadge value={tournament.approval_status} />
          <Badge className={clsx(t.metricBg, t.textSecondary)}>
            {creatorLabel(tournament)}
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <ActionLink to={`/tournaments/${tournament.id}`} variant="primary">Voir détails</ActionLink>
          {isKnockout(tournament) && <ActionLink to={`/tournaments/${tournament.id}/bracket`}>Voir bracket</ActionLink>}
          <ActionLink to={`/tournaments/${tournament.id}/ranking`}>Classement</ActionLink>
          {!tournament.isMine && isOpenForRequests(tournament) && (
            <ActionLink to="/join-requests">
              <PaperPlaneIcon className="mr-1.5 size-3.5" />
              Demander participation
            </ActionLink>
          )}
        </div>

        {canManage && (
          <div className={clsx("mt-4 flex flex-wrap gap-2 border-t pt-4", t.border)}>
            <ActionLink to={`/tournaments/${tournament.id}`}>Gérer</ActionLink>
            <ActionLink to={`/tournaments/create?edit=${tournament.id}`}>Modifier</ActionLink>
            {canGenerateBracket && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={generatingId === tournament.id}
                onClick={() => onGenerateBracket(tournament)}
              >
                {generatingId === tournament.id ? "Génération..." : "Générer bracket"}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={deletingId === tournament.id}
              onClick={() => onDelete(tournament)}
            >
              {deletingId === tournament.id ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function TournamentsPage() {
  const t = useThemeTokens();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<PublicTournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [activeTab, setActiveTab] = useState<TournamentTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [publicData, myData] = await Promise.all([
        getPublicTournaments(),
        isAuthenticated ? getMyTournaments() : Promise.resolve([]),
      ]);

      setPublicTournaments(publicData.filter(isAccepted));
      setMyTournaments(myData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les tournois.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadTournaments();
  }, [loadTournaments]);

  const tournamentItems = useMemo(
    () => mergeTournaments(publicTournaments, myTournaments, user?.id),
    [publicTournaments, myTournaments, user?.id],
  );

  const tabItems = useMemo(
    () => [
      { id: "all" as const, label: "Tous les tournois", count: tournamentItems.length },
      { id: "mine" as const, label: "Mes tournois", count: myTournaments.length },
      { id: "open" as const, label: "Ouverts", count: tournamentItems.filter(isOpenForRequests).length },
      { id: "knockout" as const, label: "Knockout", count: tournamentItems.filter(isKnockout).length },
      { id: "league" as const, label: "Ligue", count: tournamentItems.filter(isLeague).length },
    ],
    [myTournaments.length, tournamentItems],
  );

  const filteredTournaments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tournamentItems
      .filter((tournament) => {
        if (activeTab === "mine" && !tournament.isMine) return false;
        if (activeTab === "open" && !isOpenForRequests(tournament)) return false;
        if (activeTab === "knockout" && !isKnockout(tournament)) return false;
        if (activeTab === "league" && !isLeague(tournament)) return false;
        return true;
      })
      .filter((tournament) => {
        if (formatFilter === "league" && !isLeague(tournament)) return false;
        if (formatFilter === "knockout" && !isKnockout(tournament)) return false;
        return matchesStatusFilter(tournament, statusFilter);
      })
      .filter((tournament) => {
        if (!query) return true;
        return [tournament.name, tournament.city ?? "", tournament.location ?? "", tournament.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [activeTab, formatFilter, searchQuery, statusFilter, tournamentItems]);

  const pagination = usePagination(
    filteredTournaments,
    `${activeTab}:${formatFilter}:${statusFilter}:${searchQuery}`,
    PAGE_SIZE_OPTIONS[0],
  );

  const visibleTournaments = pagination.paginatedItems;
  const publicOpenCount = publicTournaments.filter(isOpenForRequests).length;
  const knockoutCount = tournamentItems.filter(isKnockout).length;

  const handleDelete = async (tournament: TournamentCardItem) => {
    if (!window.confirm(`Supprimer le tournoi "${tournament.name}" ?`)) return;

    setDeletingId(tournament.id);
    setSuccess("");
    setError("");

    try {
      await deleteTournament(tournament.id);
      setSuccess("Tournoi supprimé.");
      await loadTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer vos propres tournois.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer le tournoi.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateBracket = async (tournament: TournamentCardItem) => {
    setGeneratingId(tournament.id);
    setSuccess("");
    setError("");

    try {
      await generateTournamentBracket(tournament.id);
      setSuccess("Bracket généré.");
      await loadTournaments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de générer le bracket.";
      if (message.includes("already exists") && window.confirm("Un bracket existe déjà. Régénérer le bracket non joué ?")) {
        try {
          await generateTournamentBracket(tournament.id, true);
          setSuccess("Bracket régénéré.");
          await loadTournaments();
        } catch (resetErr) {
          setError(resetErr instanceof Error ? resetErr.message : "Impossible de régénérer le bracket.");
        }
      } else {
        setError(message);
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const emptyMessage = activeTab === "mine" && myTournaments.length === 0
    ? "Vous n'avez pas encore créé de tournoi"
    : publicTournaments.length === 0 && activeTab !== "mine"
      ? "Aucun tournoi disponible"
      : "Aucun tournoi ne correspond aux filtres.";

  return (
    <>
      <XPageMeta title="Tournois" description="Découvrez les tournois disponibles et gérez vos propres tournois" />
      <PageStack>
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-400">Espace compétition</p>
            <h1 className={clsx("mt-2 text-3xl font-semibold tracking-normal", t.textPrimary)}>Tournois</h1>
            <p className={clsx("mt-2 max-w-2xl text-sm", t.textSecondary)}>
              Découvrez les tournois disponibles et gérez vos propres tournois
            </p>
          </div>
          <Link
            to="/tournaments/create"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-500/50 bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <PlusIcon className="size-4 shrink-0" />
            Créer un tournoi
          </Link>
        </section>

        <section className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4", GRID_GAP)}>
          {[
            { label: "Tournois publics", value: publicTournaments.length, tone: "text-cyan-300" },
            { label: "Mes tournois", value: myTournaments.length, tone: "text-brand-300" },
            { label: "Ouverts", value: publicOpenCount, tone: "text-emerald-300" },
            { label: "Knockout", value: knockoutCount, tone: "text-amber-300" },
          ].map((metric) => (
            <div key={metric.label} className={clsx("rounded-md border p-5", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{metric.label}</p>
              <p className={clsx("mt-2 text-3xl font-semibold tabular-nums", metric.tone)}>{metric.value}</p>
            </div>
          ))}
        </section>

        <section className={clsx("rounded-md border p-4", t.panelGlass)}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === tab.id ? t.tabActive : t.tabInactive,
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-sm bg-black/20 px-1.5 py-0.5 text-[11px] tabular-nums">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
              <FilterSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher par nom ou ville..."
                className="max-w-none sm:w-64 sm:max-w-none"
              />
              <select
                value={formatFilter}
                onChange={(event) => setFormatFilter(event.target.value as FormatFilter)}
                className={clsx("h-8 rounded-md border px-3 text-xs focus:border-brand-500/40 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="all">Tous les formats</option>
                <option value="league">Ligue</option>
                <option value="knockout">Knockout</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className={clsx("h-8 rounded-md border px-3 text-xs focus:border-brand-500/40 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              >
                <option value="all">Tous les statuts</option>
                <option value="open">Open</option>
                <option value="active">Active</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
        </section>

        {(error || success) && (
          <div
            className={clsx(
              "rounded-sm border px-4 py-3 text-sm",
              error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
            )}
          >
            {error || success}
          </div>
        )}

        {loading ? (
          <div className={clsx("rounded-md border py-16 text-center text-sm", t.card, t.textMuted)}>
            Chargement des tournois...
          </div>
        ) : visibleTournaments.length === 0 ? (
          <div className={clsx("rounded-md border py-16 text-center", t.card)}>
            <ShootingStarIcon className="mx-auto size-10 text-brand-400" />
            <p className={clsx("mt-4 text-sm font-medium", t.textPrimary)}>{emptyMessage}</p>
            {activeTab === "mine" && (
              <Link to="/tournaments/create" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300">
                <PlusIcon className="size-4" />
                Créer un tournoi
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={clsx("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3", GRID_GAP)}>
              {visibleTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  canManage={isAdmin || tournament.isMine}
                  deletingId={deletingId}
                  generatingId={generatingId}
                  onDelete={handleDelete}
                  onGenerateBracket={handleGenerateBracket}
                />
              ))}
            </div>

            <PaginationControls
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={filteredTournaments.length}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        )}
      </PageStack>
    </>
  );
}
