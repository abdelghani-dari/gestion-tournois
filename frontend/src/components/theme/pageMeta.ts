import { APP_NAME, buildSeasonSnapshot } from "../data/seasonData";
import { formatPlayerName, formatDateTime } from "../data/fotmobData";

function getActiveSeasonId(): number {
  const stored = localStorage.getItem("x-season-id");
  return stored ? Number(stored) : 1;
}

function seasonCtx() {
  return buildSeasonSnapshot(getActiveSeasonId());
}

export interface PageMeta {
  title: string;
  description?: string;
}

const STATIC: Record<string, PageMeta> = {
  "/dashboard": { title: "Dashboard", description: "Vue d'ensemble de la saison 2025-2026" },
  "/seasons": { title: "Saisons", description: "Gestion des saisons sportives" },
  "/championships": { title: "Championnat", description: "Classement et progression" },
  "/tournaments": { title: "Tournois", description: "Compétitions à élimination directe" },
  "/teams": { title: "Équipes", description: "Clubs de la saison" },
  "/players": { title: "Joueurs", description: "Effectifs et statistiques" },
  "/matches": { title: "Rencontres", description: "Calendrier et résultats" },
  "/rankings": { title: "Classements", description: "Tableau général" },
  "/statistics": { title: "Statistiques", description: "Performances de la saison" },
  "/users": { title: "Utilisateurs", description: "Gestion des accès" },
  "/profile": { title: "Mon Profil", description: "Informations personnelles" },
  "/matches/create": { title: "Planifier un match", description: "Nouvelle rencontre" },
};

export function resolvePageMeta(pathname: string): PageMeta {
  const { season } = seasonCtx();
  const seasonLabel = season.name.replace("Saison ", "");

  if (STATIC[pathname]) {
    const base = STATIC[pathname];
    return { ...base, description: base.description ? `${base.description} · ${seasonLabel}` : seasonLabel };
  }

  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return { title: APP_NAME };

  const [section, id, sub] = parts;
  const numId = Number(id);

  const ctx = seasonCtx();

  if (section === "championships" && id) {
    if (sub === "ranking") {
      const c = ctx.championships.find((c) => c.id === numId);
      return { title: "Classement", description: c?.name };
    }
    const c = ctx.championships.find((c) => c.id === numId);
    if (c) return { title: c.name, description: c.description };
  }

  if (section === "tournaments" && id) {
    if (sub === "ranking") {
      const t = ctx.tournaments.find((t) => t.id === numId);
      return { title: "Classement", description: t?.name };
    }
    const t = ctx.tournaments.find((t) => t.id === numId);
    if (t) return { title: t.name, description: t.description };
  }

  if (section === "teams" && id) {
    const team = ctx.teams.find((t) => t.id === numId);
    if (sub === "statistics") {
      return { title: "Statistiques", description: team?.name };
    }
    if (team) return { title: team.name, description: `${team.player_count} joueurs` };
  }

  if (section === "players" && id) {
    const p = ctx.players.find((pl) => pl.id === numId);
    const team = p ? ctx.teams.find((t) => t.id === p.team_id) : undefined;
    if (sub === "statistics") {
      return { title: "Statistiques", description: p ? formatPlayerName(p) : undefined };
    }
    if (p) return { title: formatPlayerName(p), description: `${p.position} · ${team?.name ?? ""}` };
  }

  if (section === "matches" && id && id !== "create") {
    const m = ctx.matches.find((match) => match.id === numId);
    const home = m ? ctx.teams.find((t) => t.id === m.home_team_id) : undefined;
    const away = m ? ctx.teams.find((t) => t.id === m.away_team_id) : undefined;
    const vs = home && away ? `${home.name} vs ${away.name}` : undefined;

    if (sub === "result") return { title: "Saisie du résultat", description: vs };
    if (sub === "composition") return { title: "Composition", description: vs };
    if (sub === "statistics") return { title: "Statistiques du match", description: vs };
    if (m) return { title: "Détail du match", description: formatDateTime(m.match_date) };
  }

  const fallbacks: Record<string, PageMeta> = {
    seasons: { title: "Saisons" },
    championships: { title: "Championnats" },
    tournaments: { title: "Tournois" },
    teams: { title: "Équipes" },
    players: { title: "Joueurs" },
    matches: { title: "Matchs" },
    rankings: { title: "Classements" },
    statistics: { title: "Statistiques" },
    users: { title: "Utilisateurs" },
    profile: { title: "Profil" },
    dashboard: { title: "Dashboard" },
  };

  return fallbacks[section ?? ""] ?? { title: APP_NAME };
}
