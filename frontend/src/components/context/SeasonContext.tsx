import { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  allSeasons,
  buildSeasonSnapshot,
  type SeasonSnapshot,
} from "../data/seasonData";
import {
  formatPlayerName,
  formatDate,
  formatDateTime,
  formatMatchDateShort,
  formatMatchTime,
  BOTOLA_LOGO,
} from "../data/fotmobData";
import type { Season, Team, Player, Championship, Tournament, MatchGame } from "../types";

interface SeasonContextValue extends SeasonSnapshot {
  seasons: Season[];
  seasonId: number;
  setSeasonId: (id: number) => void;
  getTeamById: (id: number) => Team | undefined;
  getPlayerById: (id: number) => Player | undefined;
  getPlayersByTeam: (teamId: number) => Player[];
  getChampionshipById: (id: number) => Championship | undefined;
  getTournamentById: (id: number) => Tournament | undefined;
  getMatchById: (id: number) => MatchGame | undefined;
  getSeasonById: (id: number) => Season | undefined;
  formatPlayerName: typeof formatPlayerName;
  formatDate: typeof formatDate;
  formatDateTime: typeof formatDateTime;
  formatMatchDateShort: typeof formatMatchDateShort;
  formatMatchTime: typeof formatMatchTime;
  BOTOLA_LOGO: string;
}

const SeasonContext = createContext<SeasonContextValue | undefined>(undefined);

export function XSeasonProvider({ children }: { children: React.ReactNode }) {
  const [seasonId, setSeasonIdState] = useState<number>(() => {
    const stored = localStorage.getItem("x-season-id");
    return stored ? Number(stored) : 1;
  });

  const setSeasonId = useCallback((id: number) => {
    setSeasonIdState(id);
    localStorage.setItem("x-season-id", String(id));
  }, []);

  const snapshot = useMemo(() => buildSeasonSnapshot(seasonId), [seasonId]);

  const value = useMemo<SeasonContextValue>(() => {
    const { teams, players, championships, tournaments, matches } = snapshot;

    return {
      ...snapshot,
      seasons: allSeasons,
      seasonId,
      setSeasonId,
      getTeamById: (id) => teams.find((t) => t.id === id),
      getPlayerById: (id) => players.find((p) => p.id === id),
      getPlayersByTeam: (teamId) => players.filter((p) => p.team_id === teamId),
      getChampionshipById: (id) => championships.find((c) => c.id === id),
      getTournamentById: (id) => tournaments.find((t) => t.id === id),
      getMatchById: (id) => matches.find((m) => m.id === id),
      getSeasonById: (id) => allSeasons.find((s) => s.id === id),
      formatPlayerName,
      formatDate,
      formatDateTime,
      formatMatchDateShort,
      formatMatchTime,
      BOTOLA_LOGO,
    };
  }, [snapshot, seasonId, setSeasonId]);

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeasonData() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error("useSeasonData must be used within XSeasonProvider");
  return ctx;
}
