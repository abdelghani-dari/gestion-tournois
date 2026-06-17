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
