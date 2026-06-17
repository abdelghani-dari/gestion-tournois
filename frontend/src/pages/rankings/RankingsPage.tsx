import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  ApiError,
  getMyTournaments,
  getPublicTournaments,
  getRankings,
  recalculateRankings,
  type ApiRanking,
  type MyTournament,
  type PublicTournament,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

function teamName(ranking: ApiRanking) {
  return ranking.team?.name ?? `Équipe #${ranking.team_id}`;
}

function tournamentName(tournamentId: string, tournaments: PublicTournament[]) {
  const found = tournaments.find((tournament) => String(tournament.id) === tournamentId);
  return found?.name ?? (tournamentId ? `Tournoi #${tournamentId}` : "Sélectionner un tournoi");
}

function mergeTournaments(publicTournaments: PublicTournament[], myTournaments: MyTournament[]) {
  const byId = new Map<number, PublicTournament>();

  for (const tournament of publicTournaments) {
    byId.set(tournament.id, tournament);
  }

  for (const tournament of myTournaments) {
    if (!byId.has(tournament.id)) {
      byId.set(tournament.id, tournament);
    }
  }

  return Array.from(byId.values());
}

function readableRankingError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 403) {
    return "Vous pouvez seulement recalculer les classements des tournois que vous avez créés.";
  }
  if (err instanceof ApiError && err.status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }
  return err instanceof Error ? err.message : fallback;
}

export default function RankingsPage() {
  const t = useThemeTokens();
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<PublicTournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(id ?? "");
  const [rankings, setRankings] = useState<ApiRanking[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tournamentOptions = useMemo(
    () => mergeTournaments(publicTournaments, myTournaments),
    [publicTournaments, myTournaments],
  );

  useEffect(() => {
    let active = true;

    async function loadTournaments() {
      setLoadingTournaments(true);
      setError("");

      try {
        const publicData = await getPublicTournaments();
        const myData = isAuthenticated ? await getMyTournaments() : [];

        if (!active) return;

        setPublicTournaments(publicData);
        setMyTournaments(myData);

        const merged = mergeTournaments(publicData, myData);
        setSelectedTournamentId((current) => current || (merged[0]?.id ? String(merged[0].id) : ""));
      } catch (err) {
        if (!active) return;
        setError(readableRankingError(err, "Impossible de charger les tournois."));
      } finally {
        if (active) setLoadingTournaments(false);
      }
    }

    if (!authLoading) {
      void loadTournaments();
    }

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (id) {
      setSelectedTournamentId(id);
    }
  }, [id]);

  const loadRankings = async () => {
    if (!selectedTournamentId) {
      setError("Sélectionnez d'abord un tournoi.");
      return;
    }

    setLoadingRankings(true);
    setError("");
    setSuccess("");

    try {
      const data = await getRankings(selectedTournamentId);
      setRankings(data);
    } catch (err) {
      setRankings([]);
      setError(readableRankingError(err, "Impossible de charger le classement."));
    } finally {
      setLoadingRankings(false);
    }
  };

  const handleRecalculate = async () => {
    if (!selectedTournamentId) {
      setError("Sélectionnez d'abord un tournoi.");
      return;
    }

    setRecalculating(true);
    setError("");
    setSuccess("");

    try {
      await recalculateRankings(selectedTournamentId);
      setSuccess("Classement recalculé.");
      const data = await getRankings(selectedTournamentId);
      setRankings(data);
    } catch (err) {
      setError(readableRankingError(err, "Impossible de recalculer le classement."));
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <>
      <XPageMeta title="Classements" description="Classements des tournois locaux" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Tournoi" desc="Classement public par tournoi" className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <div>
                <label htmlFor="rankings-tournament" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Tournoi</label>
                <select
                  id="rankings-tournament"
                  name="tournament_id"
                  value={selectedTournamentId}
                  onChange={(event) => {
                    setSelectedTournamentId(event.target.value);
                    setRankings([]);
                    setSuccess("");
                    setError("");
                  }}
                  disabled={loadingTournaments}
                  className={clsx(
                    "w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none",
                    t.border,
                    t.metricBg,
                    t.textPrimary,
                  )}
                >
                  <option value="">Sélectionner un tournoi</option>
                  {tournamentOptions.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      #{tournament.id} - {tournament.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                onClick={loadRankings}
                disabled={loadingTournaments || loadingRankings || !selectedTournamentId}
              >
                {loadingRankings ? "Chargement..." : "Charger le classement"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleRecalculate}
                disabled={!isAuthenticated || loadingTournaments || recalculating || !selectedTournamentId}
                title={!isAuthenticated ? "Connexion requise" : undefined}
              >
                {recalculating ? "Recalcul..." : "Recalculer le classement"}
              </Button>
            </div>

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

            {!isAuthenticated && !authLoading && (
              <p className={clsx("mt-3 text-sm", t.textMuted)}>
                Le classement public est consultable sans connexion. La connexion est requise pour recalculer.
              </p>
            )}
          </ComponentCard>

          <ComponentCard title="Session" desc={user ? `${user.email} - ${user.role}` : "Accès public"}>
            <div className={clsx("rounded-md border p-4", t.card)}>
              <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Tournoi selectionne</p>
              <p className={clsx("mt-1 truncate text-lg font-semibold", t.textPrimary)}>
                {tournamentName(selectedTournamentId, tournamentOptions)}
              </p>
              <p className={clsx("mt-2 text-sm", t.textSecondary)}>
                {rankings.length} ligne{rankings.length === 1 ? "" : "s"} de classement
              </p>
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title="Table de classement" desc="Données enregistrées">
          {loadingTournaments && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement des tournois...</p>
          )}

          {!loadingTournaments && loadingRankings && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Chargement du classement...</p>
          )}

          {!loadingTournaments && !loadingRankings && rankings.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucun classement disponible.</p>
          )}

          {!loadingRankings && rankings.length > 0 && (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[920px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[86px]" />
                  <col className="w-[24%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Équipe</th>
                    <th className="px-4 py-3">Joués</th>
                    <th className="px-4 py-3">Victoires</th>
                    <th className="px-4 py-3">Nuls</th>
                    <th className="px-4 py-3">Défaites</th>
                    <th className="px-4 py-3">Buts pour</th>
                    <th className="px-4 py-3">Buts contre</th>
                    <th className="px-4 py-3">Différence</th>
                    <th className="px-4 py-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking, index) => (
                    <tr key={ranking.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className="px-4 py-3">
                        <span className={clsx("font-mono font-bold", index < 3 ? "text-amber-400" : t.textMuted)}>
                          {index + 1}
                        </span>
                      </td>
                      <td className={clsx("px-4 py-3 font-medium", t.textPrimary)}>
                        <span className="block truncate" title={teamName(ranking)}>
                          {teamName(ranking)}
                        </span>
                      </td>
                      <td className={clsx("px-4 py-3 tabular-nums", t.textSecondary)}>{ranking.played}</td>
                      <td className="px-4 py-3 tabular-nums text-emerald-500">{ranking.wins}</td>
                      <td className={clsx("px-4 py-3 tabular-nums", t.textSecondary)}>{ranking.draws}</td>
                      <td className="px-4 py-3 tabular-nums text-red-400">{ranking.losses}</td>
                      <td className={clsx("px-4 py-3 tabular-nums", t.textSecondary)}>{ranking.goals_for}</td>
                      <td className={clsx("px-4 py-3 tabular-nums", t.textSecondary)}>{ranking.goals_against}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className={ranking.goal_difference >= 0 ? "text-emerald-500" : "text-red-400"}>
                          {ranking.goal_difference > 0 ? "+" : ""}
                          {ranking.goal_difference}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-brand-500">{ranking.points}</td>
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
