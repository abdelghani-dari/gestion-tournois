import { useParams, Link } from "react-router";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useSeasonData } from "../../components/context/SeasonContext";

export default function MatchResultPage() {
  const t = useThemeTokens();
  const { getMatchById, getTeamById } = useSeasonData();
  const { id } = useParams();
  const match = getMatchById(Number(id));
  const home = match ? getTeamById(match.home_team_id) : undefined;
  const away = match ? getTeamById(match.away_team_id) : undefined;

  if (!match || !home || !away) {
    return (
      <div className={clsx("text-center", t.textMuted)}>
        Match introuvable. <Link to="/matches" className="text-brand-500">Retour</Link>
      </div>
    );
  }

  return (
    <>
      <XPageMeta title="Saisie du résultat" description="Enregistrer le score du match" />
      <PageStack>
        <GlassCard className="mx-auto w-full max-w-lg" padding="lg">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 text-center">
              <img src={home.logo_url} alt="" className="mx-auto h-16 w-16 object-contain" />
              <p className={clsx("mt-2 text-sm font-medium", t.textPrimary)}>{home.name}</p>
              <input
                type="number"
                min={0}
                defaultValue={match.home_score ?? 0}
                className={clsx("mt-3 w-20 rounded-sm border px-3 py-2 text-center text-2xl font-bold focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
            <span className={clsx("text-2xl font-bold", t.textMuted)}>—</span>
            <div className="flex-1 text-center">
              <img src={away.logo_url} alt="" className="mx-auto h-16 w-16 object-contain" />
              <p className={clsx("mt-2 text-sm font-medium", t.textPrimary)}>{away.name}</p>
              <input
                type="number"
                min={0}
                defaultValue={match.away_score ?? 0}
                className={clsx("mt-3 w-20 rounded-sm border px-3 py-2 text-center text-2xl font-bold focus:outline-none", t.border, t.metricBg, t.textPrimary)}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Statut du match</label>
            <select className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:outline-none", t.border, t.metricBg, t.textPrimary)}>
              <option value="completed">Terminé</option>
              <option value="live">En direct</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Link to="/matches">
              <Button variant="secondary">Annuler</Button>
            </Link>
            <Button>Enregistrer le résultat</Button>
          </div>
        </GlassCard>
      </PageStack>
    </>
  );
}
