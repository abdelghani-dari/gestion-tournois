import { STORAGE_BASE } from "../../api";

export type UserAvatarSource = {
  role?: string | null;
  avatar_url?: string | null;
  tournament_count?: number | null;
};

const ROLE_AVATARS = {
  admin: `${STORAGE_BASE}/avatars/admin-avatar.jpg`,
  creator: `${STORAGE_BASE}/avatars/creator-avatar.jpg`,
  user: `${STORAGE_BASE}/avatars/user-avatar.jpg`,
};

function roleAvatarPath(user?: UserAvatarSource | null): string {
  if (user?.role === "admin") return ROLE_AVATARS.admin;
  if (user?.role === "creator" || (user?.tournament_count ?? 0) > 0) return ROLE_AVATARS.creator;
  return ROLE_AVATARS.user;
}

/** Role avatars — used for profile and account UI by default. */
export function getUserAvatarCandidates(user?: UserAvatarSource | null): string[] {
  return [roleAvatarPath(user)];
}

/**
 * Resolve the avatar to show for a user.
 * Priority: role-based backend storage avatar (admin/creator/user).
 * Falls back to custom avatar_url only if it is from our own backend storage.
 */
export function resolveUserAvatar(user?: UserAvatarSource | null): string {
  // If a custom avatar_url is stored and it is from OUR backend (not external like ui-avatars.com),
  // use it. Otherwise always use the role-based backend avatar.
  if (user?.avatar_url) {
    const url = user.avatar_url.trim();
    // Only trust backend-storage URLs or blob/data URIs
    if (/^(blob:|data:)/i.test(url)) return url;
    if (url.includes("localhost") || url.includes("127.0.0.1") || url.startsWith("/storage/")) {
      return /^https?:/i.test(url) ? url : `${STORAGE_BASE}/${url.replace(/^\/+/, "")}`;
    }
  }
  // Default: role-based avatar from backend storage
  return roleAvatarPath(user);
}
