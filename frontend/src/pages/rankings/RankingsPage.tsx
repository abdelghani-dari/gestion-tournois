import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
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
import FormSearchableSelect from "../../components/common/FormSearchableSelect";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import TableRowsSkeleton from "../../components/common/skeletons/TableRowsSkeleton";
import { resolveTeamLogo } from "../../components/common/teamAssets";
import MediaImage from "../../components/common/MediaImage";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
import { AngleRightIcon } from "../../icons";
import { tournamentSelectOptions } from "../../components/common/selectOptionBuilders";

function rankingRowStripe(index: number) {
  return index % 2 === 0 ? "bg-black/[0.008] dark:bg-white/[0.012]" : "bg-black/[0.018] dark:bg-white/[0.022]";
}

function teamName(ranking: ApiRanking) {
  return ranking.team?.name ?? `Équipe #${ranking.team_id}`;
}

function teamLogo(ranking: ApiRanking) {
  return ranking.team?.logo_path ?? null;
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

  const loadRankings = useCallback(async (tournamentId: string) => {
    if (!tournamentId) {
      setRankings([]);
      return;
    }

    setLoadingRankings(true);
    setError("");
    setSuccess("");

    try {
      const data = await getRankings(tournamentId);
      setRankings(data);
    } catch (err) {
      setRankings([]);
      setError(readableRankingError(err, "Impossible de charger le classement."));
    } finally {
      setLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    if (loadingTournaments || !selectedTournamentId) return;
    void loadRankings(selectedTournamentId);
  }, [selectedTournamentId, loadingTournaments, loadRankings]);

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
      await loadRankings(selectedTournamentId);
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
        <div className={clsx("grid grid-cols-1", GRID_GAP)}>
          <ComponentCard title="Tournoi" desc="Classement public par tournoi" className="relative z-30" bodyClassName="overflow-visible">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <FormSearchableSelect
                id="rankings-tournament"
                label="Tournoi"
                value={selectedTournamentId}
                onChange={(value) => {
                  setSelectedTournamentId(value);
                  setSuccess("");
                  setError("");
                }}
                emptyOptionLabel="Sélectionner un tournoi"
                disabled={loadingTournaments}
                options={tournamentSelectOptions(tournamentOptions, user?.id)}
              />

              <Button
                type="button"
                onClick={handleRecalculate}
                disabled={!isAuthenticated || loadingTournaments || loadingRankings || recalculating || !selectedTournamentId}
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
        </div>

        <ComponentCard title="Table de classement" desc="Données enregistrées" className="relative z-10">
          {loadingTournaments || loadingRankings ? (
            <TableRowsSkeleton rows={12} />
          ) : rankings.length === 0 ? (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          ) : (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed text-sm">
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="w-10 px-3 py-3">#</th>
                    <th className="px-3 py-3">Équipe</th>
                    <th className="w-12 px-2 py-3 text-center">MJ</th>
                    <th className="w-10 px-2 py-3 text-center">V</th>
                    <th className="w-10 px-2 py-3 text-center">N</th>
                    <th className="w-10 px-2 py-3 text-center">D</th>
                    <th className="w-12 px-2 py-3 text-center">BP</th>
                    <th className="w-12 px-2 py-3 text-center">BC</th>
                    <th className="w-14 px-2 py-3 text-center">Diff</th>
                    <th className="w-12 px-2 py-3 text-center">Pts</th>
                    <th className="w-8 px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking, index) => (
                    <tr
                      key={ranking.id}
                      className={clsx("group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.025]", rankingRowStripe(index))}
                    >
                      <td className="px-3 py-3 group-hover:rounded-l-lg">
                        <span className={clsx("font-mono font-bold tabular-nums", index < 3 ? "text-amber-400" : t.textPrimary)}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          to={`/teams/${ranking.team_id}`}
                          className={clsx("flex min-w-0 cursor-pointer items-center gap-3", t.textPrimary)}
                        >
                          <MediaImage
                            src={teamLogo(ranking)}
                            fallback={resolveTeamLogo(null)}
                            alt=""
                            className="h-7 w-7 shrink-0 object-contain"
                          />
                          <span className="truncate font-medium hover:text-brand-400" title={teamName(ranking)}>
                            {teamName(ranking)}
                          </span>
                        </Link>
                      </td>
                      <td className={clsx("px-2 py-3 text-center tabular-nums", t.textSecondary)}>{ranking.played}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-emerald-500">{ranking.wins}</td>
                      <td className={clsx("px-2 py-3 text-center tabular-nums", t.textSecondary)}>{ranking.draws}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-red-400">{ranking.losses}</td>
                      <td className={clsx("px-2 py-3 text-center tabular-nums", t.textSecondary)}>{ranking.goals_for}</td>
                      <td className={clsx("px-2 py-3 text-center tabular-nums", t.textSecondary)}>{ranking.goals_against}</td>
                      <td className="px-2 py-3 text-center tabular-nums">
                        <span className={ranking.goal_difference >= 0 ? "text-emerald-500" : "text-red-400"}>
                          {ranking.goal_difference > 0 ? "+" : ""}
                          {ranking.goal_difference}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center font-semibold tabular-nums text-brand-500">{ranking.points}</td>
                      <td className="px-2 py-3 group-hover:rounded-r-lg">
                        <Link
                          to={`/teams/${ranking.team_id}`}
                          aria-label={`Voir ${teamName(ranking)}`}
                          className={clsx("inline-flex cursor-pointer items-center justify-center opacity-40 transition-opacity group-hover:opacity-100", t.textMuted, "hover:text-brand-400")}
                        >
                          <AngleRightIcon className="size-4" />
                        </Link>
                      </td>
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
