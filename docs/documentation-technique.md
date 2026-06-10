# Documentation Technique — Gestion Tournois

## 1. Présentation technique

Gestion Tournois est une application web de gestion sportive basée sur une architecture frontend/backend.

L'application devient une plateforme football permettant de gérer :

- les compétitions officielles ou majeures ;
- les compétitions locales créées par les organisateurs ;
- les saisons ;
- les championnats ;
- les tournois ;
- les équipes ;
- les joueurs ;
- les matchs ;
- les compositions ;
- les résultats ;
- les classements ;
- les statistiques ;
- les publications d'un feed football simple ;
- les paiements simulés pour l'activation du rôle organizer.

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

- frontend
- backend
- postgres

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
- la simulation de paiement ;
- la gestion des demandes de participation ;
- la validation des résultats locaux ;
- la gestion des uploads.

### Routes API prévues

```txt
Auth:
POST /api/register
POST /api/login
POST /api/fake-payments

Users:
GET /api/users
PUT /api/users/{id}

Seasons:
GET /api/seasons
POST /api/seasons
PUT /api/seasons/{id}
DELETE /api/seasons/{id}

Championships:
GET /api/championships
POST /api/championships
PUT /api/championships/{id}
DELETE /api/championships/{id}

Tournaments:
GET /api/tournaments
POST /api/tournaments
PUT /api/tournaments/{id}
DELETE /api/tournaments/{id}

Teams:
GET /api/teams
POST /api/teams
PUT /api/teams/{id}
DELETE /api/teams/{id}

Players:
GET /api/players
POST /api/players
PUT /api/players/{id}
DELETE /api/players/{id}

Join Requests:
GET /api/join-requests
POST /api/join-requests
PUT /api/join-requests/{id}/accept
PUT /api/join-requests/{id}/refuse

Matches:
GET /api/matches
POST /api/matches
PUT /api/matches/{id}
PUT /api/matches/{id}/result
PUT /api/matches/{id}/confirm-result
PUT /api/matches/{id}/dispute-result

Rankings:
GET /api/rankings

Statistics:
GET /api/statistics
POST /api/statistics

Posts:
GET /api/posts
POST /api/posts
DELETE /api/posts/{id}
```

## 7. Frontend React

Le frontend React contient :

- les pages principales ;
- les composants réutilisables ;
- les appels API ;
- les formulaires ;
- les tableaux d'affichage ;
- le dashboard ;
- la gestion des rôles côté interface.

### Pages publiques

- Home Feed
- Compétitions officielles
- Compétitions locales
- Détail compétition
- Matchs / Résultats
- Classements
- Statistiques
- Publications

### Pages authentification

- Register
- Login
- Choix du rôle
- Fake Payment / Upgrade Organizer

### Pages Admin

- Dashboard Admin
- Utilisateurs
- Compétitions officielles
- Championnats officiels
- Tournois officiels
- Matchs officiels
- Paiements simulés
- Publications

### Pages Organizer

- Dashboard Organizer
- Mes championnats
- Mes tournois
- Demandes de participation
- Équipes participantes
- Matchs
- Résultats
- Publications

### Pages Team Manager

- Dashboard Team Manager
- Mon équipe
- Mes joueurs
- Compétitions disponibles
- Mes demandes
- Confirmation ou contestation des résultats

## 8. Base de données PostgreSQL

Configuration Docker utilisée par Laravel :

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=gestion_tournois
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Tables principales prévues :

- users
- fake_payments
- seasons
- championships
- tournaments
- teams
- players
- match_games
- compositions
- rankings
- statistics
- join_requests
- posts
- championship_team
- tournament_team

## 9. Gestion des rôles et permissions

| Rôle | Permissions principales |
|---|---|
| admin | Gérer toute la plateforme |
| organizer | Gérer ses propres compétitions locales |
| team_manager | Gérer son équipe, ses joueurs et ses demandes |
| viewer | Consultation seulement |

Règle de sécurité :

```txt
Un organizer ne peut modifier que les compétitions où created_by = son user_id.
Un team_manager ne peut modifier que les équipes où manager_id = son user_id.
Un viewer ne peut pas créer, modifier ou supprimer des données.
```

## 10. Gestion des résultats locaux

Les résultats locaux passent par trois états :

```txt
pending
confirmed
disputed
```

Seuls les résultats `confirmed` sont utilisés dans le calcul du classement.

## 11. Paiement simulé

Le paiement réel n'est pas inclus dans la première version.

Le prototype utilise un système de paiement simulé :

```txt
1. L'utilisateur choisit le rôle organizer.
2. Il accède à la page Fake Payment.
3. Il clique sur Fake Pay.
4. Une ligne est créée dans fake_payments.
5. users.payment_status devient paid.
6. users.role devient organizer.
```

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
posts/post-image.jpg
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
feature/roles-and-auth
feature/fake-payments
feature/local-competitions
feature/join-requests
feature/matches-results
feature/posts-feed
feature/rankings-statistics
docs/conception
```

## 14. Sécurité

Mesures prévues :

- mots de passe hashés ;
- validation des données côté backend ;
- routes protégées selon les rôles ;
- restriction par propriétaire des données ;
- fichier `.env` non versionné ;
- contrôle des fichiers uploadés ;
- limitation des types et tailles d'images.

## 15. Tests prévus

- test du lancement Docker ;
- test des migrations ;
- test des routes API ;
- test des rôles ;
- test du paiement simulé ;
- test des demandes de participation ;
- test de la validation des résultats ;
- test des formulaires React ;
- test des uploads ;
- test du calcul du classement ;
- test des statistiques.

## 16. Maintenance

L'architecture séparée frontend/backend facilite :

- la maintenance du code ;
- l'ajout de nouvelles fonctionnalités ;
- le test des API ;
- le remplacement ou l'amélioration du frontend ;
- le travail en équipe.
