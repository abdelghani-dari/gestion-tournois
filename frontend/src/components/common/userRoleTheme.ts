import type { UserAvatarSource } from "./userAvatarAssets";

export type AccountType = "admin" | "creator" | "user";

export const ACCOUNT_ROLE_COLORS = {
  admin: {
    main: "#C65C44",
    bg: "rgba(198, 92, 68, 0.16)",
    ring: "rgba(198, 92, 68, 0.5)",
    muted: "rgba(198, 92, 68, 0.08)",
  },
  creator: {
    main: "#73D658",
    bg: "rgba(115, 214, 88, 0.16)",
    ring: "rgba(115, 214, 88, 0.5)",
    muted: "rgba(115, 214, 88, 0.08)",
  },
  user: {
    main: "#7BA3C9",
    bg: "rgba(123, 163, 201, 0.14)",
    ring: "rgba(123, 163, 201, 0.4)",
    muted: "rgba(123, 163, 201, 0.07)",
  },
} as const;

export function resolveAccountType(user?: UserAvatarSource | null): AccountType {
  if (user?.role === "admin") return "admin";
  if ((user?.tournament_count ?? 0) > 0) return "creator";
  return "user";
}

export function accountRoleLabel(type: AccountType): string {
  if (type === "admin") return "Administrateur";
  if (type === "creator") return "Organisateur";
  return "Utilisateur";
}

export function accountRoleDescription(type: AccountType): string {
  if (type === "admin") return "Validation des comptes, tournois et supervision globale.";
  if (type === "creator") return "Création et gestion de vos tournois locaux.";
  return "Participation aux tournois et gestion de votre espace.";
}
