export interface Team {
  id: number;
  name: string;
  logo_url: string;
  player_count: number;
}

export interface Player {
  id: number;
  team_id: number;
  name: string;
  shirt_number: number;
  ccode: string;
  cname: string;
  position: string;
  goals: number;
  assists: number;
  ycards: number;
  rcards: number;
  age?: number;
  birth_date: string;
  height?: number | null;
  photo_url: string;
  flag_url: string;
  role?: string;
  injured?: boolean;
}

export interface Season {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "upcoming";
}

export interface Championship {
  id: number;
  season_id: number;
  name: string;
  description: string;
  status: "active" | "completed" | "upcoming";
  logo_url?: string;
}

export interface Tournament {
  id: number;
  season_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "upcoming";
  logo_url?: string;
}

export interface MatchGame {
  id: number;
  championship_id: number | null;
  tournament_id: number | null;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
}

export interface Ranking {
  id: number;
  championship_id: number | null;
  tournament_id: number | null;
  team_id: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface Statistic {
  id: number;
  match_game_id: number;
  team_id: number;
  player_id: number;
  stat_type: string;
  value: number;
}

export interface Composition {
  id: number;
  match_game_id: number;
  team_id: number;
  player_id: number;
  role: "starter" | "substitute";
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
  avatar: string;
}
