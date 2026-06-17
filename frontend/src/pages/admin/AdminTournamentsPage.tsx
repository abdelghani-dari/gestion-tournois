import { Link } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import {
  acceptTournament,
  ApiError,
  getAdminTournaments,
  getPendingTournaments,
  refuseTournament,
  type AdminTournament,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusTone(value?: string | null) {
  const normalized = value ?? "";
  if (["accepted", "open", "active", "approved"].includes(normalized)) return "bg-emerald-500/15 text-emerald-400";
  if (["pending", "draft", "upcoming"].includes(normalized)) return "bg-amber-500/15 text-amber-400";
  if (["refused", "rejected", "cancelled"].includes(normalized)) return "bg-red-500/15 text-red-300";
  return "";
}

function StatusPill({ value }: { value?: string | null }) {
  const t = useThemeTokens();
  return (
    <span className={clsx("inline-flex rounded-sm px-2 py-0.5 text-xs font-medium capitalize", statusTone(value) || clsx(t.metricBg, t.textSecondary))}>
      {value ?? "-"}
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
  showActions,
  onNoteChange,
  onAccept,
  onRefuse,
}: {
  tournaments: AdminTournament[];
  notes: Record<number, string>;
  workingId: number | null;
  showActions: boolean;
  onNoteChange: (id: number, value: string) => void;
  onAccept: (id: number) => void;
  onRefuse: (id: number) => void;
}) {
  const t = useThemeTokens();

  if (tournaments.length === 0) {
    return <p className={clsx("py-8 text-center text-sm", t.textMuted)}>No tournaments found.</p>;
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
          <col className="w-[17%]" />
        </colgroup>
        <thead>
          <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Createur</th>
            <th className="px-4 py-3">Ville</th>
            <th className="px-4 py-3">Lieu</th>
            <th className="px-4 py-3">Debut</th>
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
              <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                <span className="block truncate" title={tr.name}>{tr.name}</span>
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
                    </div>
                  </div>
                ) : (
                  <span className={clsx("block truncate", t.textSecondary)} title={tr.admin_note ?? ""}>{tr.admin_note || "-"}</span>
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
        setError("Admin access required.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to load admin tournaments.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      void loadAdminTournaments();
    }
  }, [authLoading, isAuthenticated, isAdmin, loadAdminTournaments]);

  const handleAccept = async (id: number) => {
    setWorkingId(id);
    setError("");
    setSuccess("");

    try {
      await acceptTournament(id);
      setSuccess("Tournament accepted.");
      await loadAdminTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Admin access required.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to accept tournament.");
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
      setSuccess("Tournament refused.");
      setNotes((current) => ({ ...current, [id]: "" }));
      await loadAdminTournaments();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Admin access required.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to refuse tournament.");
      }
    } finally {
      setWorkingId(null);
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
              Aller a la connexion
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
              Admin access required.
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
        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Admin" desc={user ? `${user.email} - ${user.role}` : "Session active"}>
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Utilisateur</p>
              <p className={clsx("mt-1 text-lg font-semibold", t.textPrimary)}>{user?.name}</p>
              <p className={clsx("text-sm", t.textSecondary)}>{user?.email}</p>
            </div>
          </ComponentCard>
          <ComponentCard title="En attente" desc="Tournois a valider">
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
              showActions
              onNoteChange={(id, value) => setNotes((current) => ({ ...current, [id]: value }))}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
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
              showActions={false}
              onNoteChange={(id, value) => setNotes((current) => ({ ...current, [id]: value }))}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
            />
          )}
        </ComponentCard>
      </PageStack>
    </>
  );
}
