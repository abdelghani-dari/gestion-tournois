const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE = (configuredApiUrl || "http://localhost:8000/api").replace(/\/+$/, "");
export const APP_BASE = API_BASE.replace(/\/api$/, "");

/** Base URL for all backend-stored media files: http://localhost:8000/storage */
export const STORAGE_BASE = `${APP_BASE}/storage`;

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
    const d = data as Record<string, unknown>;

    // Laravel validation errors: { errors: { field: ["message"] } }
    if (d.errors && typeof d.errors === "object") {
      const errors = d.errors as Record<string, unknown>;
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const msgs = errors[firstKey];
        const msg = Array.isArray(msgs) ? msgs[0] : msgs;
        if (typeof msg === "string" && msg.trim()) return msg;
      }
    }

    // Standard { message: "..." }
    const maybeMessage = d.message;
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

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  const token = getToken();

  headers.set("Accept", "application/json");

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal ?? AbortSignal.timeout(10_000),
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
    if (response.status === 401 && auth && token) {
      clearToken();
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

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

export type PaginatedMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginatedMeta;
};

function extractPaginated<T>(response: unknown): PaginatedResult<T> {
  if (response && typeof response === "object" && "meta" in response) {
    const payload = response as PaginatedResult<T>;
    return {
      data: Array.isArray(payload.data) ? payload.data : extractArray<T>(response),
      meta: payload.meta,
    };
  }

  const data = extractArray<T>(response);
  return {
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: data.length || 1,
      total: data.length,
    },
  };
}

function extractObject<T>(response: unknown): T {
  if (response && typeof response === "object") {
    const data = (response as { data?: unknown }).data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as T;
    }
  }

  return response as T;
}

export type PublicTournament = {
  id: number;
  created_by?: number | null;
  name: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  banner_path?: string | null;
  format?: "league" | string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  approval_status?: string | null;
  teams?: ApiTeam[];
  matches?: ApiMatch[];
  rankings?: ApiRanking[];
  admin_note?: string | null;
  approved_at?: string | null;
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
  approvedBy?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type PublicTournamentsResponse = PublicTournament[] | { data?: PublicTournament[] };

function assertValidId(id: number | string, message: string) {
  if (id == null || id === "" || !Number.isFinite(Number(id))) {
    throw new ApiError(message, 0, null);
  }
}

export async function getTournaments() {
  const response = await apiRequest<PublicTournamentsResponse>("/tournaments", { auth: false });
  return extractArray<PublicTournament>(response);
}

export async function getPublicTournaments() {
  return getTournaments();
}

export async function getTournament(id: number | string) {
  assertValidId(id, "Un tournoi valide est requis.");
  const response = await apiRequest<PublicTournament | { data?: PublicTournament }>(`/tournaments/${id}`, { auth: false });
  return extractObject<PublicTournament>(response);
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
  format?: "league";
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

export async function updateTournament(id: number, payload: Partial<CreateTournamentPayload>) {
  return apiRequest<MyTournament>(`/tournaments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
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
  tournament_count?: number;
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

export async function updateAdminUser(id: number, payload: { role?: string; account_status?: string }) {
  return apiRequest<AdminUser>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
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

export type TeamListParams = {
  search?: string;
  tournament_id?: number | null;
  manager_id?: number | null;
  page?: number;
  per_page?: number;
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

export async function getTeams(params?: TeamListParams) {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.tournament_id != null) query.set("tournament_id", String(params.tournament_id));
  if (params?.manager_id != null) query.set("manager_id", String(params.manager_id));
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.per_page != null) query.set("per_page", String(params.per_page));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<TeamsResponse | PaginatedResult<ApiTeam>>(`/teams${suffix}`);
  if (params?.page != null || params?.per_page != null) {
    return extractPaginated<ApiTeam>(response);
  }
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

export async function getTeam(id: number | string) {
  return apiRequest<ApiTeam>(`/teams/${id}`, { auth: false });
}

export async function updateTeam(id: number, payload: TeamPayload) {
  const hasFile = payload.logo instanceof File;
  if (hasFile) {
    return apiRequest<ApiTeam>(`/teams/${id}`, {
      method: "POST",
      body: toFormData(payload),
    });
  }
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
  goals?: number;
  assists?: number;
  created_at?: string | null;
  team?: ApiTeam | null;
};

export type PlayerListParams = {
  search?: string;
  team_id?: number | null;
  tournament_id?: number | null;
  manager_id?: number | null;
  page?: number;
  per_page?: number;
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

export async function getPlayers(params?: PlayerListParams) {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.team_id != null) query.set("team_id", String(params.team_id));
  if (params?.tournament_id != null) query.set("tournament_id", String(params.tournament_id));
  if (params?.manager_id != null) query.set("manager_id", String(params.manager_id));
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.per_page != null) query.set("per_page", String(params.per_page));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<PlayersResponse | PaginatedResult<ApiPlayer>>(`/players${suffix}`);
  if (params?.page != null || params?.per_page != null) {
    return extractPaginated<ApiPlayer>(response);
  }
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
  const hasFile = payload.photo instanceof File;
  if (hasFile) {
    return apiRequest<ApiPlayer>(`/players/${id}`, {
      method: "POST",
      body: toFormData(payload),
    });
  }
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
  home_team_id?: number | null;
  away_team_id?: number | null;
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

export async function getTournamentMatches(tournament_id: number | string) {
  assertValidId(tournament_id, "Un tournoi valide est requis pour charger les matchs.");
  const query = new URLSearchParams({ tournament_id: String(tournament_id) });
  const response = await apiRequest<MatchesResponse>(`/matches?${query.toString()}`, { auth: false });
  return extractArray<ApiMatch>(response);
}

export async function getAdminMatches() {
  const response = await apiRequest<MatchesResponse>("/admin/matches");
  return extractArray<ApiMatch>(response);
}

export async function getMatch(id: number | string) {
  assertValidId(id, "Un match valide est requis.");
  const response = await apiRequest<ApiMatch | { data?: ApiMatch }>(`/matches/${id}`, { auth: false });
  return extractObject<ApiMatch>(response);
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

export type DashboardTopScorer = Pick<ApiPlayer, "id" | "team_id" | "first_name" | "last_name" | "photo_path" | "goals" | "team">;

export type GoalsByMonthPoint = {
  month: string;
  period?: string;
  scored: number;
  conceded: number;
  yellow_cards: number;
  red_cards: number;
};

export type TeamStatsByMonthPoint = {
  month: string;
  period?: string;
  goals_scored: number;
  goals_conceded: number;
  points: number;
  yellow_cards: number;
  red_cards: number;
};

export type TournamentPreviewItem = {
  id: number;
  name: string;
  banner_path?: string | null;
  status?: string | null;
  approval_status?: string | null;
  team_count: number;
  start_date?: string | null;
  end_date?: string | null;
  total_goals?: number;
};

export type DashboardViewMeta = {
  sidebar_mode: "tournaments" | "scorers";
  my_tournament_count: number;
  is_creator_scope: boolean;
};

export type FeaturedTournament = {
  id: number;
  name: string;
  status?: string | null;
};

export type BarChartPoint = {
  label: string;
  value: number;
  image_url?: string | null;
  image_url_secondary?: string | null;
};

export type TournamentOption = {
  id: number;
  name: string;
  created_by?: number | null;
};

export type SelectedTournamentProgress = {
  played: number;
  scheduled: number;
  total: number;
  teams_count: number;
};

export type DashboardChartStats = {
  top_tournaments_by_goals: BarChartPoint[];
  top_teams_by_goals: BarChartPoint[];
  top_yellow_cards: BarChartPoint[];
  top_red_cards: BarChartPoint[];
  goals_by_week: BarChartPoint[];
  top_matches_by_goals: BarChartPoint[];
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
  selected_tournament_id: number | null;
  tournament_options: TournamentOption[];
  featured_tournament: FeaturedTournament | null;
  ranking_preview: ApiRanking[];
  match_preview: ApiMatch[];
  recent_matches: ApiMatch[];
  top_scorers: DashboardTopScorer[];
  goals_by_month: GoalsByMonthPoint[];
  team_stats_by_month: TeamStatsByMonthPoint[];
  selected_team_id: number | null;
  tournaments_preview: TournamentPreviewItem[];
  creator_tournament_rankings: TournamentPreviewItem[];
  dashboard_view: DashboardViewMeta;
  chart_stats: DashboardChartStats;
  pending_tournaments: MyTournament[];
  selected_tournament_progress: SelectedTournamentProgress | null;
};

export type PublicHomePreview = {
  featured_tournament: FeaturedTournament | null;
  ranking_preview: ApiRanking[];
  top_scorers: DashboardTopScorer[];
  trending_tournaments: TournamentPreviewItem[];
};

export async function getDashboardSummary(tournamentId?: number | null, teamId?: number | null) {
  const query = new URLSearchParams();
  if (tournamentId != null) query.set("tournament_id", String(tournamentId));
  if (teamId != null) query.set("team_id", String(teamId));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<DashboardSummary>(`/dashboard/summary${suffix}`);
}

export async function getPublicHomePreview() {
  return apiRequest<PublicHomePreview>("/public/home-preview", { auth: false });
}

export async function updatePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return apiRequest<{ message: string }>("/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

type RankingsResponse = ApiRanking[] | { data?: ApiRanking[] };

export async function getRankings(tournament_id: number | string) {
  assertValidId(tournament_id, "Un tournoi valide est requis pour charger le classement.");
  const query = new URLSearchParams({ tournament_id: String(tournament_id) });
  const response = await apiRequest<RankingsResponse>(`/rankings?${query.toString()}`, { auth: false });
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
  const response = await apiRequest<StatisticsResponse>(`/statistics${suffix}`, { auth: false });
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
  const response = await apiRequest<CompositionsResponse>(`/compositions${suffix}`, { auth: false });
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
