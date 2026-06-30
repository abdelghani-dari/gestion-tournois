# Pages Frontend — Tournify

Inventaire des pages React (`frontend/src/pages/`) — état juillet 2026.

## Pages publiques

| Route | Fichier | Description |
|---|---|---|
| `/` | `landing/LandingPage.tsx` | Accueil, tournois publics, FAQ, thème |
| `/about` | `landing/AboutPage.tsx` | Page équipe PFE |
| `/login` | `auth/LoginPage.tsx` | Connexion |
| `/register` | `auth/RegisterPage.tsx` | Inscription |

## Pages authentifiées

| Route | Fichier | Description |
|---|---|---|
| `/dashboard` | `dashboard/DashboardPage.tsx` | Métriques, graphiques, derniers matchs, classement |
| `/tournaments` | `tournaments/TournamentsPage.tsx` | Liste, création modal, cartes avec actions footer |
| `/tournaments/:id` | `tournaments/TournamentDetailsPage.tsx` | Détail tournoi, matchs, classement |
| `/teams` | `teams/TeamsPage.tsx` | CRUD équipes |
| `/teams/:id` | `teams/TeamDetailsPage.tsx` | Détail équipe |
| `/players` | `players/PlayersPage.tsx` | CRUD joueurs |
| `/players/:id` | `players/PlayerDetailsPage.tsx` | Détail joueur |
| `/matches` | `matches/MatchesPage.tsx` | Planifier, résultats, liste (2 cartes + tableau) |
| `/matches/:id` | `matches/MatchDetailsPage.tsx` | Détail match, stats, composition |
| `/rankings` | `rankings/RankingsPage.tsx` | Classement complet cliquable |
| `/rankings/:id` | `rankings/RankingsPage.tsx` | Classement par tournoi (param) |
| `/statistics` | `statistics/StatisticsPage.tsx` | Stats avec filtres cascade modal |
| `/join-requests` | `join-requests/JoinRequestsPage.tsx` | Demandes participation |

## Pages admin

| Route | Fichier | Description |
|---|---|---|
| `/admin/tournaments` | `admin/AdminTournamentsPage.tsx` | Validation tournois |
| `/admin/teams` | `admin/AdminTeamsPage.tsx` | Supervision équipes |
| `/admin/players` | `admin/AdminPlayersPage.tsx` | Supervision joueurs |

## Composants transverses

| Composant | Usage |
|---|---|
| `MatchRowList` | Lignes match (dashboard, matchs, détail tournoi) |
| `FormDrawer` | Modals formulaire |
| `RankingPreviewTable` | Aperçu classement dashboard |
| `GoalsLineChart` | Graphique buts mensuels |

## Layout

- `AppLayout` — sidebar + header (utilisateur connecté)
- `LandingNav` / `LandingFooter` — pages publiques
