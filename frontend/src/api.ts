export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, `Request failed with status ${response.status}`),
      response.status,
      data,
    );
  }

  return data as T;
}

export type PublicTournament = {
  id: number;
  name: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  approval_status?: string | null;
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
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export type MyTournament = PublicTournament;

export type CreateTournamentPayload = {
  name: string;
  description?: string;
  city?: string;
  location?: string;
  start_date: string;
  end_date: string;
};

type MyTournamentsResponse = MyTournament[] | { data?: MyTournament[] };

export async function getMyTournaments() {
  const response = await apiRequest<MyTournamentsResponse>("/my-tournaments");
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function createTournament(payload: CreateTournamentPayload) {
  return apiRequest<MyTournament>("/tournaments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type AdminTournament = PublicTournament;

type AdminTournamentsResponse = AdminTournament[] | { data?: AdminTournament[] };

export async function getPendingTournaments() {
  const response = await apiRequest<AdminTournamentsResponse>("/admin/tournaments/pending");
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function getAdminTournaments() {
  const response = await apiRequest<AdminTournamentsResponse>("/admin/tournaments");
  if (Array.isArray(response)) return response;
  return response.data ?? [];
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

export type ApiTeam = {
  id: number;
  name: string;
  city?: string | null;
  created_at?: string | null;
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
  city?: string;
};

type TeamsResponse = ApiTeam[] | { data?: ApiTeam[] };

export async function getMyTeams() {
  const response = await apiRequest<TeamsResponse>("/my-teams");
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function getTeams() {
  const response = await apiRequest<TeamsResponse>("/teams");
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function createTeam(payload: TeamPayload) {
  return apiRequest<ApiTeam>("/teams", {
    method: "POST",
    body: JSON.stringify(payload),
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
  team?: ApiTeam | null;
};

export type PlayerPayload = {
  team_id: number;
  first_name: string;
  last_name: string;
  birth_date?: string;
  position?: string;
  number?: number;
};

type PlayersResponse = ApiPlayer[] | { data?: ApiPlayer[] };

export async function getPlayers() {
  const response = await apiRequest<PlayersResponse>("/players");
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function createPlayer(payload: PlayerPayload) {
  return apiRequest<ApiPlayer>("/players", {
    method: "POST",
    body: JSON.stringify(payload),
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
  if (Array.isArray(response)) return response;
  return response.data ?? [];
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

export async function getMatches(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest<MatchesResponse>(`/matches${suffix}`);
  if (Array.isArray(response)) return response;
  return response.data ?? [];
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
