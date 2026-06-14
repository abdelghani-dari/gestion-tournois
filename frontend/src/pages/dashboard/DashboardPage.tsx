import { Link } from "react-router";
import { clsx } from "clsx";
import { useMemo } from "react";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import ProgressLine from "../../components/common/ProgressLine";
import TournamentMetrics from "../../components/widgets/TournamentMetrics";
import GoalsLineChart from "../../components/charts/GoalsLineChart";
import MatchBarChart from "../../components/charts/MatchBarChart";
import RecentMatchesTable from "../../components/widgets/RecentMatchesTable";
import TopScorersCard from "../../components/widgets/TopScorersCard";
import RankingPreviewTable from "../../components/widgets/RankingPreviewTable";
import {
  ChampionshipPreviewList,
  TournamentPreviewList,
} from "../../components/widgets/CompetitionPreviewList";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useSeasonData } from "../../components/context/SeasonContext";

const SEASON_PROGRESS = 68;
const MATCHDAYS_PLAYED = 22;
const MATCHDAYS_TOTAL = 30;
const RECENT_MATCHES_LIMIT = 4;

export default function DashboardPage() {
  const t = useThemeTokens();
  const { matches, season } = useSeasonData();

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
      ),
    [matches]
  );

  const hasMoreMatches = sortedMatches.length > RECENT_MATCHES_LIMIT;
  const completedCount = matches.filter((m) => m.status === "completed").length;
  const scheduledCount = matches.filter((m) => m.status === "scheduled").length;
  const seasonLabel = season.name.replace("Saison ", "");

  return (
    <>
      <XPageMeta title="Dashboard" description="Vue générale de l'application" />
      <PageStack>
        <TournamentMetrics />

        <div className={clsx("grid grid-cols-12 items-stretch", GRID_GAP)}>
          {/* Row 1 — Stats + Top scorers */}
          <div className="col-span-12 flex xl:col-span-8">
            <ComponentCard
              fill
              title="Statistiques de la saison"
              desc="Buts marqués vs encaissés par mois"
            >
              <GoalsLineChart />
            </ComponentCard>
          </div>

          <div className="col-span-12 flex xl:col-span-4">
            <ComponentCard
              fill
              title="Meilleurs buteurs"
              desc="Top 5 de la saison"
              action={
                <Link to="/players" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                  Voir plus →
                </Link>
              }
            >
              <TopScorersCard fill />
            </ComponentCard>
          </div>

          {/* Row 2 — Recent matches + Progression */}
          <div className="col-span-12 flex xl:col-span-8">
            <ComponentCard
              fill
              title="Derniers matchs"
              desc="Résultats récents"
              action={
                hasMoreMatches ? (
                  <Link to="/matches" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                    Voir plus →
                  </Link>
                ) : undefined
              }
            >
              <RecentMatchesTable limit={RECENT_MATCHES_LIMIT} fill />
            </ComponentCard>
          </div>

          <div className="col-span-12 flex xl:col-span-4">
            <ComponentCard fill title="Progression" desc={seasonLabel}>
              <div className="flex flex-1 flex-col justify-between gap-5">
                <ProgressLine
                  value={SEASON_PROGRESS}
                  label="Saison complétée"
                  sublabel={`${MATCHDAYS_PLAYED} / ${MATCHDAYS_TOTAL} journées jouées`}
                />
                <div className={clsx("grid grid-cols-2 gap-3 border-t pt-4", t.border)}>
                  <div className={clsx("rounded-md px-3 py-3 text-center", t.metricBg)}>
                    <p className="text-lg font-bold tabular-nums text-emerald-400">{completedCount}</p>
                    <p className={clsx("mt-0.5 text-xs", t.textMuted)}>Matchs joués</p>
                  </div>
                  <div className={clsx("rounded-md px-3 py-3 text-center", t.metricBg)}>
                    <p className="text-lg font-bold tabular-nums text-brand-400">{scheduledCount}</p>
                    <p className={clsx("mt-0.5 text-xs", t.textMuted)}>À venir</p>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>

        <ComponentCard
          title="Classement"
          desc={`Top 10 · ${seasonLabel}`}
          action={
            <Link to="/rankings" className="text-xs font-medium text-brand-500 hover:text-brand-400">
              Voir plus →
            </Link>
          }
        >
          <RankingPreviewTable limit={10} />
        </ComponentCard>

        <ComponentCard title="Forme des équipes" desc="Victoires / Nuls / Défaites">
          <MatchBarChart fullWidth embedded />
        </ComponentCard>

        <div className={clsx("grid grid-cols-1 items-stretch lg:grid-cols-2", GRID_GAP)}>
          <ComponentCard
            title="Championnats"
            desc={seasonLabel}
            action={
              <Link to="/championships" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                Voir plus →
              </Link>
            }
          >
            <ChampionshipPreviewList />
          </ComponentCard>

          <ComponentCard
            title="Tournois"
            desc={seasonLabel}
            action={
              <Link to="/tournaments" className="text-xs font-medium text-brand-500 hover:text-brand-400">
                Voir plus →
              </Link>
            }
          >
            <TournamentPreviewList />
          </ComponentCard>
        </div>
      </PageStack>
    </>
  );
}
