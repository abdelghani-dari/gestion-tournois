import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  acceptTournament,
  ApiError,
  createTournament,
  deleteTournament,
  getAdminTournaments,
  getPendingTournaments,
  refuseTournament,
  type AdminTournament,
  type CreateTournamentPayload,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import TournamentFormDrawer from "../../components/tournaments/TournamentFormDrawer";
import EntityImage from "../../components/common/EntityImage";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import XModal from "../../components/common/XModal";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { AngleRightIcon } from "../../icons";

const emptyForm: CreateTournamentPayload = {
  name: "",
  description: "",
  city: "",
  location: "",
  banner_path: "",
  format: "league",
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

function StatusPill({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  return (
    <span className={clsx("inline-flex rounded-sm px-2 py-0.5 text-xs font-medium", statusTone(value) || clsx(t.metricBg, t.textSecondary))}>
      {statusLabel(value)}
    </span>
  );
}

function creatorText(tournament: AdminTournament) {
  const creator = tournament.creator ?? tournament.user ?? tournament.created_by_user;
  if (!creator) return "-";
  if (creator.name && creator.email) return `${creator.name} (${creator.email})`;
  return creator.name ?? creator.email ?? "-";
}

function AdminTournamentTable({
  tournaments,
  notes,
  workingId,
  deletingId,
  showActions,
  onNoteChange,
  onAccept,
  onRefuse,
  onDelete,
}: {
  tournaments: AdminTournament[];
  notes: Record<number, string>;
  workingId: number | null;
  deletingId: number | null;
  showActions: boolean;
  onNoteChange: (id: number, value: string) => void;
  onAccept: (id: number) => void;
  onRefuse: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const t = useThemeTokens();

  if (tournaments.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>;
  }

  return (
    <div className="x-scroll overflow-x-auto">
      <table className="w-full min-w-[920px] table-fixed text-sm">
        <colgroup>
          <col className="w-[44px]" />
          <col className="w-[20%]" />
          <col className="w-[16%]" />
          <col className="w-[9%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead>
          <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">Nom</th>
            <th className="px-3 py-3">Créateur</th>
            <th className="px-3 py-3">Ville</th>
            <th className="px-3 py-3">Lieu</th>
            <th className="px-3 py-3">Dates</th>
            <th className="px-3 py-3">Statut</th>
            <th className="px-3 py-3">Valid.</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((tr) => (
            <tr key={tr.id} className={clsx("align-top transition-colors", t.tableRow, t.navHover)}>
              <td className={clsx("px-3 py-3 font-mono text-xs", t.textMuted)}>{tr.id}</td>
              <td className="px-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <EntityImage src={tr.banner_path} name={tr.name} className="h-8 w-11 shrink-0 rounded-sm" />
                  <span className={clsx("block truncate text-xs font-medium", t.textPrimary)} title={tr.name}>{tr.name}</span>
                </div>
              </td>
              <td className={clsx("px-3 py-3 text-xs", t.textSecondary)}>
                <span className="block truncate" title={creatorText(tr)}>{creatorText(tr)}</span>
              </td>
              <td className={clsx("px-3 py-3 text-xs", t.textSecondary)}>{tr.city || "-"}</td>
              <td className={clsx("px-3 py-3 text-xs", t.textSecondary)}>
                <span className="block truncate" title={tr.location ?? ""}>{tr.location || "-"}</span>
              </td>
              <td className={clsx("px-3 py-3 text-xs tabular-nums", t.textSecondary)}>
                <span className="block whitespace-nowrap">{formatDate(tr.start_date)}</span>
                <span className={clsx("block whitespace-nowrap opacity-60", t.textMuted)}>{formatDate(tr.end_date)}</span>
              </td>
              <td className="px-3 py-3"><StatusPill value={tr.status} /></td>
              <td className="px-3 py-3"><StatusPill value={tr.approval_status} /></td>
              <td className="px-3 py-3">
                {showActions && tr.approval_status === "pending" ? (
                  <div className="flex w-full flex-col gap-1.5">
                    <Button size="sm" className="w-full justify-center" disabled={workingId === tr.id} onClick={() => onAccept(tr.id)}>
                      {workingId === tr.id ? "..." : "Accepter"}
                    </Button>
                    <Button size="sm" variant="danger" className="w-full justify-center" disabled={workingId === tr.id} onClick={() => onRefuse(tr.id)}>
                      {workingId === tr.id ? "..." : "Refuser"}
                    </Button>
                    <input
                      value={notes[tr.id] ?? ""}
                      onChange={(e) => onNoteChange(tr.id, e.target.value)}
                      placeholder="Note de refus"
                      className={clsx("w-full rounded-sm border px-2 py-1 text-xs focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                    />
                    <Button size="sm" variant="danger" className="w-full justify-center" disabled={workingId === tr.id || deletingId === tr.id} onClick={() => onDelete(tr.id)}>
                      {deletingId === tr.id ? "..." : "Supprimer"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex w-full flex-col gap-1.5">
                    {tr.admin_note && (
                      <span className={clsx("block truncate text-xs", t.textSecondary)} title={tr.admin_note}>{tr.admin_note}</span>
                    )}
                    <Button size="sm" variant="danger" className="w-full justify-center" disabled={deletingId === tr.id} onClick={() => onDelete(tr.id)}>
                      {deletingId === tr.id ? "..." : "Supprimer"}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminTournamentsPage() {
  const t = useThemeTokens();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [pending, setPending] = useState<AdminTournament[]>([]);
  const [allTournaments, setAllTournaments] = useState<AdminTournament[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [tournamentToDeleteId, setTournamentToDeleteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateTournamentPayload>(emptyForm);
  const [bannerMode, setBannerMode] = useState<ImageSourceMode>("upload");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdminTournaments = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;

    setLoading(true);
    setError("");

    try {
      const [pendingData, allData] = await Promise.all([
        getPendingTournaments(),
        getAdminTournaments(),
      ]);
      setPending(pendingData);
      setAllTournaments(allData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Accès administrateur requis.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger les tournois.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      const timer = window.setTimeout(() => void loadAdminTournaments(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, isAuthenticated, isAdmin, loadAdminTournaments]);

  const handleAccept = async (id: number) => {
    setWorkingId(id);
    setError("");
    setSuccess("");

    try {
      await acceptTournament(id);
      setSuccess("Tournoi accepté.");
      await loadAdminTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Accès administrateur requis.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible d'accepter le tournoi.");
      }
    } finally {
      setWorkingId(null);
    }
  };

  const handleRefuse = async (id: number) => {
    setWorkingId(id);
    setError("");
    setSuccess("");

    try {
      await refuseTournament(id, notes[id]);
      setSuccess("Tournoi refusé.");
      setNotes((current) => ({ ...current, [id]: "" }));
      await loadAdminTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Accès administrateur requis.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de refuser le tournoi.");
      }
    } finally {
      setWorkingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (tournamentToDeleteId == null) return;

    setDeletingId(tournamentToDeleteId);
    setError("");
    setSuccess("");

    try {
      await deleteTournament(tournamentToDeleteId);
      setSuccess("Tournoi supprime.");
      setTournamentToDeleteId(null);
      await loadAdminTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Vous pouvez seulement supprimer les tournois que vous avez crees.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expire. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de supprimer le tournoi.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setForm(emptyForm);
    setBannerMode("url");
    setBannerFile(null);
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      await createTournament({
        name: form.name,
        description: form.description?.trim() || undefined,
        city: form.city?.trim() || undefined,
        location: form.location?.trim() || undefined,
        banner: bannerFile,
        banner_url: form.banner_path?.trim() || undefined,
        format: form.format,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      closeCreate();
      setSuccess("Tournoi créé.");
      await loadAdminTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le tournoi.");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-400">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <XPageMeta title="Admin Tournois" description="Validation des tournois" />
        <PageStack>
          <ComponentCard title="Administration" desc="Connexion requise">
            <p className={clsx("text-sm", t.textSecondary)}>Connectez-vous avec un compte admin pour valider les tournois.</p>
            <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
              Aller à la connexion
            </Link>
          </ComponentCard>
        </PageStack>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <XPageMeta title="Admin Tournois" description="Validation des tournois" />
        <PageStack>
          <ComponentCard title="Administration" desc={user ? `${user.email} - ${user.role}` : undefined}>
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Accès administrateur requis.
            </div>
          </ComponentCard>
        </PageStack>
      </>
    );
  }

  return (
    <>
      <XPageMeta title="Admin Tournois" description="Validation des tournois" />
      <PageStack>
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreateOpen(true)}>Créer un tournoi</Button>
        </div>

        <div className={clsx("grid grid-cols-1 sm:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="En attente" desc="Tournois à valider">
            <p className={clsx("text-3xl font-bold", t.textPrimary)}>{pending.length}</p>
          </ComponentCard>
          <ComponentCard title="Acceptés" desc="Tournois validés">
            <p className={clsx("text-3xl font-bold text-emerald-400", t.textPrimary)}>{allTournaments.filter((t) => t.approval_status === "accepted" || t.approval_status === "approved").length}</p>
          </ComponentCard>
          <ComponentCard title="Total" desc="Tous les tournois">
            <p className={clsx("text-3xl font-bold", t.textPrimary)}>{allTournaments.length}</p>
          </ComponentCard>
        </div>

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

        <ComponentCard title="Tournois en attente" desc="Accepter ou refuser les demandes">
          {loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement des demandes...</p>
          ) : (
            <AdminTournamentTable
              tournaments={pending}
              notes={notes}
              workingId={workingId}
              deletingId={deletingId}
              showActions
              onNoteChange={(id, value) => setNotes((current) => ({ ...current, [id]: value }))}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
              onDelete={setTournamentToDeleteId}
            />
          )}
        </ComponentCard>

        <ComponentCard title="Tous les tournois" desc="Vue administrateur — modifier et gérer tous les tournois">
          {loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement des tournois...</p>
          ) : allTournaments.length === 0 ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun tournoi disponible.</p>
          ) : (
            <div className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3")}>
              {allTournaments.map((tr) => {
                const isOwn = user?.id != null && Number(tr.created_by) === Number(user.id);
                return (
                  <article
                    key={tr.id}
                    className={clsx(
                      "group relative flex flex-col overflow-hidden rounded-xl border transition-colors",
                      t.card, t.cardHover,
                    )}
                  >
                    {/* Banner */}
                    <div className="relative">
                      <EntityImage
                        src={tr.banner_path ?? null}
                        name={tr.name}
                        className="h-36 w-full border-0 bg-brand-500/10 object-cover"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <span
                          className={clsx(
                            "inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            statusTone(tr.status) || "bg-zinc-800 text-zinc-300",
                          )}
                        >
                          {statusLabel(tr.status)}
                        </span>
                        {isOwn && (
                          <span className="inline-flex items-center rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            ★ Mien
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-3">
                      <h2
                        className={clsx("line-clamp-1 text-sm font-bold", t.textPrimary)}
                        title={tr.name}
                      >
                        {tr.name}
                      </h2>
                      <p className={clsx("mt-0.5 truncate text-[11px]", t.textMuted)}
                         title={creatorText(tr)}>
                        {creatorText(tr)}
                      </p>
                      <div className={clsx("mt-2 grid grid-cols-2 gap-1 text-[10px]", t.textMuted)}>
                        <span>{tr.city || "—"}</span>
                        <span className="text-right">
                          {tr.start_date ? new Date(tr.start_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className={clsx("mt-3 flex flex-row items-center gap-1 border-t pt-3", t.borderSubtle)}>
                        <Link
                          to={`/tournaments/${tr.id}`}
                          className={clsx(
                            "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors",
                            t.textSecondary, t.navHover, "hover:text-brand-400",
                          )}
                        >
                          <span>Détails</span>
                          <AngleRightIcon className="size-3 shrink-0 opacity-70" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditId(tr.id)}
                          className={clsx(
                            "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors",
                            t.textSecondary, t.navHover, "hover:text-brand-400",
                          )}
                        >
                          <span>Modifier</span>
                          <AngleRightIcon className="size-3 shrink-0 opacity-70" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === tr.id}
                          onClick={() => setTournamentToDeleteId(tr.id)}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        >
                          <span>{deletingId === tr.id ? "..." : "Supprimer"}</span>
                          <AngleRightIcon className="size-3 shrink-0 opacity-70" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </ComponentCard>

        <TournamentFormDrawer
          open={createOpen || editId != null}
          editId={editId}
          onClose={() => { setCreateOpen(false); setEditId(null); closeCreate(); }}
          onSuccess={() => { setEditId(null); void loadAdminTournaments(); }}
        />

        <ConfirmModal
          open={tournamentToDeleteId != null}
          onClose={() => setTournamentToDeleteId(null)}
          title="Supprimer le tournoi"
          message="Voulez-vous vraiment supprimer ce tournoi ? Cette action est irréversible."
          confirmLabel="Supprimer"
          loading={deletingId !== null}
          onConfirm={() => void handleConfirmDelete()}
        />
      </PageStack>
    </>
  );
}
