import {
  teams as allTeams,
  players as allPlayers,
  buildRankingsFromPlayers,
  topScorers as allTopScorers,
  BOTOLA_LOGO,
} from "./fotmobData";
import type {
  Season,
  Championship,
  Tournament,
  MatchGame,
  Statistic,
  Team,
  Player,
  Ranking,
} from "../types";

export const APP_NAME = "Gestion Tournois";

export const allSeasons: Season[] = [
  { id: 1, name: "Saison 2025-2026", start_date: "2025-08-01", end_date: "2026-06-30", status: "active" },
  { id: 2, name: "Saison 2024-2025", start_date: "2024-08-01", end_date: "2025-06-30", status: "completed" },
];

const allChampionships: Championship[] = [
  {
    id: 1,
    season_id: 1,
    name: "Botola Pro",
    description: "Championnat national de première division",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 3,
    season_id: 1,
    name: "Botola 2",
    description: "Deuxième division nationale",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 4,
    season_id: 1,
    name: "Championnat U21",
    description: "Compétition des équipes de réserve",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 2,
    season_id: 2,
    name: "Botola Pro",
    description: "Championnat national — saison clôturée",
    status: "completed",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 5,
    season_id: 2,
    name: "Botola 2",
    description: "Deuxième division — saison clôturée",
    status: "completed",
    logo_url: BOTOLA_LOGO,
  },
];

const allTournaments: Tournament[] = [
  {
    id: 1,
    season_id: 1,
    name: "Coupe du Trône",
    description: "Élimination directe",
    start_date: "2025-12-01",
    end_date: "2026-05-15",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 4,
    season_id: 1,
    name: "Super Coupe",
    description: "Match d'ouverture de saison",
    start_date: "2025-08-15",
    end_date: "2025-08-15",
    status: "completed",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 5,
    season_id: 1,
    name: "Tournoi Amical",
    description: "Préparation estivale",
    start_date: "2025-07-01",
    end_date: "2025-07-20",
    status: "completed",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 3,
    season_id: 2,
    name: "Coupe du Trône",
    description: "Édition 2024-2025",
    start_date: "2024-12-01",
    end_date: "2025-05-10",
    status: "completed",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 6,
    season_id: 2,
    name: "Super Coupe",
    description: "Édition 2024-2025",
    start_date: "2024-08-10",
    end_date: "2024-08-10",
    status: "completed",
    logo_url: BOTOLA_LOGO,
  },
];

function buildMatchesForSeason(seasonTeams: Team[], seasonId: number): MatchGame[] {
  const pool = seasonTeams;
  const pairs: [number, number][] =
    seasonId === 2
      ? [[0, 1], [2, 3], [4, 5], [0, 3], [1, 4]]
      : [[0, 1], [2, 3], [4, 5], [6, 7], [1, 4], [0, 5], [3, 6], [2, 7]];

  return pairs.flatMap(([hi, ai], i): MatchGame[] => {
    const home = pool[hi];
    const away = pool[ai];
    if (!home || !away) {
      return [];
    }
    const completed = seasonId === 2 ? i < 3 : i < 4;
    return [
      {
        id: seasonId * 100 + i + 1,
        championship_id: seasonId === 1 ? 1 : 2,
        tournament_id: null,
        home_team_id: home.id,
        away_team_id: away.id,
        match_date: new Date(seasonId === 1 ? 2026 : 2025, 5, 20 - i, 16 + (i % 3) * 2, i % 2 === 0 ? 0 : 30).toISOString(),
        home_score: completed ? Math.floor(Math.random() * 3) + 1 : null,
        away_score: completed ? Math.floor(Math.random() * 3) : null,
        status: completed ? ("completed" as const) : ("scheduled" as const),
      },
    ];
  });
}

export interface SeasonSnapshot {
  season: Season;
  teams: Team[];
  players: Player[];
  championships: Championship[];
  tournaments: Tournament[];
  matches: MatchGame[];
  rankings: Ranking[];
  topScorers: Player[];
  statistics: Statistic[];
}

export function buildSeasonSnapshot(seasonId: number): SeasonSnapshot {
  const season = allSeasons.find((s) => s.id === seasonId) ?? allSeasons[0];
  const teamLimit = seasonId === 2 ? 10 : allTeams.length;
  const seasonTeams = allTeams.slice(0, teamLimit);
  const teamIds = new Set(seasonTeams.map((t) => t.id));
  const seasonPlayers = allPlayers.filter((p) => teamIds.has(p.team_id));

  const rankings = buildRankingsFromPlayers()
    .filter((r) => teamIds.has(r.team_id))
    .map((r, i) => ({ ...r, id: i + 1 }));

  const matches = buildMatchesForSeason(seasonTeams, seasonId);

  const statistics: Statistic[] = seasonPlayers
    .filter((p) => p.goals > 0 || p.assists > 0 || p.ycards > 0)
    .slice(0, seasonId === 2 ? 24 : 40)
    .flatMap((p, i) => {
      const stats: Statistic[] = [];
      if (p.goals > 0) stats.push({ id: i * 3 + 1, match_game_id: matches[0]?.id ?? 1, team_id: p.team_id, player_id: p.id, stat_type: "buts", value: p.goals });
      if (p.assists > 0) stats.push({ id: i * 3 + 2, match_game_id: matches[0]?.id ?? 1, team_id: p.team_id, player_id: p.id, stat_type: "passes_decisives", value: p.assists });
      if (p.ycards > 0) stats.push({ id: i * 3 + 3, match_game_id: matches[0]?.id ?? 1, team_id: p.team_id, player_id: p.id, stat_type: "cartons_jaunes", value: p.ycards });
      return stats;
    });

  const topScorers = allTopScorers.filter((p) => teamIds.has(p.team_id));

  return {
    season,
    teams: seasonTeams,
    players: seasonPlayers,
    championships: allChampionships.filter((c) => c.season_id === seasonId),
    tournaments: allTournaments.filter((t) => t.season_id === seasonId),
    matches,
    rankings,
    topScorers,
    statistics,
  };
}
