import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getRankings,
  getTournament,
  getTournamentMatches,
  type ApiMatch,
  type ApiRanking,
  type PublicTournament,
} from "../../api";
import MatchRowList from "../../components/matches/MatchRowList";
import RankingPreviewTable from "../../components/dashboard/RankingPreviewTable";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import { XPageMeta } from "../../components/common/PageMeta";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { AngleLeftIcon } from "../../icons";
import LandingNav from "../../components/landing/LandingNav";

function formatDate(date?: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isAccepted(tournament: PublicTournament) {
  return !tournament.approval_status || ["accepted", "approved"].includes(tournament.approval_status);
}

function StatusBadge({ value }: { value?: string | null }) {
  const tone = statusTone(value) || "bg-zinc-800 text-zinc-300";

  return (
    <span className={`inline-flex rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
      {statusLabel(value)}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-zinc-900 bg-zinc-950/70 p-4">
      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-semibold text-zinc-100" title={value || "-"}>
        {value || "-"}
      </p>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-50">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<PublicTournament | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [rankings, setRankings] = useState<ApiRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchesError, setMatchesError] = useState("");
  const [rankingsError, setRankingsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTournament() {
      if (!id) {
        setError("Tournoi introuvable.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setMatchesError("");
      setRankingsError("");

      try {
        const details = await getTournament(id);

        if (!isAccepted(details)) {
          throw new Error("Ce tournoi n'est pas disponible publiquement.");
        }

        const [matchesResult, rankingsResult] = await Promise.allSettled([
          getTournamentMatches(id),
          getRankings(id),
        ]);

        if (!active) return;

        setTournament(details);
        setMatches(matchesResult.status === "fulfilled" ? matchesResult.value : details.matches ?? []);
        setRankings(rankingsResult.status === "fulfilled" ? rankingsResult.value : details.rankings ?? []);

        if (matchesResult.status === "rejected") {
          setMatchesError(
            matchesResult.reason instanceof Error
              ? matchesResult.reason.message
              : "Impossible de charger les matchs.",
          );
        }

        if (rankingsResult.status === "rejected") {
          setRankingsError(
            rankingsResult.reason instanceof Error
              ? rankingsResult.reason.message
              : "Impossible de charger le classement.",
          );
        }
      } catch (err) {
        if (!active) return;
        setTournament(null);
        setMatches([]);
        setRankings([]);
        setError(err instanceof Error ? err.message : "Impossible de charger le tournoi.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTournament();

    return () => {
      active = false;
    };
  }, [id]);

  const teams = useMemo(() => tournament?.teams ?? [], [tournament]);

  return (
    <>
      <XPageMeta
        title={tournament?.name ?? "Tournoi"}
        description={tournament?.description ?? "Details publics du tournoi"}
      />

      <div className="min-h-screen bg-[#050507] font-sans text-zinc-400">
        <LandingNav />

        <main className="mx-auto max-w-7xl px-6 pb-20 pt-24">
          <Link
            to="/#public-tournaments"
            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <AngleLeftIcon className="size-4" />
            Retour aux tournois
          </Link>

          {loading && (
            <div className="rounded-md border border-zinc-900 bg-zinc-950/70 px-6 py-16 text-center text-sm text-zinc-500">
              Chargement du tournoi...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-6 py-5 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && tournament && (
            <div className="space-y-8">
              <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
                <EntityImage
                  src={tournament.banner_path}
                  name={tournament.name}
                  className="min-h-72 w-full rounded-md border border-zinc-900 bg-brand-500/10 lg:min-h-[420px]"
                />

                <div className="flex flex-col justify-between rounded-md border border-zinc-900 bg-zinc-950/70 p-6">
                  <div>
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <StatusBadge value={tournament.status} />
                      <StatusBadge value={tournament.approval_status} />
                    </div>

                    <h1 className="text-3xl font-black uppercase italic leading-tight tracking-tight text-zinc-50 md:text-5xl">
                      {tournament.name}
                    </h1>

                    <p className="mt-5 text-sm leading-relaxed text-zinc-500">
                      {tournament.description || "Aucune description publique pour ce tournoi."}
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoTile label="Ville" value={tournament.city} />
                    <InfoTile label="Lieu" value={tournament.location} />
                    <InfoTile label="Debut" value={formatDate(tournament.start_date)} />
                    <InfoTile label="Fin" value={formatDate(tournament.end_date)} />
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoTile label="Equipes" value={String(teams.length)} />
                <InfoTile label="Matchs" value={String(matches.length)} />
                <InfoTile label="Classement" value={`${rankings.length} ligne${rankings.length > 1 ? "s" : ""}`} />
              </section>

              <section className="rounded-md border border-zinc-900 bg-zinc-950/60 p-6">
                <SectionHeader
                  title="Equipes"
                  description="Equipes rattachees au tournoi quand elles sont retournees par l'API."
                />

                {teams.length === 0 ? (
                  <p className="rounded-sm border border-zinc-900 bg-zinc-950/70 px-4 py-8 text-center text-sm text-zinc-500">
                    Aucune equipe retournee pour ce tournoi.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center gap-4 rounded-md border border-zinc-900 bg-zinc-950/70 p-4">
                        <EntityImage src={team.logo_path} name={team.name} className="h-14 w-14 shrink-0 rounded-sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-zinc-100" title={team.name}>{team.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {team.city || "Ville non renseignee"}
                            {team.players_count != null ? ` - ${team.players_count} joueurs` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <ComponentCard title="Matchs" desc="Matchs publics planifiés ou joués">
                {matchesError && (
                  <div className="mb-4 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{matchesError}</div>
                )}
                {matches.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500">Aucun match disponible.</p>
                ) : (
                  <MatchRowList matches={matches} teams={teams} compact />
                )}
              </ComponentCard>

              <ComponentCard title="Classement" desc="Classement public calculé">
                {rankingsError && (
                  <div className="mb-4 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{rankingsError}</div>
                )}
                {rankings.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500">Aucun classement disponible.</p>
                ) : (
                  <RankingPreviewTable rankings={rankings} limit={20} />
                )}
              </ComponentCard>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
