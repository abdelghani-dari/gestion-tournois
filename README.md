# Tournify — Gestion des Tournois Locaux

Application web de gestion de **tournois locaux de football** : création et validation de tournois, équipes, joueurs, matchs, résultats, classements et statistiques.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Laravel 11 (API REST) |
| Base de données | PostgreSQL |
| Conteneurisation | Docker Compose |
| Authentification | Laravel Sanctum (token Bearer) |

## Fonctionnalités principales

- Inscription / connexion (rôles **admin** et **user**)
- Création de tournoi local soumis à validation admin
- Gestion des équipes et joueurs (logos, photos)
- Demandes de participation aux tournois acceptés
- Planification des matchs et saisie des scores
- Confirmation / contestation des résultats
- Classement automatique par tournoi
- Statistiques (buts, passes, cartons)
- Dashboard avec graphiques et widgets filtrables
- Thèmes visuels : clair, slate (dark), zinc
- Page d'accueil publique (landing)

## Prérequis

- Git
- Docker Desktop

## Installation

```bash
git clone https://github.com/abdelghani-dari/gestion-tournois.git
cd gestion-tournois
docker compose up -d --build
```

Configuration backend (première fois) :

```bash
docker compose exec backend cp .env.example .env
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed
docker compose exec backend php artisan storage:link
```

## Accès

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Laravel | http://localhost:8000 |
| PostgreSQL (hôte Windows) | localhost:5433 |

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@example.com | password |
| Utilisateur | user@example.com | password |
| Créateur | creator2@example.com | password |

## Structure du projet

```txt
gestion-tournois/
├── backend/          # API Laravel
├── frontend/         # Application React (src/pages, src/components)
├── docs/             # Documentation PFE (français)
└── docker-compose.yml
```

## Documentation

Voir le dossier [`docs/`](docs/README_DOCS.md) :

- `documentation-technique.md` — référence technique complète
- `architecture.md` — architecture et diagrammes
- `cahier-des-charges.md` — besoins fonctionnels
- `suivi-realisation-user-stories.md` — suivi des user stories (phase finalisation)

## Équipe PFE

- **Abdelghani Dari** — Chef de projet
- **Mohamed Amaghyouz** — Tests et recette
- **Elmehdi Hajjab** — Développement frontend
- **Youssef Benali** — Développement frontend
- **Omar Idrissi** — Développement backend

## Licence

Projet académique — PFE encadré.
