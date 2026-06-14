export const API_BASE = "http://localhost:8000/api";

export type ApiResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

export async function apiRequest(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<ApiResult> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: unknown = text;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
