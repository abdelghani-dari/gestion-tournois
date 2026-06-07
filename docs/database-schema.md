# Schéma de Base de Données — Gestion Tournois

## 1. Objectif

Ce document définit la première version du schéma de base de données de l'application Gestion Tournois.

La base de données utilisée est PostgreSQL.

## 2. Tables principales

### users

Table des utilisateurs de l'application.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| name | string | Nom de l'utilisateur |
| email | string | Email unique |
| password | string | Mot de passe hashé |
| role | string | admin ou viewer |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### seasons

Table des saisons sportives.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| name | string | Exemple : Saison 2025/2026 |
| start_date | date | Date de début |
| end_date | date | Date de fin |
| status | string | active, closed, upcoming |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### championships

Table des championnats.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| season_id | bigint | Clé étrangère vers seasons |
| name | string | Nom du championnat |
| description | text | Description |
| status | string | draft, active, finished |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### tournaments

Table des tournois.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| season_id | bigint | Clé étrangère vers seasons |
| name | string | Nom du tournoi |
| description | text | Description |
| start_date | date | Date de début |
| end_date | date | Date de fin |
| status | string | draft, active, finished |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### teams

Table des équipes.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| name | string | Nom de l'équipe |
| logo_path | string nullable | Chemin du logo |
| city | string nullable | Ville |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### players

Table des joueurs.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| team_id | bigint | Clé étrangère vers teams |
| first_name | string | Prénom |
| last_name | string | Nom |
| birth_date | date nullable | Date de naissance |
| position | string nullable | Poste du joueur |
| number | integer nullable | Numéro du joueur |
| photo_path | string nullable | Chemin de la photo |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### match_games

Table des matchs.

Important : le nom `match` ne doit pas être utilisé car `match` est un mot réservé en PHP.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| championship_id | bigint nullable | Clé étrangère vers championships |
| tournament_id | bigint nullable | Clé étrangère vers tournaments |
| home_team_id | bigint | Équipe domicile |
| away_team_id | bigint | Équipe extérieure |
| match_date | datetime | Date et heure du match |
| home_score | integer nullable | Score équipe domicile |
| away_score | integer nullable | Score équipe extérieure |
| status | string | scheduled, played, cancelled |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### compositions

Table des compositions d'équipes pour chaque match.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| match_game_id | bigint | Clé étrangère vers match_games |
| team_id | bigint | Clé étrangère vers teams |
| player_id | bigint | Clé étrangère vers players |
| role | string | starter ou substitute |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### rankings

Table des classements.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| championship_id | bigint nullable | Clé étrangère vers championships |
| tournament_id | bigint nullable | Clé étrangère vers tournaments |
| team_id | bigint | Clé étrangère vers teams |
| played | integer | Matchs joués |
| wins | integer | Victoires |
| draws | integer | Matchs nuls |
| losses | integer | Défaites |
| goals_for | integer | Buts marqués |
| goals_against | integer | Buts encaissés |
| goal_difference | integer | Différence de buts |
| points | integer | Points |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### statistics

Table des statistiques.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| match_game_id | bigint nullable | Clé étrangère vers match_games |
| team_id | bigint nullable | Clé étrangère vers teams |
| player_id | bigint nullable | Clé étrangère vers players |
| stat_type | string | goal, assist, yellow_card, red_card, etc. |
| value | integer | Valeur statistique |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

## 3. Tables pivot

### championship_team

Relation entre les championnats et les équipes.

| Champ | Type |
|---|---|
| id | bigint |
| championship_id | bigint |
| team_id | bigint |
| created_at | timestamp |
| updated_at | timestamp |

---

### tournament_team

Relation entre les tournois et les équipes.

| Champ | Type |
|---|---|
| id | bigint |
| tournament_id | bigint |
| team_id | bigint |
| created_at | timestamp |
| updated_at | timestamp |

---

## 4. Relations principales

```txt
Season 1 ---- * Championship
Season 1 ---- * Tournament

Championship * ---- * Team
Tournament * ---- * Team

Team 1 ---- * Player

Championship 1 ---- * MatchGame
Tournament 1 ---- * MatchGame

MatchGame * ---- 1 Home Team
MatchGame * ---- 1 Away Team

MatchGame 1 ---- * Composition
Team 1 ---- * Composition
Player 1 ---- * Composition

Championship 1 ---- * Ranking
Tournament 1 ---- * Ranking
Team 1 ---- * Ranking

MatchGame 1 ---- * Statistic
Team 1 ---- * Statistic
Player 1 ---- * Statistic

5. Règles de classement

Règles simples proposées :

Victoire = 3 points
Match nul = 1 point
Défaite = 0 point

Le classement est trié par :

1. Points
2. Différence de buts
3. Buts marqués
4. Nom de l'équipe
6. Gestion des images

Les images uploadées sont stockées dans Laravel :

backend/storage/app/public

La base de données stocke uniquement le chemin.

Exemples :

teams/logo.png
players/photo.jpg
tournaments/banner.jpg