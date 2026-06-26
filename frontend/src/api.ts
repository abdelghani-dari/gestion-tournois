const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE = (configuredApiUrl || "http://localhost:8000/api").replace(/\/+$/, "");
export const APP_BASE = API_BASE.replace(/\/api$/, "");

const TOKEN_KEY = "auth_token";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const maybeMessage = (data as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  return fallback;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function toFormData(payload: Record<string, unknown>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  headers.set("Accept", "application/json");

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal ?? AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw new ApiError(
      error instanceof DOMException && error.name === "TimeoutError"
        ? "Le serveur met trop de temps à répondre."
        : "Impossible de contacter le serveur.",
      0,
      error,
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new ApiError(
      getErrorMessage(data, `Request failed with status ${response.status}`),
      response.status,
      data,
    );
    console.error(`API request failed: ${endpoint} (${response.status})`, error);
    throw error;
  }

  return data as T;
}

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== "object") return [];

  const data = (response as { data?: unknown }).data;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const nestedData = (data as { data?: unknown }).data;
    if (Array.isArray(nestedData)) return nestedData as T[];
  }

  return [];
}

export type PublicTournament = {
  id: number;
  name: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  banner_path?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  approval_status?: string | null;
  teams?: ApiTeam[];
  admin_note?: string | null;
  creator?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
  created_by_user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type PublicTournamentsResponse = PublicTournament[] | { data?: PublicTournament[] };

export async function getPublicTournaments() {
  const response = await apiRequest<PublicTournamentsResponse>("/tournaments");
  return extractArray<PublicTournament>(response);
}

export type MyTournament = PublicTournament;

export type CreateTournamentPayload = {
  name: string;
  description?: string;
  city?: string;
  location?: string;
  banner_path?: string;
  banner_url?: string;
  banner?: File | null;
  start_date: string;
  end_date: string;
};

type MyTournamentsResponse = MyTournament[] | { data?: MyTournament[] };

export async function getMyTournaments() {
  const response = await apiRequest<MyTournamentsResponse>("/my-tournaments");
  return extractArray<MyTournament>(response);
}

export async function createTournament(payload: CreateTournamentPayload) {
  return apiRequest<MyTournament>("/tournaments", {
    method: "POST",
    body: toFormData(payload),
  });
}

export async function deleteTournament(id: number) {
  return apiRequest<unknown>(`/tournaments/${id}`, {
    method: "DELETE",
  });
}

export type AdminTournament = PublicTournament;

type AdminTournamentsResponse = AdminTournament[] | { data?: AdminTournament[] };

export async function getPendingTournaments() {
  const response = await apiRequest<AdminTournamentsResponse>("/admin/tournaments/pending");
  return extractArray<AdminTournament>(response);
}

export async function getAdminTournaments() {
  const response = await apiRequest<AdminTournamentsResponse>("/admin/tournaments");
  return extractArray<AdminTournament>(response);
}

export async function acceptTournament(id: number) {
  return apiRequest<AdminTournament>(`/admin/tournaments/${id}/accept`, {
    method: "PUT",
  });
}

export async function refuseTournament(id: number, admin_note?: string) {
  return apiRequest<AdminTournament>(`/admin/tournaments/${id}/refuse`, {
    method: "PUT",
    body: JSON.stringify({ admin_note: admin_note?.trim() || undefined }),
  });
}

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  account_status: "pending" | "active" | "refused" | string;
  admin_note?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
};

type AdminUsersResponse = AdminUser[] | { data?: AdminUser[] };

export async function getPendingUsers() {
  const response = await apiRequest<AdminUsersResponse>("/admin/users/pending");
  return extractArray<AdminUser>(response);
}

export async function getAdminUsers() {
  const response = await apiRequest<AdminUsersResponse>("/admin/users");
  return extractArray<AdminUser>(response);
}

export async function acceptUser(id: number) {
  return apiRequest<AdminUser>(`/admin/users/${id}/accept`, {
    method: "PUT",
  });
}

export async function refuseUser(id: number, admin_note?: string) {
  return apiRequest<AdminUser>(`/admin/users/${id}/refuse`, {
    method: "PUT",
    body: JSON.stringify({ admin_note: admin_note?.trim() || undefined }),
  });
}

export type ApiTeam = {
  id: number;
  manager_id?: number | null;
  name: string;
  short_name?: string | null;
  logo_path?: string | null;
  city?: string | null;
  created_at?: string | null;
  players_count?: number;
  players?: ApiPlayer[];
  manager?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

export type TeamPayload = {
  name: string;
  short_name?: string;
  logo_path?: string;
  logo_url?: string;
  logo?: File | null;
  city?: string;
  manager_id?: number | "";
};

type TeamsResponse = ApiTeam[] | { data?: ApiTeam[] };

export async function getMyTeams() {
  const response = await apiRequest<TeamsResponse>("/my-teams");
  return extractArray<ApiTeam>(response);
}

export async function getTeams() {
  const response = await apiRequest<TeamsResponse>("/teams");
  return extractArray<ApiTeam>(response);
}

export async function getAdminTeams() {
  const response = await apiRequest<TeamsResponse>("/admin/teams");
  return extractArray<ApiTeam>(response);
}

export async function getAdminTeam(id: number | string) {
  return apiRequest<ApiTeam>(`/admin/teams/${id}`);
}

export async function createAdminTeam(payload: TeamPayload) {
  return apiRequest<ApiTeam>("/admin/teams", {
    method: "POST",
    body: toFormData({
      ...payload,
      manager_id: payload.manager_id || undefined,
    }),
  });
}

export async function createTeam(payload: TeamPayload) {
  return apiRequest<ApiTeam>("/teams", {
    method: "POST",
    body: toFormData(payload),
  });
}

export async function updateTeam(id: number, payload: TeamPayload) {
  return apiRequest<ApiTeam>(`/teams/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeam(id: number) {
  return apiRequest<unknown>(`/teams/${id}`, {
    method: "DELETE",
  });
}

export type ApiPlayer = {
  id: number;
  team_id: number;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  position?: string | null;
  number?: number | null;
  photo_path?: string | null;
  created_at?: string | null;
  team?: ApiTeam | null;
};

export type PlayerPayload = {
  team_id: number;
  first_name: string;
  last_name: string;
  birth_date?: string;
  position?: string;
  number?: number;
  photo_path?: string;
  photo_url?: string;
  photo?: File | null;
};

type PlayersResponse = ApiPlayer[] | { data?: ApiPlayer[] };

export async function getPlayers() {
  const response = await apiRequest<PlayersResponse>("/players");
  return extractArray<ApiPlayer>(response);
}

export async function getAdminPlayers() {
  const response = await apiRequest<PlayersResponse>("/admin/players");
  return extractArray<ApiPlayer>(response);
}

export async function createAdminPlayer(payload: PlayerPayload) {
  return apiRequest<ApiPlayer>("/admin/players", {
    method: "POST",
    body: toFormData(payload),
  });
}

export async function createPlayer(payload: PlayerPayload) {
  return apiRequest<ApiPlayer>("/players", {
    method: "POST",
    body: toFormData(payload),
  });
}

export async function updatePlayer(id: number, payload: PlayerPayload) {
  return apiRequest<ApiPlayer>(`/players/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePlayer(id: number) {
  return apiRequest<unknown>(`/players/${id}`, {
    method: "DELETE",
  });
}

export type JoinRequest = {
  id: number;
  tournament_id: number;
  team_id: number;
  status?: string | null;
  message?: string | null;
  admin_note?: string | null;
  created_at?: string | null;
  tournament?: PublicTournament | null;
  team?: ApiTeam | null;
  manager?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

export type JoinRequestPayload = {
  tournament_id: number;
  team_id: number;
  message?: string;
};

type JoinRequestsResponse = JoinRequest[] | { data?: JoinRequest[] };

export async function getJoinRequests(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<JoinRequestsResponse>(`/join-requests${suffix}`);
  return extractArray<JoinRequest>(response);
}

export async function getAdminJoinRequests() {
  const response = await apiRequest<JoinRequestsResponse>("/admin/join-requests");
  return extractArray<JoinRequest>(response);
}

export async function createJoinRequest(payload: JoinRequestPayload) {
  return apiRequest<JoinRequest>("/join-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function acceptJoinRequest(id: number) {
  return apiRequest<JoinRequest>(`/join-requests/${id}/accept`, {
    method: "PUT",
  });
}

export async function refuseJoinRequest(id: number) {
  return apiRequest<JoinRequest>(`/join-requests/${id}/refuse`, {
    method: "PUT",
  });
}

export type ApiMatch = {
  id: number;
  tournament_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date?: string | null;
  home_score?: number | null;
  away_score?: number | null;
  status?: string | null;
  result_status?: string | null;
  tournament?: PublicTournament | null;
  home_team?: ApiTeam | null;
  away_team?: ApiTeam | null;
  homeTeam?: ApiTeam | null;
  awayTeam?: ApiTeam | null;
};

export type MatchPayload = {
  tournament_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
};

export type MatchResultPayload = {
  home_score: number;
  away_score: number;
};

type MatchesResponse = ApiMatch[] | { data?: ApiMatch[] };

export async function getMatches(params?: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value != null && value !== "") {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<MatchesResponse>(`/matches${suffix}`);
  return extractArray<ApiMatch>(response);
}

export async function getAdminMatches() {
  const response = await apiRequest<MatchesResponse>("/admin/matches");
  return extractArray<ApiMatch>(response);
}

export async function getMatch(id: number) {
  return apiRequest<ApiMatch>(`/matches/${id}`);
}

export async function createMatch(payload: MatchPayload) {
  return apiRequest<ApiMatch>("/matches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMatch(id: number, payload: MatchPayload) {
  return apiRequest<ApiMatch>(`/matches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMatch(id: number) {
  return apiRequest<unknown>(`/matches/${id}`, {
    method: "DELETE",
  });
}

export async function enterMatchResult(id: number, payload: MatchResultPayload) {
  return apiRequest<ApiMatch>(`/matches/${id}/result`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function confirmMatchResult(id: number) {
  return apiRequest<ApiMatch>(`/matches/${id}/confirm-result`, {
    method: "PUT",
  });
}

export async function disputeMatchResult(id: number) {
  return apiRequest<ApiMatch>(`/matches/${id}/dispute-result`, {
    method: "PUT",
  });
}

export type ApiRanking = {
  id: number;
  tournament_id: number;
  team_id: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  team?: ApiTeam | null;
  tournament?: PublicTournament | null;
};

export type DashboardSummary = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
  };
  counts: {
    my_tournaments: number;
    my_teams: number;
    my_players: number;
    pending_requests: number;
    join_requests: number;
    matches: number;
    confirmed_results: number;
  };
  tournament_status: Record<string, number>;
  match_status: Record<string, number>;
  result_status: Record<string, number>;
  first_tournament_id: number | null;
  ranking_preview: ApiRanking[];
  match_preview: ApiMatch[];
  pending_tournaments: MyTournament[];
};

export async function getDashboardSummary() {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}

type RankingsResponse = ApiRanking[] | { data?: ApiRanking[] };

export async function getRankings(tournament_id: number | string) {
  if (tournament_id == null || tournament_id === "" || !Number.isFinite(Number(tournament_id))) {
    throw new ApiError("Un tournoi valide est requis pour charger le classement.", 0, null);
  }
  const query = new URLSearchParams({ tournament_id: String(tournament_id) });
  const response = await apiRequest<RankingsResponse>(`/rankings?${query.toString()}`);
  return extractArray<ApiRanking>(response);
}

export async function recalculateRankings(tournament_id: number | string) {
  return apiRequest<unknown>("/rankings/recalculate", {
    method: "POST",
    body: JSON.stringify({ tournament_id: Number(tournament_id) }),
  });
}

export type StatisticType = "goal" | "assist" | "yellow_card" | "red_card" | "clean_sheet";

export type ApiStatistic = {
  id: number;
  match_game_id: number;
  team_id: number;
  player_id: number;
  stat_type: StatisticType | string;
  value: number;
  matchGame?: ApiMatch | null;
  match_game?: ApiMatch | null;
  team?: ApiTeam | null;
  player?: ApiPlayer | null;
  created_at?: string | null;
};

export type StatisticPayload = {
  match_game_id: number;
  team_id: number;
  player_id: number;
  stat_type: StatisticType;
  value: number;
};

type StatisticsResponse = ApiStatistic[] | { data?: ApiStatistic[] };

export async function getStatistics(params?: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value != null && value !== "") {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<StatisticsResponse>(`/statistics${suffix}`);
  return extractArray<ApiStatistic>(response);
}

export async function createStatistic(payload: StatisticPayload) {
  return apiRequest<ApiStatistic>("/statistics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStatistic(id: number, payload: StatisticPayload) {
  return apiRequest<ApiStatistic>(`/statistics/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteStatistic(id: number) {
  return apiRequest<unknown>(`/statistics/${id}`, {
    method: "DELETE",
  });
}

export type ApiComposition = {
  id: number;
  match_game_id: number;
  team_id: number;
  player_id: number;
  role?: "starter" | "substitute" | string | null;
  is_starter: boolean | number;
  position?: string | null;
  shirt_number?: number | null;
  matchGame?: ApiMatch | null;
  match_game?: ApiMatch | null;
  team?: ApiTeam | null;
  player?: ApiPlayer | null;
  created_at?: string | null;
};

export type CompositionPayload = {
  match_game_id: number;
  team_id: number;
  player_id: number;
  role?: "starter" | "substitute";
  is_starter: boolean;
  position?: string;
  shirt_number?: number;
};

type CompositionsResponse = ApiComposition[] | { data?: ApiComposition[] };

export async function getCompositions(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<CompositionsResponse>(`/compositions${suffix}`);
  return extractArray<ApiComposition>(response);
}

export async function createComposition(payload: CompositionPayload) {
  return apiRequest<ApiComposition>("/compositions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateComposition(id: number, payload: CompositionPayload) {
  return apiRequest<ApiComposition>(`/compositions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteComposition(id: number) {
  return apiRequest<unknown>(`/compositions/${id}`, {
    method: "DELETE",
  });
}
