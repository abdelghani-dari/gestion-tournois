import type { ReactNode } from "react";
import type { SearchableSelectOption } from "../common/SearchableSelect";
import type { ApiMatch, ApiTeam } from "../../api";
import MatchSelectRow from "./MatchSelectRow";

function resolveTeam(match: ApiMatch, side: "home" | "away", teams: ApiTeam[]) {
  if (side === "home") {
    return match.home_team ?? match.homeTeam ?? teams.find((team) => team.id === match.home_team_id) ?? null;
  }
  return match.away_team ?? match.awayTeam ?? teams.find((team) => team.id === match.away_team_id) ?? null;
}

function matchSearchText(match: ApiMatch, home?: ApiTeam | null, away?: ApiTeam | null) {
  return [
    match.id,
    home?.name,
    home?.short_name,
    away?.name,
    away?.short_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function buildMatchSelectOptions(matches: ApiMatch[], teams: ApiTeam[]): SearchableSelectOption[] {
  return matches.map((match) => {
    const home = resolveTeam(match, "home", teams);
    const away = resolveTeam(match, "away", teams);
    const content: ReactNode = <MatchSelectRow home={home} away={away} matchId={match.id} />;

    return {
      value: String(match.id),
      label: `#${match.id} ${home?.short_name ?? home?.name ?? "—"} vs ${away?.short_name ?? away?.name ?? "—"}`,
      searchText: matchSearchText(match, home, away),
      content,
    };
  });
}

export function findMatchById(matches: ApiMatch[], matchId: string) {
  if (!matchId) return null;
  return matches.find((match) => String(match.id) === matchId) ?? null;
}

export function resolveMatchTeams(match: ApiMatch | null, teams: ApiTeam[]) {
  if (!match) return { home: null, away: null };
  return {
    home: resolveTeam(match, "home", teams),
    away: resolveTeam(match, "away", teams),
  };
}
