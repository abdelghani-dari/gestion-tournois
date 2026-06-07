# Documentation Technique — Gestion Tournois

## 1. Présentation technique

Gestion Tournois est une application web de gestion sportive basée sur une architecture frontend/backend.

L'application permet de gérer les saisons, championnats, tournois, équipes, joueurs, matchs, compositions, classements et statistiques.

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
- la gestion des uploads.

Exemples de futures routes API :

```txt
GET /api/seasons
POST /api/seasons
GET /api/teams
POST /api/teams
GET /api/players
POST /api/players
GET /api/matches
POST /api/matches
GET /api/rankings
GET /api/statistics
```

## 7. Frontend React

Le frontend React contient :

- les pages principales ;
- les composants réutilisables ;
- les appels API ;
- les formulaires ;
- les tableaux d'affichage ;
- le dashboard.

Pages prévues :

- Dashboard
- Saisons
- Championnats
- Tournois
- Équipes
- Joueurs
- Matchs
- Compositions
- Classements
- Statistiques

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
- seasons
- championships
- tournaments
- teams
- players
- match_games
- compositions
- rankings
- statistics

## 9. Gestion des images

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

## 10. Workflow Git

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
feature/teams-crud
feature/players-crud
feature/matches
feature/rankings
docs/conception
```

## 11. Sécurité

Mesures prévues :

- mots de passe hashés ;
- validation des données côté backend ;
- routes protégées pour l'admin ;
- fichier `.env` non versionné ;
- contrôle des fichiers uploadés ;
- limitation des types et tailles d'images.

## 12. Tests prévus

- test du lancement Docker ;
- test des migrations ;
- test des routes API ;
- test des formulaires React ;
- test des uploads ;
- test du calcul du classement ;
- test des statistiques.

## 13. Maintenance

L'architecture séparée frontend/backend facilite :

- la maintenance du code ;
- l'ajout de nouvelles fonctionnalités ;
- le test des API ;
- le remplacement ou l'amélioration du frontend ;
- le travail en équipe.