# Documentation Technique — Gestion Tournois Locaux

## 1. Présentation technique

**Gestion Tournois Locaux** est une application web basée sur une architecture frontend/backend.

L'application permet de gérer :

- les utilisateurs ;
- les tournois locaux ;
- la validation des tournois par l'admin ;
- les équipes ;
- les joueurs ;
- les demandes de participation ;
- les matchs ;
- les résultats ;
- les classements ;
- les statistiques.

L'application ne gère pas les championnats, les compétitions officielles ni les paiements.

## 2. Stack technique

| Partie | Technologie |
|---|---|
| Frontend | React |
| Backend | Laravel |
| Base de données | PostgreSQL |
| API | REST API |
| Conteneurisation | Docker + Docker Compose |
| Versioning | Git + GitHub |

## 3. Structure du projet

```txt
gestion-tournois/
│
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│   ├── architecture.md
│   ├── cahier-des-charges.md
│   ├── class-diagram.md
│   ├── conception.md
│   ├── database-schema.md
│   ├── fiche-de-cadrage.md
│   ├── planning.md
│   ├── sequence-diagrams.md
│   └── use-case-diagram.md
│
├── docker-compose.yml
└── README.md
```

## 4. Architecture

```txt
React Frontend
      |
      | REST API
      v
Laravel Backend
      |
      v
PostgreSQL Database
```

Docker Compose lance les trois services :

- frontend ;
- backend ;
- postgres.

## 5. Services Docker

| Service | Container | Port |
|---|---|---|
| frontend | gt-frontend | 5173 |
| backend | gt-backend | 8000 |
| postgres | gt-postgres | 5433 sur Windows / 5432 dans Docker |

Commande principale :

```bash
docker compose up -d --build
```

## 6. Backend Laravel

Le backend Laravel contient :

- les modèles ;
- les migrations ;
- les contrôleurs API ;
- les routes API ;
- la logique métier ;
- la validation des données ;
- la gestion des rôles ;
- la validation admin ;
- la gestion des uploads.

## 7. Routes API prévues

### Auth

```txt
POST /api/register
POST /api/login
POST /api/logout
```

### Admin

```txt
GET /api/admin/tournaments/pending
GET /api/admin/tournaments
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

Règle : `GET /api/tournaments` retourne seulement les tournois acceptés.

### Teams

```txt
GET /api/teams
POST /api/teams
GET /api/teams/{id}
PUT /api/teams/{id}
DELETE /api/teams/{id}
GET /api/my-teams
```

### Players

```txt
GET /api/players
POST /api/players
GET /api/players/{id}
PUT /api/players/{id}
DELETE /api/players/{id}
```

### Join Requests

```txt
GET /api/join-requests
POST /api/join-requests
GET /api/join-requests/{id}
PUT /api/join-requests/{id}/accept
PUT /api/join-requests/{id}/refuse
```

### Matches

```txt
GET /api/matches
POST /api/matches
GET /api/matches/{id}
PUT /api/matches/{id}
DELETE /api/matches/{id}
PUT /api/matches/{id}/result
PUT /api/matches/{id}/confirm-result
PUT /api/matches/{id}/dispute-result
```

### Rankings

```txt
GET /api/rankings?tournament_id=1
POST /api/rankings/recalculate
```

### Statistics

```txt
GET /api/statistics
POST /api/statistics
GET /api/statistics/{id}
PUT /api/statistics/{id}
DELETE /api/statistics/{id}
```

## 8. Frontend React

Le frontend contient :

- pages principales ;
- composants réutilisables ;
- appels API ;
- formulaires ;
- tableaux d'affichage ;
- dashboard utilisateur ;
- dashboard admin.

### Pages publiques

- Accueil.
- Liste des tournois acceptés.
- Détail tournoi.
- Matchs.
- Résultats.
- Classement.
- Statistiques.

### Pages authentification

- Register.
- Login.

### Pages Admin

- Dashboard Admin.
- Tournois en attente.
- Tous les tournois.
- Acceptation / refus d'un tournoi.

### Pages User

- Dashboard User.
- Mes tournois.
- Créer tournoi.
- Mes équipes.
- Créer équipe.
- Joueurs.
- Mes demandes.

### Pages Créateur du tournoi

- Détail de mon tournoi.
- Demandes de participation.
- Équipes participantes.
- Création des matchs.
- Saisie des résultats.
- Classement.

## 9. Base de données PostgreSQL

Configuration Docker utilisée par Laravel :

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=gestion_tournois
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Tables principales :

- users ;
- tournaments ;
- teams ;
- players ;
- tournament_team ;
- join_requests ;
- match_games ;
- compositions ;
- rankings ;
- statistics.

## 10. Gestion des rôles et permissions

| Rôle | Permissions principales |
|---|---|
| admin | Valider/refuser les tournois, superviser la plateforme |
| user | Créer tournois, équipes, joueurs, demander participation |

Règles de sécurité :

```txt
Un user ne peut modifier que les tournois où created_by = son user_id.
Un user ne peut modifier que les équipes où manager_id = son user_id.
Un tournoi doit être accepted pour être visible publiquement.
Un tournoi doit être accepted pour recevoir des demandes de participation.
```

## 11. Gestion des résultats

Les résultats passent par trois états :

```txt
pending
confirmed
disputed
```

Seuls les résultats `confirmed` sont utilisés dans le calcul du classement.

## 12. Gestion des images

Les images uploadées sont stockées dans :

```txt
backend/storage/app/public
```

La base de données stocke uniquement le chemin.

Exemples :

```txt
teams/logo.png
players/photo.jpg
tournaments/banner.jpg
```

Commande Laravel nécessaire :

```bash
php artisan storage:link
```

Avec Docker :

```bash
docker compose exec backend php artisan storage:link
```

## 13. Workflow Git

Règles recommandées :

- `main` reste stable.
- Chaque membre travaille dans une branche.
- Ne pas pousser directement vers `main`.
- Utiliser des Pull Requests.
- Ne jamais pousser `.env`.
- Ne jamais pousser `node_modules`.
- Ne jamais pousser `vendor`.

Exemples de branches :

```txt
feature/auth-users
feature/admin-tournament-approval
feature/tournaments-crud
feature/teams-players
feature/join-requests
feature/matches-results
feature/rankings-statistics
docs/local-tournament-docs
```

## 14. Sécurité

Mesures prévues :

- mots de passe hashés ;
- validation des données côté backend ;
- routes protégées selon le rôle ;
- restriction par propriétaire des données ;
- fichier `.env` non versionné ;
- contrôle des fichiers uploadés ;
- limitation des types et tailles d'images.

## 15. Tests prévus

- test du lancement Docker ;
- test des migrations ;
- test des routes API ;
- test de l'inscription et connexion ;
- test de création tournoi ;
- test d'acceptation/refus par admin ;
- test de création équipe ;
- test de création joueurs ;
- test des demandes de participation ;
- test de création match ;
- test de saisie résultat ;
- test du calcul de classement ;
- test des statistiques ;
- test des formulaires React.
