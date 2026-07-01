import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { Link, useSearchParams } from "react-router";
import {
  ApiError,
  deleteTournament,
  getMyTournaments,
  getPublicTournaments,
  type MyTournament,
  type PublicTournament,
} from "../../api";
import ConfirmModal from "../../components/common/ConfirmModal";
import EntityImage from "../../components/common/EntityImage";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import PaginationControls, { usePagination } from "../../components/common/PaginationControls";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { canDeleteTournament, canEditTournament } from "../../utils/permissions";
import TournamentFormDrawer from "../../components/tournaments/TournamentFormDrawer";
import { MapPin, Calendar } from "lucide-react";
import { AngleRightIcon, ShootingStarIcon } from "../../icons";

type TournamentTab = "all" | "mine" | "open" | "league" | "finished";

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

function isLeague(tournament: PublicTournament) {
  return !tournament.format || tournament.format === "league";
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

function isFinished(tournament: PublicTournament) {
  return ["finished", "completed"].includes(normalizeStatus(tournament.status));
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

function CardFooterAction({
  to,
  onClick,
  label,
  tone = "default",
  disabled,
}: {
  to?: string;
  onClick?: () => void;
  label: string;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  const t = useThemeTokens();
  const className = clsx(
    "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors",
    tone === "danger"
      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
      : clsx(t.textSecondary, t.navHover, "hover:text-brand-400"),
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        <span>{label}</span>
        <AngleRightIcon className="size-3 shrink-0 opacity-70" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      <span>{label}</span>
      <AngleRightIcon className="size-3 shrink-0 opacity-70" />
    </button>
  );
}

function TournamentCard({
  tournament,
  canEdit,
  canDelete,
  deletingId,
  onDelete,
  onEdit,
}: {
  tournament: TournamentCardItem;
  canEdit: boolean;
  canDelete: boolean;
  deletingId: number | null;
  onDelete: (tournament: TournamentCardItem) => void;
  onEdit: (id: number) => void;
}) {
  const t = useThemeTokens();

  return (
    <article className={clsx("group relative flex min-h-full flex-col overflow-hidden rounded-xl border transition-colors", t.card, t.cardHover)}>
      <div className="relative">
        <EntityImage
          src={tournament.banner_path}
          name={tournament.name}
          className="h-36 w-full border-0 bg-brand-500/10 object-cover"
        />
        <div className="absolute right-2 top-2">
          <StatusBadge value={tournament.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h2 className={clsx("line-clamp-1 text-sm font-bold", t.textPrimary)} title={tournament.name}>
          {tournament.name}
        </h2>
        <p className={clsx("mt-1 line-clamp-2 flex-1 text-[11px] leading-relaxed", t.textMuted)}>
          {tournament.description || "Tournoi public pour équipes locales."}
        </p>
        <div className={clsx("mt-3 grid grid-cols-2 gap-2 text-[10px]", t.textMuted)}>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3 text-brand-400" />
            {tournament.city || "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3 text-brand-400" />
            {formatDate(tournament.start_date)}
          </span>
        </div>
        <div className={clsx("mt-4 flex flex-row items-center justify-between gap-1 border-t pt-3", t.borderSubtle)}>
          <CardFooterAction to={`/tournaments/${tournament.id}`} label="Détails" />
          {canEdit && <CardFooterAction label="Modifier" onClick={() => onEdit(tournament.id)} />}
          {canDelete && (
            <CardFooterAction
              label={deletingId === tournament.id ? "..." : "Supprimer"}
              tone="danger"
              disabled={deletingId === tournament.id}
              onClick={() => onDelete(tournament)}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default function TournamentsPage() {
  const t = useThemeTokens();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<PublicTournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [activeTab, setActiveTab] = useState<TournamentTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [tournamentToDelete, setTournamentToDelete] = useState<TournamentCardItem | null>(null);
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

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
    const edit = searchParams.get("edit");
    if (edit) {
      setEditId(Number(edit));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const closeForm = () => {
    setCreateOpen(false);
    setEditId(null);
  };

  const tournamentItems = useMemo(
    () => mergeTournaments(publicTournaments, myTournaments, user?.id),
    [publicTournaments, myTournaments, user?.id],
  );

  const tabItems = useMemo(
    () => [
      { id: "all" as const, label: "Tous les tournois", count: tournamentItems.length },
      { id: "mine" as const, label: "Mes tournois", count: myTournaments.length },
      { id: "open" as const, label: "Ouverts", count: tournamentItems.filter(isOpenForRequests).length },
      { id: "league" as const, label: "Ligue", count: tournamentItems.filter(isLeague).length },
      { id: "finished" as const, label: "Terminés", count: tournamentItems.filter(isFinished).length },
    ],
    [myTournaments.length, tournamentItems],
  );

  const filteredTournaments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tournamentItems
      .filter((tournament) => {
        if (activeTab === "mine" && !tournament.isMine) return false;
        if (activeTab === "open" && !isOpenForRequests(tournament)) return false;
        if (activeTab === "league" && !isLeague(tournament)) return false;
        if (activeTab === "finished" && !isFinished(tournament)) return false;
        return true;
      })
      .filter((tournament) => {
        if (!query) return true;
        return [tournament.name, tournament.city ?? "", tournament.location ?? "", tournament.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [activeTab, searchQuery, tournamentItems]);

  const pagination = usePagination(
    filteredTournaments,
    `${activeTab}:${searchQuery}`,
    PAGE_SIZE_OPTIONS[0],
  );

  const visibleTournaments = pagination.paginatedItems;
  const publicOpenCount = publicTournaments.filter(isOpenForRequests).length;
  const leagueCount = tournamentItems.filter(isLeague).length;

  const handleConfirmDelete = async () => {
    if (!tournamentToDelete) return;

    setDeletingId(tournamentToDelete.id);
    setSuccess("");
    setError("");

    try {
      await deleteTournament(tournamentToDelete.id);
      setSuccess("Tournoi supprimé.");
      setTournamentToDelete(null);
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
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center rounded-sm border border-brand-500/50 bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Créer un tournoi
          </button>
        </section>

        <section className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4", GRID_GAP)}>
          {[
            { label: "Tournois publics", value: publicTournaments.length, tone: "text-cyan-300" },
            { label: "Mes tournois", value: myTournaments.length, tone: "text-brand-300" },
            { label: "Ouverts", value: publicOpenCount, tone: "text-emerald-300" },
            { label: "Ligue", value: leagueCount, tone: "text-amber-300" },
          ].map((metric) => (
            <div key={metric.label} className={clsx("rounded-md border p-5", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>{metric.label}</p>
              <p className={clsx("mt-2 text-3xl font-semibold tabular-nums", metric.tone)}>{metric.value}</p>
            </div>
          ))}
        </section>

        <section className={clsx("relative z-30 rounded-md border p-4", t.panelGlass)}>
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

            <FilterSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom ou ville..."
              className="w-full max-w-none sm:w-72"
            />
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
              <button type="button" onClick={() => setCreateOpen(true)} className="mt-4 text-sm font-medium text-brand-400 hover:text-brand-300">
                Créer un tournoi
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={clsx("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3", GRID_GAP)}>
              {visibleTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  canEdit={canEditTournament(user, tournament)}
                  canDelete={canDeleteTournament(user, tournament)}
                  deletingId={deletingId}
                  onDelete={setTournamentToDelete}
                  onEdit={(id) => setEditId(id)}
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

        <TournamentFormDrawer
          open={createOpen || editId != null}
          editId={editId}
          onClose={closeForm}
          onSuccess={() => void loadTournaments()}
        />

        <ConfirmModal
          open={Boolean(tournamentToDelete)}
          onClose={() => setTournamentToDelete(null)}
          title="Supprimer le tournoi"
          message={
            tournamentToDelete
              ? `Voulez-vous vraiment supprimer le tournoi « ${tournamentToDelete.name} » ? Cette action est irréversible.`
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
