# Changements à Implémenter — Gestion Tournois Locaux

## 1. Objectif

Ce document résume les changements techniques à implémenter dans le code Laravel/React pour adapter le projet à la nouvelle orientation.

La nouvelle version gère uniquement les tournois locaux avec validation par l'administrateur.

## 2. À supprimer ou ignorer

### Tables / modules à supprimer

```txt
championships
championship_team
fake_payments
```

### Champs à supprimer ou ignorer

```txt
users.payment_status
users.subscription_plan
tournaments.level
tournaments.source
match_games.championship_id
rankings.championship_id
join_requests.championship_id
statistics.championship_id si existe
posts.championship_id si posts gardés
```

### Routes à supprimer

```txt
/api/championships
/api/fake-payments
```

## 3. Modifications base de données

### Modifier users

Garder seulement :

```txt
role: admin / user
```

Supprimer :

```txt
payment_status
subscription_plan
```

### Modifier tournaments

Ajouter ou garder :

```txt
created_by
name
description
city
location
banner_path
start_date
end_date
status: draft / open / active / finished / cancelled
approval_status: pending / accepted / refused
admin_note
approved_by
approved_at
```

### Modifier teams

Garder :

```txt
manager_id
name
logo_path
city
```

### Modifier match_games

Garder uniquement :

```txt
tournament_id
created_by
home_team_id
away_team_id
match_date
home_score
away_score
status
result_status
```

Supprimer :

```txt
championship_id
```

### Modifier rankings

Garder uniquement :

```txt
tournament_id
team_id
played
wins
draws
losses
goals_for
goals_against
goal_difference
points
```

Supprimer :

```txt
championship_id
```

### Modifier join_requests

Garder uniquement :

```txt
tournament_id
team_id
manager_id
status
message
```

Supprimer :

```txt
championship_id
```

## 4. Nouvelles règles métier

```txt
Admin:
- peut accepter ou refuser un tournoi.
- peut voir les tournois en attente.

User:
- peut créer un tournoi.
- peut créer une équipe.
- peut ajouter des joueurs.
- peut demander la participation à un tournoi accepté.

Créateur du tournoi:
- peut gérer uniquement ses propres tournois.
- peut accepter/refuser les demandes de participation.
- peut créer les matchs.
- peut saisir les résultats.
- peut recalculer le classement.
```

## 5. Routes backend recommandées

### Admin

```txt
GET /api/admin/tournaments/pending
PUT /api/admin/tournaments/{id}/accept
PUT /api/admin/tournaments/{id}/refuse
```

### Tournaments

```txt
GET /api/tournaments
POST /api/tournaments
GET /api/tournaments/{id}
PUT /api/tournaments/{id}
DELETE /api/tournaments/{id}
GET /api/my-tournaments
```

### Teams / Players

```txt
GET /api/teams
POST /api/teams
GET /api/my-teams
GET /api/players
POST /api/players
```

### Join Requests

```txt
POST /api/join-requests
PUT /api/join-requests/{id}/accept
PUT /api/join-requests/{id}/refuse
```

### Matches / Results

```txt
POST /api/matches
PUT /api/matches/{id}/result
PUT /api/matches/{id}/confirm-result
PUT /api/matches/{id}/dispute-result
```

### Rankings / Statistics

```txt
GET /api/rankings?tournament_id=1
POST /api/rankings/recalculate
GET /api/statistics
POST /api/statistics
```

## 6. Ordre recommandé de développement

```txt
1. Mettre à jour les migrations.
2. Mettre à jour les modèles et relations.
3. Supprimer ou ignorer Championships et FakePayments.
4. Ajouter approval_status dans tournaments.
5. Ajouter routes admin accept/refuse.
6. Adapter JoinRequest pour tournament_id seulement.
7. Adapter MatchGame pour tournament_id seulement.
8. Adapter Ranking pour tournament_id seulement.
9. Tester avec php artisan migrate:fresh --seed.
10. Créer un frontend simple de test.
```

## 7. Tests minimum à faire

```txt
php artisan migrate:fresh --seed
php artisan route:list
php -l app/Models/*.php
php -l app/Http/Controllers/Api/*.php
GET /api/tournaments
POST /api/tournaments
GET /api/admin/tournaments/pending
PUT /api/admin/tournaments/1/accept
POST /api/teams
POST /api/join-requests
PUT /api/join-requests/1/accept
POST /api/matches
PUT /api/matches/1/result
GET /api/rankings?tournament_id=1
```
