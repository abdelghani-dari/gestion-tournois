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
import EntityImage from "../../components/common/EntityImage";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import XModal from "../../components/common/XModal";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

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
      <table className="w-full min-w-[1120px] table-fixed text-sm">
        <colgroup>
          <col className="w-[64px]" />
          <col className="w-[16%]" />
          <col className="w-[18%]" />
          <col className="w-[11%]" />
          <col className="w-[13%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[19%]" />
        </colgroup>
        <thead>
          <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Créateur</th>
            <th className="px-4 py-3">Ville</th>
            <th className="px-4 py-3">Lieu</th>
            <th className="px-4 py-3">Début</th>
            <th className="px-4 py-3">Fin</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Validation</th>
            <th className="px-4 py-3">Action / note</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((tr) => (
            <tr key={tr.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
              <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{tr.id}</td>
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <EntityImage src={tr.banner_path} name={tr.name} className="h-10 w-14 shrink-0 rounded-sm" />
                  <span className={clsx("block truncate font-medium", t.textPrimary)} title={tr.name}>{tr.name}</span>
                </div>
              </td>
              <td className={clsx("px-4 py-3", t.textSecondary)}>
                <span className="block truncate" title={creatorText(tr)}>{creatorText(tr)}</span>
              </td>
              <td className={clsx("px-4 py-3", t.textSecondary)}>{tr.city || "-"}</td>
              <td className={clsx("px-4 py-3", t.textSecondary)}>
                <span className="block truncate" title={tr.location ?? ""}>{tr.location || "-"}</span>
              </td>
              <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDate(tr.start_date)}</td>
              <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDate(tr.end_date)}</td>
              <td className="px-4 py-3"><StatusPill value={tr.status} /></td>
              <td className="px-4 py-3"><StatusPill value={tr.approval_status} /></td>
              <td className="px-4 py-3">
                {showActions && tr.approval_status === "pending" ? (
                  <div className="space-y-2">
                    <input
                      value={notes[tr.id] ?? ""}
                      onChange={(e) => onNoteChange(tr.id, e.target.value)}
                      placeholder="Note de refus"
                      className={clsx("w-full rounded-sm border px-2 py-1.5 text-xs focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" disabled={workingId === tr.id} onClick={() => onAccept(tr.id)}>
                        Accepter
                      </Button>
                      <Button size="sm" variant="danger" disabled={workingId === tr.id} onClick={() => onRefuse(tr.id)}>
                        Refuser
                      </Button>
                      <Button size="sm" variant="danger" disabled={workingId === tr.id || deletingId === tr.id} onClick={() => onDelete(tr.id)}>
                        {deletingId === tr.id ? "Suppression..." : "Supprimer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className={clsx("block truncate", t.textSecondary)} title={tr.admin_note ?? ""}>{tr.admin_note || "-"}</span>
                    <Button size="sm" variant="danger" disabled={deletingId === tr.id} onClick={() => onDelete(tr.id)}>
                      {deletingId === tr.id ? "Suppression..." : "Supprimer"}
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
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateTournamentPayload>(emptyForm);
  const [bannerMode, setBannerMode] = useState<ImageSourceMode>("url");
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

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce tournoi ?")) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await deleteTournament(id);
      setSuccess("Tournoi supprime.");
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

        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Admin" desc={user ? `${user.email} - ${user.role}` : "Compte connecté"}>
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Utilisateur</p>
              <p className={clsx("mt-1 text-lg font-semibold", t.textPrimary)}>{user?.name}</p>
              <p className={clsx("text-sm", t.textSecondary)}>{user?.email}</p>
            </div>
          </ComponentCard>
          <ComponentCard title="En attente" desc="Tournois à valider">
            <p className={clsx("text-3xl font-bold", t.textPrimary)}>{pending.length}</p>
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
              onDelete={handleDelete}
            />
          )}
        </ComponentCard>

        <ComponentCard title="Tous les tournois" desc="Vue administrateur">
          {loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement des tournois...</p>
          ) : (
            <AdminTournamentTable
              tournaments={allTournaments}
              notes={notes}
              workingId={workingId}
              deletingId={deletingId}
              showActions={false}
              onNoteChange={(id, value) => setNotes((current) => ({ ...current, [id]: value }))}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
              onDelete={handleDelete}
            />
          )}
        </ComponentCard>

        <XModal open={createOpen} onClose={closeCreate} title="Créer un tournoi" className="max-w-3xl">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="admin-tournament-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
              <input id="admin-tournament-name" value={form.name} required disabled={creating} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} />
            </div>
            <div>
              <label htmlFor="admin-tournament-city" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
              <input id="admin-tournament-city" value={form.city} disabled={creating} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))} className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} />
            </div>
            <div>
              <label htmlFor="admin-tournament-location" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Lieu</label>
              <input id="admin-tournament-location" value={form.location} disabled={creating} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} />
            </div>
            <div>
              <label htmlFor="admin-tournament-description" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Description</label>
              <input id="admin-tournament-description" value={form.description} disabled={creating} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} />
            </div>
            <div>
              <label htmlFor="admin-tournament-start-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date de début *</label>
              <input id="admin-tournament-start-date" type="date" value={form.start_date} required disabled={creating} onChange={(e) => setForm((current) => ({ ...current, start_date: e.target.value }))} className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} />
            </div>
            <div>
              <label htmlFor="admin-tournament-end-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date de fin *</label>
              <input id="admin-tournament-end-date" type="date" value={form.end_date} min={form.start_date || undefined} required disabled={creating} onChange={(e) => setForm((current) => ({ ...current, end_date: e.target.value }))} className={clsx("w-full rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} />
            </div>
            <div className="md:col-span-2">
              <ImageSourceInput
                label="Bannière"
                name="banner"
                mode={bannerMode}
                onModeChange={setBannerMode}
                file={bannerFile}
                onFileChange={setBannerFile}
                url={form.banner_path ?? ""}
                onUrlChange={(value) => setForm((current) => ({ ...current, banner_path: value }))}
                previewName={form.name || "Tournoi"}
                disabled={creating}
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="secondary" onClick={closeCreate} disabled={creating}>Annuler</Button>
              <Button type="submit" disabled={creating}>{creating ? "Création..." : "Créer le tournoi"}</Button>
            </div>
          </form>
        </XModal>
      </PageStack>
    </>
  );
}
