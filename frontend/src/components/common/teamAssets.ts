import { STORAGE_BASE } from "../../api";

/** Default logo when a team has no logo or it fails to load. */
export const TEAM_PLACEHOLDER_URL = `${STORAGE_BASE}/team-placeholder.svg`;

export function resolveTeamLogo(logoPath?: string | null) {
  const trimmed = logoPath?.trim();
  if (!trimmed) return TEAM_PLACEHOLDER_URL;

  // Full remote URL or blob/data URI — use as-is
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;

  // Any path (with or without leading /) — resolve to storage
  return `${STORAGE_BASE}/${trimmed.replace(/^\/+/, "")}`;
}
