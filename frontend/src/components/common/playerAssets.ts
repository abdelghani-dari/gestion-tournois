import { STORAGE_BASE } from "../../api";

/** Default avatar when a player photo is missing or fails to load. */
export const PLAYER_PLACEHOLDER_URL = `${STORAGE_BASE}/player-placeholder.png`;

export function resolvePlayerPhoto(photoPath?: string | null) {
  const trimmed = photoPath?.trim();
  if (!trimmed) return PLAYER_PLACEHOLDER_URL;

  // Full remote URL or blob/data URI — use as-is
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;

  // Absolute path starting with / — prefix with storage base (strips leading slash)
  return `${STORAGE_BASE}/${trimmed.replace(/^\/+/, "")}`;
}
