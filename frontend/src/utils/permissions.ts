import type { ApiTeam, PublicTournament } from "../api";
import type { AuthUser } from "../context/AuthContext";

type TournamentOwner = Pick<PublicTournament, "created_by">;
type TeamOwner = Pick<ApiTeam, "manager_id">;

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role?.trim() === "admin";
}

export function isTeamManager(user: AuthUser | null | undefined, team: TeamOwner): boolean {
  if (!user || team.manager_id == null) return false;
  return Number(team.manager_id) === Number(user.id);
}

/** PUT /teams/{id} — admin or manager */
export function canEditTeam(user: AuthUser | null | undefined, team: TeamOwner): boolean {
  if (!user) return false;
  return isAdmin(user) || isTeamManager(user, team);
}

/** DELETE /teams/{id} — admin or manager */
export function canDeleteTeam(user: AuthUser | null | undefined, team: TeamOwner): boolean {
  if (!user) return false;
  return isAdmin(user) || isTeamManager(user, team);
}

/** PUT /players/{id} — admin or manager of player's team */
export function canEditPlayer(user: AuthUser | null | undefined, team: TeamOwner): boolean {
  if (!user) return false;
  return isAdmin(user) || isTeamManager(user, team);
}

/** DELETE /players/{id} — admin or team manager */
export function canDeletePlayer(user: AuthUser | null | undefined, team: TeamOwner): boolean {
  return canDeleteTeam(user, team);
}

/** PUT /tournaments/{id} — admin or creator */
export function canEditTournament(user: AuthUser | null | undefined, tournament: TournamentOwner): boolean {
  if (!user) return false;
  return isAdmin(user) || (tournament.created_by != null && Number(tournament.created_by) === Number(user.id));
}

/** DELETE /tournaments/{id} — admin or creator */
export function canDeleteTournament(user: AuthUser | null | undefined, tournament: TournamentOwner): boolean {
  if (!user) return false;
  return isAdmin(user) || Number(tournament.created_by) === Number(user.id);
}

/** Match create/update/result — admin or tournament creator */
export function canManageTournamentMatches(
  user: AuthUser | null | undefined,
  tournament: TournamentOwner | null | undefined,
): boolean {
  if (!user || !tournament) return false;
  return isAdmin(user) || Number(tournament.created_by) === Number(user.id);
}
