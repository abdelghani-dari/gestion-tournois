import { clsx } from "clsx";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ApiError,
  createComposition,
  deleteComposition,
  getCompositions,
  getMatches,
  getPlayers,
  getTeams,
  type ApiComposition,
  type ApiMatch,
  type ApiPlayer,
  type ApiTeam,
  type CompositionPayload,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import Badge from "../../components/ui/Badge";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

type CompositionForm = {
  match_game_id: string;
  team_id: string;
  player_id: string;
  is_starter: boolean;
  position: string;
  shirt_number: string;
};

const emptyForm: CompositionForm = {
  match_game_id: "",
  team_id: "",
  player_id: "",
  is_starter: true,
  position: "",
  shirt_number: "",
};

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function playerName(player?: ApiPlayer | null) {
  if (!player) return "";
  return `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim() || `Joueur #${player.id}`;
}

function playerLabel(playerId: number, players: ApiPlayer[], embedded?: ApiPlayer | null) {
  return playerName(embedded) || playerName(players.find((player) => player.id === playerId)) || `Joueur #${playerId}`;
}

function teamName(teamId: number | null | undefined, teams: ApiTeam[], embedded?: ApiTeam | null) {
  if (embedded?.name) return embedded.name;
  if (teamId == null) return "En attente";
  return embedded?.name ?? teams.find((team) => team.id === teamId)?.name ?? `Équipe #${teamId}`;
}

function matchName(matchId: number, matches: ApiMatch[], embedded?: ApiMatch | null) {
  const match = embedded ?? matches.find((item) => item.id === matchId);
  if (!match) return `Match #${matchId}`;

  const home = match.home_team?.name ?? teamsFallback(match.home_team_id);
  const away = match.away_team?.name ?? teamsFallback(match.away_team_id);
  return `#${match.id} - ${home} vs ${away}`;
}

function teamsFallback(id?: number | null) {
  if (id == null) return "En attente";
  return `Équipe #${id}`;
}

function isStarter(value: boolean | number) {
  return value === true || value === 1;
}

function compositionIsStarter(composition: ApiComposition) {
  return composition.role === "starter" || isStarter(composition.is_starter);
}

function compositionPosition(composition: ApiComposition, players: ApiPlayer[]) {
  return composition.position || composition.player?.position || players.find((player) => player.id === composition.player_id)?.position || "-";
}

function compositionShirtNumber(composition: ApiComposition, players: ApiPlayer[]) {
  return composition.shirt_number ?? composition.player?.number ?? players.find((player) => player.id === composition.player_id)?.number ?? "-";
}

function readableCompositionError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 403) {
    return "Vous pouvez seulement gérer les compositions des tournois que vous avez créés.";
  }
  if (err instanceof ApiError && err.status === 401) {
    return "Votre session a expire. Veuillez vous reconnecter.";
  }
  return err instanceof Error ? err.message : fallback;
}

export default function MatchCompositionPage() {
  const t = useThemeTokens();
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [compositions, setCompositions] = useState<ApiComposition[]>([]);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [matchFilter, setMatchFilter] = useState(id ?? "");
  const [form, setForm] = useState<CompositionForm>(() => ({
    ...emptyForm,
    match_game_id: id ?? "",
  }));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedMatch = useMemo(
    () => matches.find((match) => String(match.id) === (form.match_game_id || matchFilter)),
    [matches, form.match_game_id, matchFilter],
  );

  const teamOptions = useMemo(() => {
    if (!selectedMatch) return teams;
    const allowed = new Set([selectedMatch.home_team_id, selectedMatch.away_team_id]);
    return teams.filter((team) => allowed.has(team.id));
  }, [selectedMatch, teams]);

  const loadData = async (activeMatchFilter = matchFilter) => {
    setLoading(true);
    setError("");

    try {
      const params = activeMatchFilter ? { match_game_id: activeMatchFilter } : undefined;
      const [compositionData, matchData, teamData, playerData] = await Promise.all([
        getCompositions(params),
        getMatches(),
        getTeams(),
        getPlayers(),
      ]);

      setCompositions(compositionData);
      setMatches(matchData);
      setTeams(teamData);
      setPlayers(playerData);
      setForm((current) => ({
        ...current,
        match_game_id: current.match_game_id || activeMatchFilter || (matchData[0]?.id ? String(matchData[0].id) : ""),
        team_id: current.team_id || (teamData[0]?.id ? String(teamData[0].id) : ""),
        player_id: current.player_id || (playerData[0]?.id ? String(playerData[0].id) : ""),
      }));
    } catch (err) {
      setError(readableCompositionError(err, "Impossible de charger les compositions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const routeMatchId = id ?? "";
    setMatchFilter(routeMatchId);
    setForm((current) => ({ ...current, match_game_id: routeMatchId || current.match_game_id }));
    void loadData(routeMatchId);
  }, [id]);

  useEffect(() => {
    if (teamOptions.length > 0 && !teamOptions.some((team) => String(team.id) === form.team_id)) {
      setForm((current) => ({ ...current, team_id: String(teamOptions[0].id) }));
    }
  }, [teamOptions, form.team_id]);

  const updateForm = (key: keyof CompositionForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: CompositionPayload = {
      match_game_id: Number(form.match_game_id),
      team_id: Number(form.team_id),
      player_id: Number(form.player_id),
      role: form.is_starter ? "starter" : "substitute",
      is_starter: form.is_starter,
      position: form.position.trim() || undefined,
      shirt_number: form.shirt_number ? Number(form.shirt_number) : undefined,
    };

    try {
      await createComposition(payload);
      setSuccess("Composition créée.");
      setForm((current) => ({
        ...emptyForm,
        match_game_id: current.match_game_id,
        team_id: current.team_id,
        player_id: current.player_id,
      }));
      await loadData(matchFilter);
    } catch (err) {
      setError(readableCompositionError(err, "Impossible de créer la composition."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (composition: ApiComposition) => {
    if (!window.confirm(`Supprimer la composition #${composition.id} ?`)) return;

    setDeletingId(composition.id);
    setError("");
    setSuccess("");

    try {
      await deleteComposition(composition.id);
      setSuccess("Composition supprimee.");
      await loadData(matchFilter);
    } catch (err) {
      setError(readableCompositionError(err, "Impossible de supprimer la composition."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleApplyFilter = () => {
    setSuccess("");
    void loadData(matchFilter);
  };

  const handleResetFilter = () => {
    setMatchFilter("");
    setSuccess("");
    void loadData("");
  };

  return (
    <>
      <XPageMeta title="Composition" description="Compositions des matchs" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Match" desc="Composition enregistrée" className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <div>
                <label htmlFor="composition-match-filter" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match</label>
                <select
                  id="composition-match-filter"
                  name="match_filter"
                  value={matchFilter}
                  onChange={(event) => {
                    setMatchFilter(event.target.value);
                    setForm((current) => ({ ...current, match_game_id: event.target.value || current.match_game_id }));
                  }}
                  disabled={loading}
                  className={clsx(
                    "w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none",
                    t.border,
                    t.metricBg,
                    t.textPrimary,
                  )}
                >
                  <option value="">Tous les matchs</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {matchName(match.id, matches, match)}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="button" onClick={handleApplyFilter} disabled={loading}>
                Charger
              </Button>
              <Button type="button" variant="secondary" onClick={handleResetFilter} disabled={loading}>
                Réinitialiser
              </Button>
            </div>
          </ComponentCard>

          <ComponentCard title="Compte connecté" desc={user ? `${user.email} - ${user.role}` : "Accès public"}>
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Compositions</p>
              <p className={clsx("mt-1 text-3xl font-bold", t.textPrimary)}>{compositions.length}</p>
              <p className={clsx("mt-2 text-sm", t.textSecondary)}>
                {matchFilter ? matchName(Number(matchFilter), matches) : "Tous les matchs"}
              </p>
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title="Ajouter un joueur" desc={user ? `${user.email} - ${user.role}` : "Connexion requise"}>
          {!isAuthenticated && !authLoading ? (
            <p className={clsx("text-sm", t.textSecondary)}>
              La connexion est requise pour ajouter des compositions. Les compositions publiques restent visibles.
            </p>
          ) : (
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-6">
              <div className="md:col-span-2">
                <label htmlFor="composition-match" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Match *</label>
                <select
                  id="composition-match"
                  name="match_game_id"
                  value={form.match_game_id}
                  onChange={(event) => updateForm("match_game_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Sélectionner un match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {matchName(match.id, matches, match)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="composition-team" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Équipe *</label>
                <select
                  id="composition-team"
                  name="team_id"
                  value={form.team_id}
                  onChange={(event) => updateForm("team_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Sélectionner une équipe</option>
                  {teamOptions.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="composition-player" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Joueur *</label>
                <select
                  id="composition-player"
                  name="player_id"
                  value={form.player_id}
                  onChange={(event) => updateForm("player_id", event.target.value)}
                  required
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="">Sélectionner un joueur</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {playerLabel(player.id, players, player)} - Équipe #{player.team_id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="composition-position" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Poste</label>
                <input
                  id="composition-position"
                  name="position"
                  type="text"
                  value={form.position}
                  onChange={(event) => updateForm("position", event.target.value)}
                  disabled={submitting || loading}
                  placeholder="ST"
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>

              <div>
                <label htmlFor="composition-shirt-number" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Numéro de maillot</label>
                <input
                  id="composition-shirt-number"
                  name="shirt_number"
                  type="number"
                  min={0}
                  value={form.shirt_number}
                  onChange={(event) => updateForm("shirt_number", event.target.value)}
                  disabled={submitting || loading}
                  className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                />
              </div>

              <label htmlFor="composition-is-starter" className={clsx("flex items-center gap-3 rounded-sm border px-4 py-2.5 md:col-span-2", t.border, t.metricBg)}>
                <input
                  id="composition-is-starter"
                  name="is_starter"
                  type="checkbox"
                  checked={form.is_starter}
                  onChange={(event) => updateForm("is_starter", event.target.checked)}
                  disabled={submitting || loading}
                  className="rounded border-zinc-600 bg-transparent text-brand-500 focus:ring-brand-500/30"
                />
                <span className={clsx("text-sm", t.textSecondary)}>Titulaire</span>
              </label>

              <div className="flex items-end md:col-span-4">
                <Button type="submit" disabled={submitting || loading || matches.length === 0 || teams.length === 0 || players.length === 0}>
                  {submitting ? "Enregistrement..." : "Ajouter la composition"}
                </Button>
              </div>
            </form>
          )}

          {(success || error) && (
            <div
              className={clsx(
                "mt-4 rounded-sm border px-4 py-3 text-sm",
                error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
              )}
            >
              {error || success}
            </div>
          )}
        </ComponentCard>

        <ComponentCard title="Liste des compositions" desc="Données enregistrées">
          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des compositions...</p>
          )}

          {!loading && !error && compositions.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          )}

          {!loading && compositions.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[1160px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[20%]" />
                  <col className="w-[17%]" />
                  <col className="w-[18%]" />
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Équipe</th>
                    <th className="px-4 py-3">Joueur</th>
                    <th className="px-4 py-3">Titulaire</th>
                    <th className="px-4 py-3">Poste</th>
                    <th className="px-4 py-3">Maillot</th>
                    <th className="px-4 py-3">Création</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {compositions.map((composition) => {
                    const embeddedMatch = composition.matchGame ?? composition.match_game;
                    return (
                      <tr key={composition.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                        <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{composition.id}</td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>
                          <span className="block truncate" title={matchName(composition.match_game_id, matches, embeddedMatch)}>
                            {matchName(composition.match_game_id, matches, embeddedMatch)}
                          </span>
                        </td>
                        <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                          <span className="block truncate" title={teamName(composition.team_id, teams, composition.team)}>
                            {teamName(composition.team_id, teams, composition.team)}
                          </span>
                        </td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>
                          <span className="block truncate" title={playerLabel(composition.player_id, players, composition.player)}>
                            {playerLabel(composition.player_id, players, composition.player)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={compositionIsStarter(composition) ? "success" : "info"}>
                            {compositionIsStarter(composition) ? "Titulaire" : "Remplacant"}
                          </Badge>
                        </td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>{compositionPosition(composition, players)}</td>
                        <td className={clsx("px-4 py-3 font-mono tabular-nums", t.textSecondary)}>
                          {compositionShirtNumber(composition, players)}
                        </td>
                        <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>
                          {formatDate(composition.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Button type="button" size="sm" variant="danger" disabled={deletingId === composition.id} onClick={() => handleDelete(composition)}>
                            {deletingId === composition.id ? "Suppression..." : "Supprimer"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>

        <div>
          <Link to="/matches" className="text-sm font-medium text-brand-500 hover:text-brand-400">
            Retour aux matchs
          </Link>
        </div>
      </PageStack>
    </>
  );
}
