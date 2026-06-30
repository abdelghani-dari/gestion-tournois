import { Link, useNavigate, useParams } from "react-router";
import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  deleteTeam,
  getPlayers,
  getTeam,
  type ApiPlayer,
  type ApiTeam,
} from "../../api";
import Badge from "../../components/ui/Badge";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import ConfirmModal from "../../components/common/ConfirmModal";
import MediaImage from "../../components/common/MediaImage";
import { resolveTeamLogo } from "../../components/common/teamAssets";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import PlayerMiniCard from "../../components/players/PlayerMiniCard";
import ScorersRankingTable from "../../components/players/ScorersRankingTable";
import TableRowsSkeleton from "../../components/common/skeletons/TableRowsSkeleton";
import { Skeleton } from "../../components/common/skeletons/Skeleton";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { canDeleteTeam, canEditTeam, isAdmin } from "../../utils/permissions";
import { AngleLeftIcon } from "../../icons";

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function managerLabel(team: ApiTeam) {
  const manager = team.manager ?? team.user;
  if (!manager) return "-";
  if (manager.name && manager.email) return `${manager.name} (${manager.email})`;
  return manager.name ?? manager.email ?? "-";
}

export default function TeamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [team, setTeam] = useState<ApiTeam | null>(null);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const teamId = Number(id);
        const [teamData, playersData] = await Promise.all([
          getTeam(teamId),
          getPlayers({ team_id: teamId }),
        ]);
        setTeam(teamData);
        setPlayers(playersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger l'équipe.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      void load();
    }
  }, [id, authLoading, isAuthenticated]);

  const canEdit = useMemo(() => team && canEditTeam(user, team), [team, user]);
  const canDelete = useMemo(() => team && canDeleteTeam(user, team), [team, user]);
  const showAdminEditNotice = useMemo(() => team && isAdmin(user) && !canEditTeam(user, team), [team, user]);

  const handleDelete = async () => {
    if (!team) return;
    setDeleting(true);
    setError("");
    try {
      await deleteTeam(team.id);
      setConfirmDelete(false);
      navigate("/teams");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer vos propres équipes.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer l'équipe.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <XPageMeta title="Fiche équipe" description="Chargement..." />
        <PageStack>
          <Skeleton className="h-4 w-32" />
          <div className={clsx("rounded-md border p-8", t.card)}>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Skeleton className="h-32 w-32 shrink-0 rounded-lg" />
              <div className="w-full flex-1 space-y-3">
                <Skeleton className="mx-auto h-8 w-2/3 sm:mx-0 sm:w-1/2" />
                <Skeleton className="mx-auto h-5 w-24 sm:mx-0" />
                <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={clsx("grid grid-cols-1 xl:grid-cols-4", GRID_GAP)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
            <div className="xl:col-span-1">
              <TableRowsSkeleton rows={8} compact />
            </div>
          </div>
        </PageStack>
      </>
    );
  }

  if (!team) {
    return (
      <PageStack>
        <p className={clsx("text-sm", t.textMuted)}>{error || "Équipe introuvable."}</p>
        <Link to="/teams" className="text-sm font-medium text-brand-500 hover:text-brand-400">
          Retour aux équipes
        </Link>
      </PageStack>
    );
  }

  return (
    <>
      <XPageMeta title={team.name} description="Fiche équipe" />
      <PageStack>
        <Link to="/teams" className={clsx("inline-flex items-center gap-2 text-sm font-medium hover:text-brand-500", t.textSecondary)}>
          <AngleLeftIcon className="size-4" />
          Retour aux équipes
        </Link>

        {error && (
          <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className={clsx("rounded-md border p-6 sm:p-8", t.card)}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <MediaImage
              src={team.logo_path}
              fallback={resolveTeamLogo(null)}
              alt={team.name}
              className="h-28 w-28 shrink-0 object-contain sm:h-36 sm:w-36"
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className={clsx("text-2xl font-bold sm:text-3xl", t.textPrimary)}>{team.name}</h1>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {team.short_name && (
                  <Badge color="info">{team.short_name}</Badge>
                )}
                <Badge color="primary">{players.length} joueurs</Badge>
                {team.city && <Badge color="light">{team.city}</Badge>}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Manager", managerLabel(team)],
                  ["Création", formatDate(team.created_at)],
                  ["Ville", team.city || "-"],
                  ["Joueurs", String(players.length)],
                ].map(([label, value]) => (
                  <div key={label} className={clsx("rounded-md border px-4 py-3", t.borderSubtle, t.metricBg)}>
                    <p className={clsx("text-xs uppercase tracking-wider", t.textMuted)}>{label}</p>
                    <p className={clsx("mt-1 font-medium", t.textPrimary)}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:justify-start">
                <Link
                  to={`/statistics?team_id=${team.id}`}
                  className="text-sm font-medium text-brand-500 hover:text-brand-400"
                >
                  Statistiques
                </Link>
                {showAdminEditNotice && (
                  <p className={clsx("text-xs", t.textMuted)}>
                    Modification réservée au manager de l&apos;équipe. Demandez une demande de transfert pour modifier cette équipe.
                  </p>
                )}
                {canDelete && (
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setConfirmDelete(true)}
                    className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {deleting ? "Suppression..." : "Supprimer"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={clsx("grid grid-cols-1 xl:grid-cols-4", GRID_GAP)}>
          <div className="xl:col-span-3">
            <ComponentCard title="Effectif" desc={`${players.length} joueurs`}>
              {players.length === 0 ? (
                <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun joueur dans cette équipe.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {players.map((player) => (
                    <PlayerMiniCard key={player.id} player={player} />
                  ))}
                </div>
              )}
            </ComponentCard>
          </div>
          <div className="xl:col-span-1">
            <ComponentCard title="Classement buteurs" desc={`${players.length} joueurs · G`}>
              <ScorersRankingTable players={players} teams={[team]} />
            </ComponentCard>
          </div>
        </div>

        <ConfirmModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title="Supprimer l'équipe"
          message={`Voulez-vous vraiment supprimer l'équipe « ${team.name} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          loading={deleting}
          onConfirm={() => void handleDelete()}
        />
      </PageStack>
    </>
  );
}
