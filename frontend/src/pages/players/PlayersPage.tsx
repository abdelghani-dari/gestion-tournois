import { Link } from "react-router";
import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createPlayer,
  getMyTeams,
  getPlayers,
  getTeams,
  type ApiPlayer,
  type ApiTeam,
  type PlayerPayload,
} from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon } from "../../icons";

type PlayerForm = {
  team_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: string;
  number: string;
};

const emptyPlayerForm: PlayerForm = {
  team_id: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  position: "",
  number: "",
};

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function playerName(player: ApiPlayer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

function teamName(player: ApiPlayer, teams: ApiTeam[]) {
  return player.team?.name ?? teams.find((team) => team.id === player.team_id)?.name ?? `Team #${player.team_id}`;
}

export default function PlayersPage() {
  const t = useThemeTokens();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [myTeams, setMyTeams] = useState<ApiTeam[]>([]);
  const [form, setForm] = useState<PlayerForm>(emptyPlayerForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [myTeamsLoading, setMyTeamsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPlayers = async () => {
    setLoading(true);
    setError("");

    try {
      const [playersData, teamsData] = await Promise.all([getPlayers(), getTeams()]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load players.");
    } finally {
      setLoading(false);
    }
  };

  const loadMyTeams = async () => {
    if (!isAuthenticated) {
      setMyTeams([]);
      return;
    }

    setMyTeamsLoading(true);

    try {
      const data = await getMyTeams();
      setMyTeams(data);
      setForm((current) => ({
        ...current,
        team_id: current.team_id || (data[0]?.id ? String(data[0].id) : ""),
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to load your teams.");
      }
    } finally {
      setMyTeamsLoading(false);
    }
  };

  useEffect(() => {
    void loadPlayers();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      void loadMyTeams();
    }
  }, [authLoading, isAuthenticated]);

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((player) =>
      [
        player.id,
        playerName(player),
        teamName(player, teams),
        player.position ?? "",
        player.number ?? "",
        player.birth_date ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [players, teams, searchQuery]);

  const updateForm = (key: keyof PlayerForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreatePlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || myTeams.length === 0) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    const payload: PlayerPayload = {
      team_id: Number(form.team_id),
      first_name: form.first_name,
      last_name: form.last_name,
      birth_date: form.birth_date || undefined,
      position: form.position.trim() || undefined,
      number: form.number ? Number(form.number) : undefined,
    };

    try {
      await createPlayer(payload);
      setSuccess("Player created.");
      setForm({ ...emptyPlayerForm, team_id: form.team_id });
      await loadPlayers();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to create player.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <XPageMeta title="Joueurs" description="Liste des joueurs" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Joueurs" desc="Donnees backend">
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Total joueurs</p>
              <p className={clsx("mt-1 text-3xl font-bold", t.textPrimary)}>{players.length}</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Creer un joueur" desc="Associe a une de vos equipes" className="xl:col-span-2">
            {!isAuthenticated && !authLoading ? (
              <div>
                <p className={clsx("text-sm", t.textSecondary)}>Connectez-vous pour creer des joueurs.</p>
                <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-brand-500 hover:text-brand-400">
                  Aller a la connexion
                </Link>
              </div>
            ) : myTeams.length === 0 && !myTeamsLoading ? (
              <p className={clsx("text-sm", t.textSecondary)}>Create a team first.</p>
            ) : (
              <form onSubmit={handleCreatePlayer} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="player-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Equipe *</label>
                  <select
                    id="player-team"
                    name="team_id"
                    value={form.team_id}
                    onChange={(e) => updateForm("team_id", e.target.value)}
                    required
                    disabled={submitting || myTeamsLoading}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  >
                    {myTeams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="player-first-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Prenom *</label>
                  <input
                    id="player-first-name"
                    name="first_name"
                    value={form.first_name}
                    onChange={(e) => updateForm("first_name", e.target.value)}
                    required
                    disabled={submitting}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  />
                </div>
                <div>
                  <label htmlFor="player-last-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
                  <input
                    id="player-last-name"
                    name="last_name"
                    value={form.last_name}
                    onChange={(e) => updateForm("last_name", e.target.value)}
                    required
                    disabled={submitting}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  />
                </div>
                <div>
                  <label htmlFor="player-birth-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Naissance</label>
                  <input
                    id="player-birth-date"
                    name="birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => updateForm("birth_date", e.target.value)}
                    disabled={submitting}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  />
                </div>
                <div>
                  <label htmlFor="player-position" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Poste</label>
                  <input
                    id="player-position"
                    name="position"
                    value={form.position}
                    onChange={(e) => updateForm("position", e.target.value)}
                    placeholder="ST"
                    disabled={submitting}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  />
                </div>
                <div>
                  <label htmlFor="player-number" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Numero</label>
                  <input
                    id="player-number"
                    name="number"
                    type="number"
                    min={0}
                    value={form.number}
                    onChange={(e) => updateForm("number", e.target.value)}
                    disabled={submitting}
                    className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                  />
                </div>
                <div className="md:col-span-3">
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
                  <Button type="submit" disabled={submitting || myTeams.length === 0} className="gap-2">
                    <PlusIcon className="size-4 shrink-0" />
                    {submitting ? "Creation..." : "Creer le joueur"}
                  </Button>
                </div>
              </form>
            )}
          </ComponentCard>
        </div>

        <ComponentCard title="Liste des joueurs" desc="Joueurs enregistres">
          <div className="mb-4">
            <FilterSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un joueur..."
            />
          </div>

          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des joueurs...</p>
          )}

          {!loading && !error && players.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucun joueur.</p>
          )}

          {!loading && players.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[17%]" />
                  <col className="w-[17%]" />
                  <col className="w-[24%]" />
                  <col className="w-[13%]" />
                  <col className="w-[10%]" />
                  <col className="w-[19%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Prenom</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Equipe</th>
                    <th className="px-4 py-3">Poste</th>
                    <th className="px-4 py-3">Numero</th>
                    <th className="px-4 py-3">Naissance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{player.id}</td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>{player.first_name}</td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>{player.last_name}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={teamName(player, teams)}>{teamName(player, teams)}</span>
                      </td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{player.position || "-"}</td>
                      <td className={clsx("px-4 py-3 font-mono tabular-nums", t.textSecondary)}>{player.number ?? "-"}</td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>{formatDate(player.birth_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </PageStack>
    </>
  );
}
