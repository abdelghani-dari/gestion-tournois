import { Link } from "react-router";
import { clsx } from "clsx";
import ComponentCard from "../../components/common/ComponentCard";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import TournamentMetrics from "../../components/widgets/TournamentMetrics";
import TopScorersCard from "../../components/widgets/TopScorersCard";
import RecentMatchesTable from "../../components/widgets/RecentMatchesTable";
import RankingPreviewTable from "../../components/widgets/RankingPreviewTable";
import GoalsLineChart from "../../components/charts/GoalsLineChart";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useSeasonData } from "../../components/context/SeasonContext";

const RECENT_MATCHES_LIMIT = 4;

export default function LandingDashboardPreview() {
  const t = useThemeTokens();
  const { matches, season } = useSeasonData();
  const seasonLabel = season.name.replace("Saison ", "");
  const hasMoreMatches = matches.length > RECENT_MATCHES_LIMIT;

  return (
    <PageStack className="max-w-7xl mx-auto">
      <div className="text-center space-y-3 mb-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-400">
          Aperçu en direct
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Le dashboard en action
        </h2>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          Statistiques, classements et matchs récents — les mêmes widgets que dans votre espace
          administrateur, alimentés par les données de la {seasonLabel}.
        </p>
      </div>

      <TournamentMetrics />

      <div className={clsx("grid grid-cols-12 items-stretch", GRID_GAP)}>
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
          <ComponentCard fill title="Accès rapide" desc="Explorez l'application">
            <div className="flex flex-1 flex-col justify-center gap-3">
              {[
                { label: "Tableau de bord complet", to: "/dashboard" },
                { label: "Classements", to: "/rankings" },
                { label: "Calendrier des matchs", to: "/matches" },
                { label: "Gestion des équipes", to: "/teams" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    "flex items-center justify-between rounded-md border px-4 py-3 text-sm font-medium transition-colors",
                    t.border,
                    t.metricBg,
                    t.textSecondary,
                    "hover:text-brand-400 hover:border-brand-500/30"
                  )}
                >
                  {item.label}
                  <span className="text-brand-500">→</span>
                </Link>
              ))}
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

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-mono font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(70,95,255,0.25)] hover:shadow-[0_0_35px_rgba(70,95,255,0.4)] rounded-sm"
        >
          Ouvrir le dashboard
        </Link>
        <Link
          to="/login"
          className="px-8 py-3 border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/60 text-zinc-300 hover:text-white text-[11px] font-mono font-bold tracking-widest uppercase transition-all duration-200 rounded-sm"
        >
          Se connecter
        </Link>
      </div>
    </PageStack>
  );
}
