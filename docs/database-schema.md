# Schéma de Base de Données — Gestion Tournois

## 1. Objectif

Ce document définit la nouvelle version du schéma de base de données de l'application **Gestion Tournois**.

L'application devient une plateforme football permettant de gérer à la fois :

- des compétitions officielles ou majeures : Coupe du Monde, Ligue des Champions, La Liga, Botola, etc. ;
- des compétitions locales créées par des organisateurs : tournois de quartier, tournois Ramadan, compétitions scolaires, associations sportives, etc. ;
- les équipes, joueurs, matchs, compositions, résultats, classements, statistiques et publications.

La base de données utilisée est **PostgreSQL**.

> Remarque : pour éviter de casser le développement déjà commencé, on conserve les tables `championships` et `tournaments`, mais on leur ajoute des champs pour distinguer les compétitions officielles et locales.

---

## 2. Tables principales

### users

Table des utilisateurs de l'application.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| name | string | Nom de l'utilisateur |
| email | string | Email unique |
| password | string | Mot de passe hashé |
| role | string | admin, organizer, team_manager, viewer |
| payment_status | string | unpaid, paid |
| subscription_plan | string | free, organizer |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

### Rôles

| Rôle | Description |
|---|---|
| admin | Gère toute la plateforme et les compétitions officielles |
| organizer | Crée et gère ses propres compétitions locales |
| team_manager | Crée une équipe, ajoute les joueurs et demande la participation aux compétitions locales |
| viewer | Consulte les matchs, résultats, classements, statistiques et publications |

---

### fake_payments

Table utilisée pour simuler le paiement dans le prototype PFE.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| user_id | bigint | Clé étrangère vers users |
| plan | string | Exemple : organizer |
| amount | decimal | Montant simulé |
| status | string | pending, paid, failed |
| paid_at | timestamp nullable | Date du paiement simulé |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Règle : lorsqu'un utilisateur effectue un faux paiement réussi, son `payment_status` devient `paid` et son rôle peut devenir `organizer`.

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

Un championnat représente une compétition sous forme de ligue, par exemple La Liga, Botola, Premier League ou une ligue locale.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| season_id | bigint | Clé étrangère vers seasons |
| created_by | bigint | Clé étrangère vers users, admin ou organizer |
| name | string | Nom du championnat |
| description | text | Description |
| level | string | international, national, local |
| source | string | official, user_created |
| city | string nullable | Ville, surtout pour les compétitions locales |
| country | string nullable | Pays |
| status | string | draft, active, finished |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Exemples :

| name | level | source | created_by |
|---|---|---|---|
| La Liga | national | official | admin |
| Botola Pro | national | official | admin |
| Quartier League | local | user_created | organizer |

---

### tournaments

Table des tournois.

Un tournoi représente une compétition limitée dans le temps, souvent avec élimination directe ou groupes, par exemple Coupe du Monde, Ligue des Champions, tournoi Ramadan, tournoi scolaire, etc.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| season_id | bigint | Clé étrangère vers seasons |
| created_by | bigint | Clé étrangère vers users, admin ou organizer |
| name | string | Nom du tournoi |
| description | text | Description |
| level | string | international, national, local |
| source | string | official, user_created |
| city | string nullable | Ville, surtout pour les compétitions locales |
| country | string nullable | Pays |
| start_date | date | Date de début |
| end_date | date | Date de fin |
| status | string | draft, active, finished |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Exemples :

| name | level | source | created_by |
|---|---|---|---|
| World Cup | international | official | admin |
| Champions League | international | official | admin |
| Ramadan Cup Taourirt | local | user_created | organizer |

---

### teams

Table des équipes.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| manager_id | bigint nullable | Clé étrangère vers users, propriétaire de l'équipe locale |
| name | string | Nom de l'équipe |
| logo_path | string nullable | Chemin du logo |
| city | string nullable | Ville |
| country | string nullable | Pays |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Règle :

- pour les équipes officielles, `manager_id` peut être null ;
- pour les équipes locales, `manager_id` correspond au `team_manager` qui gère l'équipe.

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

Dans la première version, les joueurs ne sont pas obligés d'avoir des comptes utilisateurs. Ils sont ajoutés manuellement par l'admin ou le team manager.

---

### match_games

Table des matchs.

Important : le nom `match` ne doit pas être utilisé car `match` est un mot réservé en PHP. Le nom recommandé est `MatchGame`.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| championship_id | bigint nullable | Clé étrangère vers championships |
| tournament_id | bigint nullable | Clé étrangère vers tournaments |
| created_by | bigint nullable | Clé étrangère vers users |
| home_team_id | bigint | Équipe domicile |
| away_team_id | bigint | Équipe extérieure |
| match_date | datetime | Date et heure du match |
| home_score | integer nullable | Score équipe domicile |
| away_score | integer nullable | Score équipe extérieure |
| status | string | scheduled, played, cancelled |
| result_status | string | pending, confirmed, disputed |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Règles :

- un match appartient soit à un championnat, soit à un tournoi ;
- pour les compétitions officielles, l'admin saisit les résultats et `result_status` peut être `confirmed` ;
- pour les compétitions locales, l'organizer saisit le résultat, puis les managers peuvent le confirmer ou le contester ;
- seuls les résultats `confirmed` sont utilisés pour calculer le classement.

---

### compositions

Table des compositions d'équipes pour chaque match.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| match_game_id | bigint | Clé étrangère vers match_games |
| team_id | bigint | Clé étrangère vers teams |
| player_id | bigint | Clé étrangère vers players |
| role | string | starter, substitute |
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
| stat_type | string | goal, assist, yellow_card, red_card, clean_sheet, etc. |
| value | integer | Valeur statistique |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

---

### join_requests

Table des demandes de participation des équipes aux compétitions locales.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| championship_id | bigint nullable | Clé étrangère vers championships |
| tournament_id | bigint nullable | Clé étrangère vers tournaments |
| team_id | bigint | Clé étrangère vers teams |
| manager_id | bigint | Clé étrangère vers users |
| status | string | pending, accepted, refused |
| message | text nullable | Message optionnel du manager |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Règle : lorsqu'une demande est acceptée, l'équipe est ajoutée à la table pivot correspondante : `championship_team` ou `tournament_team`.

---

### posts

Table des publications du feed social football.

| Champ | Type | Description |
|---|---|---|
| id | bigint | Clé primaire |
| user_id | bigint | Auteur du post |
| championship_id | bigint nullable | Championnat associé |
| tournament_id | bigint nullable | Tournoi associé |
| content | text | Contenu de la publication |
| image_path | string nullable | Image optionnelle |
| type | string | announcement, result, news, general |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Exemples de posts :

- Ouverture des inscriptions pour Ramadan Cup.
- Résultat final : Atlas FC 3 - 2 Lions FC.
- Finale du tournoi dimanche à 18h.

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
User 1 ---- * Championship : created_by
User 1 ---- * Tournament : created_by
User 1 ---- * Team : manager_id
User 1 ---- * FakePayment
User 1 ---- * Post
User 1 ---- * JoinRequest

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

Championship 1 ---- * JoinRequest
Tournament 1 ---- * JoinRequest
Team 1 ---- * JoinRequest

Championship 1 ---- * Post
Tournament 1 ---- * Post
```

---

## 5. Règles de classement

Règles simples proposées :

```txt
Victoire = 3 points
Match nul = 1 point
Défaite = 0 point
```

Le classement est trié par :

1. Points
2. Différence de buts
3. Buts marqués
4. Nom de l'équipe

Règle importante :

```txt
Seuls les matchs avec result_status = confirmed sont utilisés dans le calcul du classement.
```

---

## 6. Gestion des résultats locaux

Pour les compétitions locales, le résultat passe par plusieurs états :

| État | Signification |
|---|---|
| pending | Résultat saisi, en attente de confirmation |
| confirmed | Résultat validé |
| disputed | Résultat contesté par un manager |

Processus proposé :

```txt
1. L'organizer crée le match.
2. Le match est joué.
3. L'organizer saisit le score.
4. Le résultat devient pending.
5. Les managers peuvent confirmer ou contester.
6. L'organizer valide le résultat.
7. Le résultat devient confirmed.
8. Le classement est recalculé.
```

---

## 7. Gestion des images

Les images uploadées sont stockées dans Laravel :

```txt
backend/storage/app/public
```

La base de données stocke uniquement le chemin.

Exemples :

```txt
teams/logo.png
players/photo.jpg
tournaments/banner.jpg
posts/post-image.jpg
```
