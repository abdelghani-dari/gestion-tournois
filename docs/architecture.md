# Architecture Technique — Gestion Tournois

## 1. Objectif

Ce document présente l'architecture technique de l'application Gestion Tournois.

L'application suit une architecture web moderne basée sur :

- un frontend React ;
- un backend Laravel ;
- une base de données PostgreSQL ;
- une communication via API REST ;
- un environnement local Docker Compose.

La nouvelle orientation du projet transforme l'application en plateforme football capable de gérer :

- des compétitions officielles ou majeures ;
- des compétitions locales créées par les organizers ;
- des équipes gérées par des team managers ;
- un feed football simple ;
- des paiements simulés pour l'activation du rôle organizer.

## 2. Architecture générale

```txt
Utilisateur
    |
    v
React Frontend
    |
    | HTTP / REST API
    v
Laravel Backend
    |
    | SQL
    v
PostgreSQL Database
```

## 3. Diagramme d'architecture

```mermaid
flowchart TD
    User[Utilisateur] --> Frontend[React Frontend]

    Frontend -->|REST API / HTTP| Backend[Laravel Backend]

    Backend -->|SQL Queries| Database[(PostgreSQL Database)]

    Docker[Docker Compose] --> Frontend
    Docker --> Backend
    Docker --> Database

    Backend --> Auth[Auth & Roles]
    Backend --> Payments[Fake Payment]
    Backend --> Competitions[Official & Local Competitions]
    Backend --> Results[Result Validation]
    Backend --> Feed[Football Feed]
```

## 4. Services Docker

Le projet est lancé avec une seule commande :

```bash
docker compose up -d --build
```

Cette commande lance les services suivants :

| Service | Container | Port |
|---|---|---|
| frontend | gt-frontend | 5173 |
| backend | gt-backend | 8000 |
| postgres | gt-postgres | 5433 sur Windows / 5432 dans Docker |

## 5. Communication entre les services

### Frontend vers Backend

Le frontend React communique avec Laravel via des requêtes HTTP vers l'API REST.

Exemples :

```txt
GET /api/tournaments
POST /api/tournaments
GET /api/championships
POST /api/championships
GET /api/matches
PUT /api/matches/{id}/result
POST /api/join-requests
POST /api/fake-payments
GET /api/posts
```

### Backend vers Base de données

Laravel communique avec PostgreSQL avec cette configuration Docker :

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=gestion_tournois
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## 6. Modules principaux

### Authentification et rôles

Le système utilise les rôles suivants :

```txt
admin
organizer
team_manager
viewer
```

Chaque rôle possède des permissions différentes.

### Gestion des compétitions

Les championnats et tournois peuvent être :

```txt
level  = international / national / local
source = official / user_created
```

### Gestion des demandes de participation

Un team manager peut demander à faire participer son équipe à une compétition locale.

L'organizer peut accepter ou refuser la demande.

### Gestion des résultats locaux

Les résultats locaux utilisent :

```txt
pending
confirmed
disputed
```

Seuls les résultats confirmés sont utilisés dans les classements.

### Feed football

Le feed permet d'afficher des annonces, actualités et résultats liés aux compétitions.

## 7. Stockage des images

Les images uploadées sont stockées dans Laravel :

```txt
backend/storage/app/public
```

La base de données stocke seulement le chemin de l'image.

Exemples :

```txt
teams/logo.png
players/photo.jpg
tournaments/banner.jpg
posts/post-image.jpg
```

## 8. Avantages de cette architecture

- Séparation claire entre frontend et backend.
- API REST réutilisable.
- Base de données PostgreSQL robuste.
- Lancement simple avec Docker Compose.
- Environnement identique pour les membres de l'équipe.
- Maintenance plus facile.
- Possibilité d'ajouter plus tard une vraie API football.
- Possibilité d'ajouter plus tard un vrai paiement en ligne.
