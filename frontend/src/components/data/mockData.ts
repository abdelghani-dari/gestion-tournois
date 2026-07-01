import {
  teams,
  players,
  getTeamById,
  getPlayerById,
  getPlayersByTeam,
  formatPlayerName,
  formatDate,
  formatDateTime,
  buildRankingsFromPlayers,
  topScorers,
  BOTOLA_LOGO,
} from "./fotmobData";
import type {
  Season,
  Championship,
  Tournament,
  MatchGame,
  Statistic,
  Composition,
  User,
} from "../types";

export {
  teams,
  players,
  getTeamById,
  getPlayerById,
  getPlayersByTeam,
  formatPlayerName,
  formatDate,
  formatDateTime,
  topScorers,
  BOTOLA_LOGO,
};

export const seasons: Season[] = [
  { id: 1, name: "Saison 2025-2026", start_date: "2025-08-01", end_date: "2026-06-30", status: "active" },
  { id: 2, name: "Saison 2024-2025", start_date: "2024-08-01", end_date: "2025-06-30", status: "completed" },
];

export const championships: Championship[] = [
  {
    id: 1,
    season_id: 1,
    name: "Botola Pro",
    description: "Championnat national de première division",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
];

export const tournaments: Tournament[] = [
  {
    id: 1,
    season_id: 1,
    name: "Botola Pro",
    description: "Compétition officielle",
    start_date: "2025-08-01",
    end_date: "2026-06-30",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
  {
    id: 2,
    season_id: 1,
    name: "Coupe du Trône",
    description: "Élimination directe",
    start_date: "2025-12-01",
    end_date: "2026-05-15",
    status: "active",
    logo_url: BOTOLA_LOGO,
  },
];

const t = teams;
const matchPairs: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7], [1, 4], [0, 5], [3, 6], [2, 7],
];

export const matches: MatchGame[] = matchPairs.map(([hi, ai], i) => {
  const home = t[hi];
  const away = t[ai];
  const completed = i < 4;
  return {
    id: i + 1,
    championship_id: 1,
    tournament_id: null,
    home_team_id: home?.id ?? 0,
    away_team_id: away?.id ?? 0,
    match_date: new Date(2026, 5, 20 - i).toISOString(),
    home_score: completed ? Math.floor(Math.random() * 3) + 1 : null,
    away_score: completed ? Math.floor(Math.random() * 3) : null,
    status: completed ? "completed" : "scheduled",
  };
});

export const rankings = buildRankingsFromPlayers();

export const statistics: Statistic[] = players
  .filter((p) => p.goals > 0 || p.assists > 0 || p.ycards > 0)
  .slice(0, 40)
  .flatMap((p, i) => {
    const stats: Statistic[] = [];
    if (p.goals > 0) stats.push({ id: i * 3 + 1, match_game_id: 1, team_id: p.team_id, player_id: p.id, stat_type: "buts", value: p.goals });
    if (p.assists > 0) stats.push({ id: i * 3 + 2, match_game_id: 1, team_id: p.team_id, player_id: p.id, stat_type: "passes_decisives", value: p.assists });
    if (p.ycards > 0) stats.push({ id: i * 3 + 3, match_game_id: 1, team_id: p.team_id, player_id: p.id, stat_type: "cartons_jaunes", value: p.ycards });
    return stats;
  });

export const compositions: Composition[] = [];

export const users: User[] = [
  { id: 1, name: "Admin Sportif", email: "admin@gestion-tournois.ma", role: "admin", avatar: "/images/user/owner.jpg" },
];

export const currentUser = users[0];

export function getSeasonById(id: number) {
  return seasons.find((s) => s.id === id);
}

export function getChampionshipById(id: number) {
  return championships.find((c) => c.id === id);
}

export function getTournamentById(id: number) {
  return tournaments.find((t) => t.id === id);
}

export function getMatchById(id: number) {
  return matches.find((m) => m.id === id);
}

export const statTypeLabels: Record<string, string> = {
  buts: "Buts",
  passes_decisives: "Passes décisives",
  cartons_jaunes: "Cartons jaunes",
  cartons_rouges: "Cartons rouges",
};

export const statusLabels: Record<string, string> = {
  active: "Actif",
  completed: "Terminé",
  upcoming: "À venir",
  scheduled: "Programmé",
  live: "En direct",
  cancelled: "Annulé",
};
