import { useParams, Link } from "react-router";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { compositions } from "../../components/data/mockData";
import { useSeasonData } from "../../components/context/SeasonContext";

export default function MatchCompositionPage() {
  const t = useThemeTokens();
  const { getMatchById, getTeamById, getPlayersByTeam, formatPlayerName } = useSeasonData();
  const { id } = useParams();
  const match = getMatchById(Number(id));
  const home = match ? getTeamById(match.home_team_id) : undefined;
  const away = match ? getTeamById(match.away_team_id) : undefined;
  const matchCompositions = compositions.filter((c) => c.match_game_id === Number(id));

  if (!match || !home || !away) {
    return (
      <div className={clsx("text-center", t.textMuted)}>
        Match introuvable. <Link to="/matches" className="text-brand-500">Retour</Link>
      </div>
    );
  }

  const renderTeamComposition = (teamId: number, teamName: string) => {
    const teamPlayers = getPlayersByTeam(teamId);
    const selected = matchCompositions.filter((c) => c.team_id === teamId);

    return (
      <GlassCard>
        <h3 className={clsx("mb-4 text-base font-medium", t.textPrimary)}>{teamName}</h3>
        <div className="space-y-2">
          {teamPlayers.map((player) => {
            const comp = selected.find((c) => c.player_id === player.id);
            return (
              <label
                key={player.id}
                className={clsx(
                  "flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 transition-colors",
                  t.borderSubtle,
                  t.metricBg,
                  t.cardHover
                )}
              >
                <input
                  type="checkbox"
                  defaultChecked={!!comp}
                  className="rounded border-zinc-600 bg-transparent text-brand-500 focus:ring-brand-500/30"
                />
                <img src={player.photo_url} alt="" className="h-8 w-8 rounded-sm object-cover" />
                <div className="flex-1">
                  <p className={clsx("text-sm font-medium", t.textPrimary)}>{formatPlayerName(player)}</p>
                  <p className={clsx("text-xs", t.textMuted)}>{player.position} · #{player.shirt_number}</p>
                </div>
                <select
                  defaultValue={comp?.role ?? "starter"}
                  className={clsx("rounded-sm border px-2 py-1 text-xs focus:outline-none", t.border, t.metricBg, t.textPrimary)}
                >
                  <option value="starter">Titulaire</option>
                  <option value="substitute">Remplaçant</option>
                </select>
              </label>
            );
          })}
        </div>
      </GlassCard>
    );
  };

  return (
    <>
      <XPageMeta title="Composition" description="Gestion des compositions d'équipe" />
      <PageStack>
        <SectionBar action={<Button>Enregistrer</Button>} />

        <div className={clsx("grid grid-cols-1 lg:grid-cols-2", GRID_GAP)}>
          {renderTeamComposition(home.id, home.name)}
          {renderTeamComposition(away.id, away.name)}
        </div>
      </PageStack>
    </>
  );
}
