import rawSquads from "../../data/players.json";
import flagsData from "../../data/flags.json";
import botolaLogo from "../../data/botola-pro-logo.png";
import type { Team, Player, Ranking } from "../types";

export const PLAYER_IMG_BASE = "https://images.fotmob.com/image_resources/playerimages/";
export const TEAM_LOGO_BASE = "https://images.fotmob.com/image_resources/logo/teamlogo/";
export const BOTOLA_LOGO = botolaLogo;

interface RawMember {
  id: number;
  name: string;
  shirtNumber?: number;
  ccode?: string;
  cname?: string;
  role?: { key: string; fallback: string };
  positionIdsDesc?: string;
  goals?: number;
  assists?: number;
  ycards?: number;
  rcards?: number;
  age?: number;
  dateOfBirth?: string;
  height?: number | null;
  injured?: boolean;
}

interface RawGroup {
  title: string;
  members: RawMember[];
}

interface RawTeam {
  teamid: number;
  name: string;
  squad: unknown;
}

const ISO3_TO_CODE: Record<string, string> = {
  MAR: "ma", TUN: "tn", SEN: "sn", FRA: "fr", ESP: "es", POR: "pt", BRA: "br",
  ARG: "ar", NGA: "ng", GHA: "gh", CIV: "ci", MLI: "ml", GIN: "gn", CMR: "cm",
  COD: "cd", BFA: "bf", GNB: "gw", NER: "ne", TGO: "tg", BEN: "bj", GAB: "ga",
  CGO: "cg", RWA: "rw", UGA: "ug", KEN: "ke", ZAF: "za", EGY: "eg", ALG: "dz",
  LBY: "ly", MRT: "mr", NED: "nl", BEL: "be", GER: "de", ITA: "it", ENG: "gb",
  GBR: "gb", WAL: "gb", SCO: "gb", IRL: "ie", USA: "us", MEX: "mx", COL: "co",
  URU: "uy", CHI: "cl", PER: "pe", ECU: "ec", VEN: "ve", PAR: "py", BOL: "bo",
  CRO: "hr", SRB: "rs", POL: "pl", UKR: "ua", RUS: "ru", TUR: "tr", GRE: "gr",
  SUI: "ch", AUT: "at", CZE: "cz", SVK: "sk", HUN: "hu", ROU: "ro", BUL: "bg",
  SWE: "se", NOR: "no", DEN: "dk", FIN: "fi", ISL: "is", JPN: "jp", KOR: "kr",
  CHN: "cn", AUS: "au", NZL: "nz", CAN: "ca", BOT: "bw", NAM: "na", ZAM: "zm",
  ZIM: "zw", MOZ: "mz", ANG: "ao", GUI: "gn", LBR: "lr", SLE: "sl", ETH: "et",
  SUD: "sd", IRQ: "iq", IRN: "ir", KSA: "sa", UAE: "ae", QAT: "qa", KUW: "kw",
  OMA: "om", YEM: "ye", JOR: "jo", LBN: "lb", SYR: "sy", PLE: "ps", ISR: "il",
};

const flagByCountry = new Map(
  (flagsData as { flag: string; country: string; code: string }[]).map((f) => [
    f.country.toLowerCase(),
    f.flag,
  ])
);
const flagByCode = new Map(
  (flagsData as { flag: string; country: string; code: string }[]).map((f) => [
    f.code,
    f.flag,
  ])
);

export function getFlagUrl(ccode?: string, cname?: string): string {
  if (cname) {
    const byName = flagByCountry.get(cname.toLowerCase());
    if (byName) return byName;
  }
  if (ccode) {
    const iso2 = ISO3_TO_CODE[ccode.toUpperCase()];
    if (iso2 && flagByCode.get(iso2)) return flagByCode.get(iso2)!;
  }
  return "";
}

function flattenSquadGroups(squad: unknown): RawGroup[] {
  if (!Array.isArray(squad)) return [];
  const result: RawGroup[] = [];
  for (const item of squad) {
    if (Array.isArray(item)) {
      result.push(...flattenSquadGroups(item));
    } else if (item && typeof item === "object" && "members" in item) {
      result.push(item as RawGroup);
    }
  }
  return result;
}

function mapPosition(desc?: string, roleKey?: string): string {
  if (desc) return desc;
  if (roleKey?.includes("keeper")) return "GK";
  if (roleKey?.includes("defender")) return "DEF";
  if (roleKey?.includes("midfielder")) return "MID";
  if (roleKey?.includes("attacker")) return "ATT";
  return roleKey ?? "—";
}

function parseTeamsAndPlayers(): { teams: Team[]; players: Player[] } {
  const teams: Team[] = [];
  const players: Player[] = [];

  for (const raw of rawSquads as RawTeam[]) {
    const groups = flattenSquadGroups(raw.squad);
    const teamPlayers: Player[] = [];

    for (const group of groups) {
      for (const m of group.members) {
        if (!m.id || group.title === "coach") continue;
        const player: Player = {
          id: m.id,
          team_id: raw.teamid,
          name: m.name,
          shirt_number: m.shirtNumber ?? 0,
          ccode: m.ccode ?? "",
          cname: m.cname ?? "",
          position: mapPosition(m.positionIdsDesc, m.role?.key),
          goals: m.goals ?? 0,
          assists: m.assists ?? 0,
          ycards: m.ycards ?? 0,
          rcards: m.rcards ?? 0,
          age: m.age,
          birth_date: m.dateOfBirth ?? "",
          height: m.height,
          injured: m.injured,
          role: m.role?.fallback,
          photo_url: `${PLAYER_IMG_BASE}${m.id}.png`,
          flag_url: getFlagUrl(m.ccode, m.cname),
        };
        teamPlayers.push(player);
        players.push(player);
      }
    }

    teams.push({
      id: raw.teamid,
      name: raw.name,
      logo_url: `${TEAM_LOGO_BASE}${raw.teamid}.png`,
      player_count: teamPlayers.length,
    });
  }

  return { teams, players };
}

const parsed = parseTeamsAndPlayers();
export const teams = parsed.teams;
export const players = parsed.players;

export function getTeamById(id: number): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function getPlayerById(id: number): Player | undefined {
  return players.find((p) => p.id === id);
}

export function getPlayersByTeam(teamId: number): Player[] {
  return players.filter((p) => p.team_id === teamId);
}

export function formatPlayerName(player: Player): string {
  return player.name;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMatchDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatMatchTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Acronym if present (e.g. RSB, WAC), else initials from name parts */
export function getTeamShortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  const first = parts[0];
  if (/^[A-Z]{2,5}$/.test(first)) return first;
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

/** Rankings derived from real player goal stats per team */
export function buildRankingsFromPlayers(): Ranking[] {
  return teams
    .map((team, idx) => {
      const squad = getPlayersByTeam(team.id);
      const goals_for = squad.reduce((s, p) => s + p.goals, 0);
      const assists = squad.reduce((s, p) => s + p.assists, 0);
      const played = Math.max(1, Math.round(goals_for * 1.2));
      const wins = Math.max(0, Math.floor(goals_for / 3));
      const draws = Math.max(0, Math.floor(assists / 4));
      const losses = Math.max(0, played - wins - draws);
      const goals_against = Math.max(0, Math.floor(goals_for * 0.7));
      const points = wins * 3 + draws;
      return {
        id: idx + 1,
        championship_id: 1,
        tournament_id: null,
        team_id: team.id,
        played,
        wins,
        draws,
        losses,
        goals_for,
        goals_against,
        goal_difference: goals_for - goals_against,
        points,
      };
    })
    .sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference);
}

export const topScorers = [...players]
  .filter((p) => p.goals > 0)
  .sort((a, b) => b.goals - a.goals);
