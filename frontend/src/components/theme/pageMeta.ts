import { APP_NAME } from "../../config/app";

export interface PageMeta {
  title: string;
  description?: string;
}

const STATIC: Record<string, PageMeta> = {
  "/dashboard": { title: "Dashboard", description: "Vue d'ensemble des tournois locaux" },
  "/tournaments": { title: "Tournois", description: "Découvrez les tournois disponibles et gérez vos propres tournois" },
  "/tournaments/create": { title: "Créer un tournoi", description: "Nouvelle proposition de tournoi local" },
  "/teams": { title: "Equipes", description: "Gestion des equipes" },
  "/players": { title: "Joueurs", description: "Effectifs et profils joueurs" },
  "/join-requests": { title: "Demandes", description: "Demandes d'inscription aux tournois" },
  "/matches": { title: "Matchs", description: "Calendrier, resultats et gestion des matchs" },
  "/rankings": { title: "Classements", description: "Classements des tournois" },
  "/statistics": { title: "Statistiques", description: "Statistiques des matchs et joueurs" },
  "/admin/tournaments": { title: "Admin tournois", description: "Validation des tournois" },
  "/admin/tournaments/pending": { title: "Tournois en attente", description: "Validation admin" },
  "/profile": { title: "Profil", description: "Informations personnelles" },
  "/matches/create": { title: "Planifier un match", description: "Nouvelle rencontre" },
};

export function resolvePageMeta(pathname: string): PageMeta {
  if (STATIC[pathname]) return STATIC[pathname];

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { title: APP_NAME };

  const [section, id, sub] = parts;

  if (section === "tournaments" && id) {
    if (sub === "ranking") return { title: "Classement", description: `Tournoi #${id}` };
    return { title: "Tournoi", description: `Tournoi #${id}` };
  }

  if (section === "teams" && id) {
    if (sub === "statistics") return { title: "Statistiques", description: `Equipe #${id}` };
    return { title: "Equipe", description: `Equipe #${id}` };
  }

  if (section === "players" && id) {
    if (sub === "statistics") return { title: "Statistiques", description: `Joueur #${id}` };
    return { title: "Joueur", description: `Joueur #${id}` };
  }

  if (section === "matches" && id && id !== "create") {
    if (sub === "result") return { title: "Resultat", description: `Match #${id}` };
    if (sub === "composition") return { title: "Composition", description: `Match #${id}` };
    if (sub === "statistics") return { title: "Statistiques du match", description: `Match #${id}` };
    return { title: "Detail du match", description: `Match #${id}` };
  }

  const fallbacks: Record<string, PageMeta> = {
    tournaments: { title: "Tournois" },
    teams: { title: "Equipes" },
    players: { title: "Joueurs" },
    "join-requests": { title: "Demandes" },
    matches: { title: "Matchs" },
    rankings: { title: "Classements" },
    statistics: { title: "Statistiques" },
    profile: { title: "Profil" },
    dashboard: { title: "Dashboard" },
    admin: { title: "Admin" },
  };

  return fallbacks[section ?? ""] ?? { title: APP_NAME };
}
