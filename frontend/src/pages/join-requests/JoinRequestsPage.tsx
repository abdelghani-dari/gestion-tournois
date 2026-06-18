import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  acceptJoinRequest,
  ApiError,
  createJoinRequest,
  getJoinRequests,
  getMyTeams,
  getPublicTournaments,
  refuseJoinRequest,
  type ApiTeam,
  type JoinRequest,
  type JoinRequestPayload,
  type PublicTournament,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { PaperPlaneIcon } from "../../icons";

type JoinRequestForm = {
  tournament_id: string;
  team_id: string;
  message: string;
};

const emptyForm: JoinRequestForm = {
  tournament_id: "",
  team_id: "",
  message: "",
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

function requestTournamentName(request: JoinRequest, tournaments: PublicTournament[]) {
  return request.tournament?.name ?? tournaments.find((tournament) => tournament.id === request.tournament_id)?.name ?? `Tournoi #${request.tournament_id}`;
}

function requestTeamName(request: JoinRequest, teams: ApiTeam[]) {
  return request.team?.name ?? teams.find((team) => team.id === request.team_id)?.name ?? `Équipe #${request.team_id}`;
}

function requesterLabel(request: JoinRequest) {
  const manager = request.manager ?? request.user;
  if (!manager) return "-";
  if (manager.name && manager.email) return `${manager.name} (${manager.email})`;
  return manager.name ?? manager.email ?? "-";
}

function actionErrorMessage(err: unknown) {
  if (err instanceof ApiError && err.status === 403) {
    return "You can only manage requests for tournaments you created.";
  }
  if (err instanceof ApiError && err.status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }
  return err instanceof Error ? err.message : "Impossible de mettre à jour la demande.";
}

export default function JoinRequestsPage() {
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [myTeams, setMyTeams] = useState<ApiTeam[]>([]);
  const [form, setForm] = useState<JoinRequestForm>(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const [requestData, tournamentData, teamData] = await Promise.all([
        getJoinRequests(),
        getPublicTournaments(),
        getMyTeams(),
      ]);
      setRequests(requestData);
      setTournaments(tournamentData);
      setMyTeams(teamData);
      setForm((current) => ({
        ...current,
        tournament_id: current.tournament_id || (tournamentData[0]?.id ? String(tournamentData[0].id) : ""),
        team_id: current.team_id || (teamData[0]?.id ? String(teamData[0].id) : ""),
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger les demandes.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadData();
    }
    if (!authLoading && !isAuthenticated) {
      setRequests([]);
      setMyTeams([]);
      setTournaments([]);
    }
  }, [authLoading, isAuthenticated]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((request) =>
      [
        request.id,
        requestTournamentName(request, tournaments),
        requestTeamName(request, myTeams),
        request.status ?? "",
        request.message ?? "",
        requesterLabel(request),
        request.created_at ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [requests, tournaments, myTeams, searchQuery]);

  const updateForm = (key: keyof JoinRequestForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreateRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    const payload: JoinRequestPayload = {
      tournament_id: Number(form.tournament_id),
      team_id: Number(form.team_id),
      message: form.message.trim() || undefined,
    };

    try {
      await createJoinRequest(payload);
      setSuccess("Join request sent.");
      setForm((current) => ({ ...current, message: "" }));
      await loadData();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible d'envoyer la demande.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (id: number) => {
    setWorkingId(id);
    setSuccess("");
    setError("");

    try {
      await acceptJoinRequest(id);
      setSuccess("Demande acceptée.");
      await loadData();
    } catch (err) {
      setError(actionErrorMessage(err));
    } finally {
      setWorkingId(null);
    }
  };

  const handleRefuse = async (id: number) => {
    setWorkingId(id);
    setSuccess("");
    setError("");

    try {
      await refuseJoinRequest(id);
      setSuccess("Demande refusée.");
      await loadData();
    } catch (err) {
      setError(actionErrorMessage(err));
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Demandes d'inscription" description="Gestion des demandes de participation" />
      <PageStack>
        {!authLoading && !isAuthenticated ? (
          <ComponentCard title="Demandes d'inscription" desc="Connexion requise">
            <p className={clsx("text-sm", t.textSecondary)}>
              Connectez-vous pour envoyer et suivre les demandes de participation.
            </p>
            <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
              Aller a la connexion
            </Link>
          </ComponentCard>
        ) : (
          <>
            <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
              <ComponentCard title="Compte connecté" desc={user ? `${user.email} - ${user.role}` : "Utilisateur"}>
                <div className={clsx("rounded-md border p-4", t.card)}>
                  <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Demandes</p>
                  <p className={clsx("mt-1 text-3xl font-bold", t.textPrimary)}>{requests.length}</p>
                </div>
              </ComponentCard>

              <ComponentCard title="Envoyer une demande" desc="Équipe vers tournoi accepté" className="xl:col-span-2">
                {tournaments.length === 0 && !loading ? (
                  <p className={clsx("text-sm", t.textSecondary)}>Aucun tournoi disponible.</p>
                ) : myTeams.length === 0 && !loading ? (
                  <p className={clsx("text-sm", t.textSecondary)}>Créez d'abord une équipe.</p>
                ) : (
                  <form onSubmit={handleCreateRequest} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="join-request-tournament" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Tournoi *</label>
                      <select
                        id="join-request-tournament"
                        name="tournament_id"
                        value={form.tournament_id}
                        onChange={(e) => updateForm("tournament_id", e.target.value)}
                        required
                        disabled={submitting || loading}
                        className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                      >
                        <option value="">Sélectionner un tournoi</option>
                        {tournaments.map((tournament) => (
                          <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="join-request-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe *</label>
                      <select
                        id="join-request-team"
                        name="team_id"
                        value={form.team_id}
                        onChange={(e) => updateForm("team_id", e.target.value)}
                        required
                        disabled={submitting || loading}
                        className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                      >
                        <option value="">Sélectionner une équipe</option>
                        {myTeams.map((team) => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="join-request-message" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Message</label>
                      <textarea
                        id="join-request-message"
                        name="message"
                        value={form.message}
                        onChange={(e) => updateForm("message", e.target.value)}
                        rows={3}
                        disabled={submitting || loading}
                        placeholder="Message pour l'organisateur"
                        className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      {success && (
                        <div className="mb-3 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                          {success}
                        </div>
                      )}
                      {error && (
                        <div className="mb-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                          {error}
                        </div>
                      )}
                      <Button type="submit" disabled={submitting || loading || myTeams.length === 0 || tournaments.length === 0} className="gap-2">
                        <PaperPlaneIcon className="size-4 shrink-0" />
                        {submitting ? "Envoi..." : "Envoyer la demande"}
                      </Button>
                    </div>
                  </form>
                )}
              </ComponentCard>
            </div>

            <ComponentCard title="Demandes" desc="Demandes envoyées et demandes à gérer">
              <div className="mb-4">
                <FilterSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Rechercher une demande..."
                />
              </div>

              {loading && (
                <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des demandes...</p>
              )}

              {!loading && !error && requests.length === 0 && (
                <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune demande disponible.</p>
              )}

              {!loading && requests.length > 0 && (
                <div className="x-scroll overflow-x-auto">
                  <table className="w-full min-w-[1080px] table-fixed text-sm">
                    <colgroup>
                      <col className="w-[70px]" />
                      <col className="w-[18%]" />
                      <col className="w-[16%]" />
                      <col className="w-[11%]" />
                      <col className="w-[20%]" />
                      <col className="w-[18%]" />
                      <col className="w-[12%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Tournoi</th>
                        <th className="px-4 py-3">Équipe</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Message</th>
                        <th className="px-4 py-3">Manager</th>
                        <th className="px-4 py-3">Création</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                          <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{request.id}</td>
                          <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                            <span className="block truncate" title={requestTournamentName(request, tournaments)}>
                              {requestTournamentName(request, tournaments)}
                            </span>
                          </td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>
                            <span className="block truncate" title={requestTeamName(request, myTeams)}>
                              {requestTeamName(request, myTeams)}
                            </span>
                          </td>
                          <td className="px-4 py-3"><StatusPill value={request.status} /></td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>
                            <span className="block truncate" title={request.message ?? ""}>{request.message || "-"}</span>
                          </td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>
                            <span className="block truncate" title={requesterLabel(request)}>{requesterLabel(request)}</span>
                          </td>
                          <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDate(request.created_at)}</td>
                          <td className="px-4 py-3">
                            {request.status === "pending" ? (
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" disabled={workingId === request.id} onClick={() => handleAccept(request.id)}>
                                  Accepter
                                </Button>
                                <Button size="sm" variant="danger" disabled={workingId === request.id} onClick={() => handleRefuse(request.id)}>
                                  Refuser
                                </Button>
                              </div>
                            ) : (
                              <span className={t.textMuted}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ComponentCard>
          </>
        )}
      </PageStack>
    </>
  );
}
