export function teamIdsFromMatches(
  matches: {
    home_team_id?: number | null;
    away_team_id?: number | null;
    championship_id: number | null;
    tournament_id: number | null;
  }[],
  filter: { championshipId?: number | null; tournamentId?: number | null }
): Set<number> | null {
  let list = matches;
  if (filter.championshipId) {
    list = list.filter((m) => m.championship_id === filter.championshipId);
  }
  if (filter.tournamentId) {
    list = list.filter((m) => m.tournament_id === filter.tournamentId);
  }
  if (!filter.championshipId && !filter.tournamentId) return null;
  if (list.length === 0) return new Set();
  return new Set(
    list
      .flatMap((m) => [m.home_team_id, m.away_team_id])
      .filter((teamId): teamId is number => typeof teamId === "number"),
  );
}
