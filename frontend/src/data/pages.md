# Pages de l'Application — Gestion Tournois

## 1. Objectif

Ce document définit toutes les pages nécessaires pour le frontend React de l'application **Gestion Tournois**.

L'application doit permettre de gérer :

* les saisons sportives ;
* les championnats ;
* les tournois ;
* les équipes ;
* les joueurs ;
* les matchs ;
* les compositions d'équipes ;
* les classements ;
* les statistiques.

---

## 2. Acteurs

L'application possède deux types d'utilisateurs principaux.

### 2.1 Admin / Responsable sportif

L'admin peut gérer toutes les données de l'application :

* ajouter, modifier, supprimer et consulter les saisons ;
* gérer les championnats ;
* gérer les tournois ;
* gérer les équipes ;
* gérer les joueurs ;
* planifier les matchs ;
* saisir les résultats ;
* gérer les compositions ;
* générer les classements ;
* consulter les statistiques.

### 2.2 Utilisateur simple / Viewer

Le viewer peut seulement consulter les informations publiques :

* équipes ;
* joueurs ;
* matchs ;
* résultats ;
* classements ;
* statistiques.

---

# 3. Liste complète des pages

## 3.1 Pages d'authentification

| Page          | Route       | Description                          | Accès     |
| ------------- | ----------- | ------------------------------------ | --------- |
| Login Page    | `/login`    | Connexion avec email et mot de passe | Public    |
| Register Page | `/register` | Création d'un compte utilisateur     | Optionnel |

### Remarque

Pour la première version du projet, la page `Register` n'est pas obligatoire.
L'admin peut créer les utilisateurs manuellement.

---

## 3.2 Pages principales

| Page           | Route        | Description                   | Accès          |
| -------------- | ------------ | ----------------------------- | -------------- |
| Dashboard Page | `/dashboard` | Vue générale de l'application | Admin / Viewer |

### Contenu du Dashboard

Le dashboard doit afficher :

* nombre total de saisons ;
* nombre total de championnats ;
* nombre total de tournois ;
* nombre total d'équipes ;
* nombre total de joueurs ;
* nombre total de matchs ;
* prochains matchs ;
* derniers résultats ;
* meilleures équipes.

---

## 3.3 Pages des saisons

| Page                | Route          | Description          | Accès          |
| ------------------- | -------------- | -------------------- | -------------- |
| Seasons Page        | `/seasons`     | Liste des saisons    | Admin / Viewer |
| Season Details Page | `/seasons/:id` | Détails d'une saison | Admin / Viewer |

### Actions Admin

Sur la page des saisons, l'admin peut :

* ajouter une saison ;
* modifier une saison ;
* supprimer une saison ;
* consulter une saison.

### Données affichées

* nom de la saison ;
* date de début ;
* date de fin ;
* statut.

---

## 3.4 Pages des championnats

| Page                      | Route                        | Description                        | Accès          |
| ------------------------- | ---------------------------- | ---------------------------------- | -------------- |
| Championships Page        | `/championships`             | Liste des championnats             | Admin / Viewer |
| Championship Details Page | `/championships/:id`         | Détails d'un championnat           | Admin / Viewer |
| Championship Teams Page   | `/championships/:id/teams`   | Gestion des équipes du championnat | Admin          |
| Championship Ranking Page | `/championships/:id/ranking` | Classement d'un championnat        | Admin / Viewer |

### Actions Admin

L'admin peut :

* créer un championnat ;
* modifier un championnat ;
* supprimer un championnat ;
* associer un championnat à une saison ;
* ajouter des équipes au championnat ;
* retirer des équipes du championnat.

### Données affichées

* nom du championnat ;
* saison liée ;
* description ;
* statut ;
* équipes participantes ;
* matchs du championnat ;
* classement.

---

## 3.5 Pages des tournois

| Page                    | Route                      | Description                    | Accès          |
| ----------------------- | -------------------------- | ------------------------------ | -------------- |
| Tournaments Page        | `/tournaments`             | Liste des tournois             | Admin / Viewer |
| Tournament Details Page | `/tournaments/:id`         | Détails d'un tournoi           | Admin / Viewer |
| Tournament Teams Page   | `/tournaments/:id/teams`   | Gestion des équipes du tournoi | Admin          |
| Tournament Ranking Page | `/tournaments/:id/ranking` | Classement d'un tournoi        | Admin / Viewer |

### Actions Admin

L'admin peut :

* créer un tournoi ;
* modifier un tournoi ;
* supprimer un tournoi ;
* associer un tournoi à une saison ;
* ajouter des équipes au tournoi ;
* retirer des équipes du tournoi.

### Données affichées

* nom du tournoi ;
* saison liée ;
* description ;
* date de début ;
* date de fin ;
* statut ;
* équipes participantes ;
* matchs du tournoi ;
* classement.

---

## 3.6 Pages des équipes

| Page                 | Route                   | Description               | Accès          |
| -------------------- | ----------------------- | ------------------------- | -------------- |
| Teams Page           | `/teams`                | Liste des équipes         | Admin / Viewer |
| Team Details Page    | `/teams/:id`            | Détails d'une équipe      | Admin / Viewer |
| Team Statistics Page | `/teams/:id/statistics` | Statistiques d'une équipe | Admin / Viewer |

### Actions Admin

L'admin peut :

* ajouter une équipe ;
* modifier une équipe ;
* supprimer une équipe ;
* ajouter un logo d'équipe ;
* associer une équipe à un championnat ;
* associer une équipe à un tournoi.

### Données affichées

* nom de l'équipe ;
* logo ;
* ville ;
* joueurs ;
* matchs ;
* statistiques.

---

## 3.7 Pages des joueurs

| Page                   | Route                     | Description              | Accès          |
| ---------------------- | ------------------------- | ------------------------ | -------------- |
| Players Page           | `/players`                | Liste des joueurs        | Admin / Viewer |
| Player Details Page    | `/players/:id`            | Détails d'un joueur      | Admin / Viewer |
| Player Statistics Page | `/players/:id/statistics` | Statistiques d'un joueur | Admin / Viewer |

### Actions Admin

L'admin peut :

* ajouter un joueur ;
* modifier un joueur ;
* supprimer un joueur ;
* associer un joueur à une équipe ;
* ajouter une photo de joueur.

### Données affichées

* prénom ;
* nom ;
* équipe ;
* date de naissance ;
* poste ;
* numéro ;
* photo ;
* statistiques.

---

## 3.8 Pages des matchs

| Page                   | Route                      | Description             | Accès          |
| ---------------------- | -------------------------- | ----------------------- | -------------- |
| Matches Page           | `/matches`                 | Liste des matchs        | Admin / Viewer |
| Match Details Page     | `/matches/:id`             | Détails d'un match      | Admin / Viewer |
| Match Form Page        | `/matches/create`          | Création d'un match     | Admin          |
| Match Edit Page        | `/matches/:id/edit`        | Modification d'un match | Admin          |
| Match Result Page      | `/matches/:id/result`      | Saisie du résultat      | Admin          |
| Match Composition Page | `/matches/:id/composition` | Composition des équipes | Admin          |
| Match Statistics Page  | `/matches/:id/statistics`  | Statistiques du match   | Admin          |

### Actions Admin

L'admin peut :

* planifier un match ;
* choisir l'équipe domicile ;
* choisir l'équipe extérieure ;
* choisir la date et l'heure du match ;
* modifier le statut du match ;
* saisir le score ;
* gérer les compositions ;
* ajouter les statistiques du match.

### Données affichées

* compétition liée ;
* équipe domicile ;
* équipe extérieure ;
* date du match ;
* score ;
* statut ;
* composition ;
* statistiques.

### Règle importante

Un match appartient soit à un championnat, soit à un tournoi.

Il ne doit pas appartenir aux deux en même temps.

---

## 3.9 Pages des compositions

| Page                   | Route                      | Description                                    | Accès |
| ---------------------- | -------------------------- | ---------------------------------------------- | ----- |
| Match Composition Page | `/matches/:id/composition` | Gestion des joueurs sélectionnés pour un match | Admin |

### Objectif

La page de composition permet de sélectionner les joueurs qui participent à un match.

### Données nécessaires

* match ;
* équipe ;
* joueur ;
* rôle.

### Rôles possibles

* `starter` : titulaire ;
* `substitute` : remplaçant.

---

## 3.10 Pages des classements

| Page                      | Route                        | Description                 | Accès          |
| ------------------------- | ---------------------------- | --------------------------- | -------------- |
| Rankings Page             | `/rankings`                  | Classements généraux        | Admin / Viewer |
| Championship Ranking Page | `/championships/:id/ranking` | Classement d'un championnat | Admin / Viewer |
| Tournament Ranking Page   | `/tournaments/:id/ranking`   | Classement d'un tournoi     | Admin / Viewer |

### Colonnes du classement

Le tableau de classement doit afficher :

* équipe ;
* matchs joués ;
* victoires ;
* matchs nuls ;
* défaites ;
* buts marqués ;
* buts encaissés ;
* différence de buts ;
* points.

### Règles de calcul

* victoire = 3 points ;
* match nul = 1 point ;
* défaite = 0 point.

### Ordre du classement

Le classement est trié par :

1. points ;
2. différence de buts ;
3. buts marqués ;
4. nom de l'équipe.

---

## 3.11 Pages des statistiques

| Page                   | Route                     | Description               | Accès          |
| ---------------------- | ------------------------- | ------------------------- | -------------- |
| Statistics Page        | `/statistics`             | Statistiques générales    | Admin / Viewer |
| Match Statistics Page  | `/matches/:id/statistics` | Statistiques d'un match   | Admin          |
| Player Statistics Page | `/players/:id/statistics` | Statistiques d'un joueur  | Admin / Viewer |
| Team Statistics Page   | `/teams/:id/statistics`   | Statistiques d'une équipe | Admin / Viewer |

### Exemples de statistiques

* buts ;
* passes décisives ;
* cartons jaunes ;
* cartons rouges ;
* fautes ;
* arrêts ;
* buts contre son camp.

### Données affichées

* joueur ;
* équipe ;
* match ;
* type de statistique ;
* valeur.

---

## 3.12 Pages des utilisateurs

| Page         | Route      | Description                      | Accès          |
| ------------ | ---------- | -------------------------------- | -------------- |
| Users Page   | `/users`   | Gestion des utilisateurs         | Admin          |
| Profile Page | `/profile` | Profil de l'utilisateur connecté | Admin / Viewer |

### Actions Admin

L'admin peut :

* consulter les utilisateurs ;
* créer un utilisateur ;
* modifier le rôle d'un utilisateur ;
* supprimer un utilisateur.

### Rôles possibles

* `admin` ;
* `viewer`.

---

## 3.13 Pages d'erreur

| Page              | Route           | Description          | Accès          |
| ----------------- | --------------- | -------------------- | -------------- |
| Unauthorized Page | `/unauthorized` | Accès refusé         | Admin / Viewer |
| Not Found Page    | `*`             | Page introuvable 404 | Public         |

---

# 4. Pages nécessaires pour le prototype

Pour le prototype, il n'est pas nécessaire de créer toutes les pages séparément.

La meilleure solution est de créer les pages principales avec des formulaires ou modals à l'intérieur.

## 4.1 Pages obligatoires du prototype

| Priorité | Page                   | Route                      | Obligatoire |
| -------- | ---------------------- | -------------------------- | ----------- |
| 1        | Login Page             | `/login`                   | Oui         |
| 2        | Dashboard Page         | `/dashboard`               | Oui         |
| 3        | Seasons Page           | `/seasons`                 | Oui         |
| 4        | Championships Page     | `/championships`           | Oui         |
| 5        | Tournaments Page       | `/tournaments`             | Oui         |
| 6        | Teams Page             | `/teams`                   | Oui         |
| 7        | Players Page           | `/players`                 | Oui         |
| 8        | Matches Page           | `/matches`                 | Oui         |
| 9        | Match Result Page      | `/matches/:id/result`      | Oui         |
| 10       | Match Composition Page | `/matches/:id/composition` | Oui         |
| 11       | Rankings Page          | `/rankings`                | Oui         |
| 12       | Statistics Page        | `/statistics`              | Oui         |
| 13       | Users Page             | `/users`                   | Optionnel   |
| 14       | Profile Page           | `/profile`                 | Optionnel   |
| 15       | Not Found Page         | `*`                        | Oui         |

---

# 5. Pages recommandées pour la version complète

Pour une version complète et bien organisée, l'application peut contenir environ 30 pages.

| N° | Page                      | Route                        |
| -- | ------------------------- | ---------------------------- |
| 1  | Login Page                | `/login`                     |
| 2  | Register Page             | `/register`                  |
| 3  | Dashboard Page            | `/dashboard`                 |
| 4  | Seasons Page              | `/seasons`                   |
| 5  | Season Details Page       | `/seasons/:id`               |
| 6  | Championships Page        | `/championships`             |
| 7  | Championship Details Page | `/championships/:id`         |
| 8  | Championship Teams Page   | `/championships/:id/teams`   |
| 9  | Championship Ranking Page | `/championships/:id/ranking` |
| 10 | Tournaments Page          | `/tournaments`               |
| 11 | Tournament Details Page   | `/tournaments/:id`           |
| 12 | Tournament Teams Page     | `/tournaments/:id/teams`     |
| 13 | Tournament Ranking Page   | `/tournaments/:id/ranking`   |
| 14 | Teams Page                | `/teams`                     |
| 15 | Team Details Page         | `/teams/:id`                 |
| 16 | Team Statistics Page      | `/teams/:id/statistics`      |
| 17 | Players Page              | `/players`                   |
| 18 | Player Details Page       | `/players/:id`               |
| 19 | Player Statistics Page    | `/players/:id/statistics`    |
| 20 | Matches Page              | `/matches`                   |
| 21 | Match Details Page        | `/matches/:id`               |
| 22 | Match Form Page           | `/matches/create`            |
| 23 | Match Edit Page           | `/matches/:id/edit`          |
| 24 | Match Result Page         | `/matches/:id/result`        |
| 25 | Match Composition Page    | `/matches/:id/composition`   |
| 26 | Match Statistics Page     | `/matches/:id/statistics`    |
| 27 | Rankings Page             | `/rankings`                  |
| 28 | Statistics Page           | `/statistics`                |
| 29 | Users Page                | `/users`                     |
| 30 | Profile Page              | `/profile`                   |
| 31 | Unauthorized Page         | `/unauthorized`              |
| 32 | Not Found Page            | `*`                          |

---

# 6. Structure recommandée dans React

```txt
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   │
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   │
│   ├── seasons/
│   │   ├── SeasonsPage.jsx
│   │   └── SeasonDetailsPage.jsx
│   │
│   ├── championships/
│   │   ├── ChampionshipsPage.jsx
│   │   ├── ChampionshipDetailsPage.jsx
│   │   ├── ChampionshipTeamsPage.jsx
│   │   └── ChampionshipRankingPage.jsx
│   │
│   ├── tournaments/
│   │   ├── TournamentsPage.jsx
│   │   ├── TournamentDetailsPage.jsx
│   │   ├── TournamentTeamsPage.jsx
│   │   └── TournamentRankingPage.jsx
│   │
│   ├── teams/
│   │   ├── TeamsPage.jsx
│   │   ├── TeamDetailsPage.jsx
│   │   └── TeamStatisticsPage.jsx
│   │
│   ├── players/
│   │   ├── PlayersPage.jsx
│   │   ├── PlayerDetailsPage.jsx
│   │   └── PlayerStatisticsPage.jsx
│   │
│   ├── matches/
│   │   ├── MatchesPage.jsx
│   │   ├── MatchDetailsPage.jsx
│   │   ├── MatchFormPage.jsx
│   │   ├── MatchResultPage.jsx
│   │   ├── MatchCompositionPage.jsx
│   │   └── MatchStatisticsPage.jsx
│   │
│   ├── rankings/
│   │   └── RankingsPage.jsx
│   │
│   ├── statistics/
│   │   └── StatisticsPage.jsx
│   │
│   ├── users/
│   │   └── UsersPage.jsx
│   │
│   ├── profile/
│   │   └── ProfilePage.jsx
│   │
│   └── errors/
│       ├── UnauthorizedPage.jsx
│       └── NotFoundPage.jsx
```

---

# 7. Sidebar navigation

La sidebar de l'application doit contenir les liens principaux suivants :

```txt
Dashboard
Saisons
Championnats
Tournois
Équipes
Joueurs
Matchs
Classements
Statistiques
Utilisateurs
Profil
```

Pour le viewer, les liens de gestion peuvent être limités.

---

# 8. Décision finale

Pour gagner du temps, il est recommandé de commencer avec les pages suivantes :

```txt
/login
/dashboard
/seasons
/championships
/tournaments
/teams
/players
/matches
/rankings
/statistics
/users
*
```

Les formulaires d'ajout et de modification peuvent être créés sous forme de modals dans chaque page principale.

Cela permet de réduire le nombre de pages à développer tout en respectant les fonctionnalités principales du projet.
