# Gestion Tournois — Application de Gestion Sportive

Application web de gestion sportive permettant de gérer les saisons, championnats, tournois, équipes, joueurs, matchs, compositions, classements et statistiques.

## Technologies utilisées

- Backend : Laravel
- Frontend : React
- Base de données : PostgreSQL
- API : REST API
- Déploiement local : Docker + Docker Compose
- Versioning : Git + GitHub

## Prérequis

Avant de lancer le projet, installer :

- Git
- Docker Desktop

## Installation avec Docker

Cloner le projet :

```bash
git clone https://github.com/abdelghani-dari/gestion-tournois.git
cd gestion-tournois
```

Lancer tous les services :

```bash
docker compose up -d --build
```

Installer les dépendances Laravel si nécessaire :

```bash
docker compose exec backend composer install
```

Créer le fichier `.env` du backend :

```bash
docker compose exec backend cp .env.example .env
```

Générer la clé Laravel :

```bash
docker compose exec backend php artisan key:generate
```

Lancer les migrations :

```bash
docker compose exec backend php artisan migrate
```

Créer le lien symbolique pour les images uploadées :

```bash
docker compose exec backend php artisan storage:link
```

## Accès à l'application

Frontend :

```txt
http://localhost:5173
```

Backend Laravel :

```txt
http://localhost:8000
```

PostgreSQL depuis Windows :

```txt
localhost:5433
```

PostgreSQL depuis Docker/Laravel :

```txt
postgres:5432
```

## Configuration base de données Docker

Dans `backend/.env.example`, la configuration Docker est :

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=gestion_tournois
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## Gestion des images

Les images uploadées par les utilisateurs doivent être stockées dans Laravel :

```txt
backend/storage/app/public
```

La base de données doit stocker seulement le chemin de l'image.

Exemples :

```txt
teams/logo.png
players/photo.jpg
tournaments/banner.jpg
```

Les images statiques utilisées uniquement par l'interface React doivent être placées dans :

```txt
frontend/src/assets
```

ou :

```txt
frontend/public
```

## Commandes utiles

Voir les containers :

```bash
docker compose ps
```

Arrêter les containers :

```bash
docker compose down
```

Redémarrer le projet :

```bash
docker compose up -d
```

Voir les logs :

```bash
docker compose logs -f
```

Accéder au backend :

```bash
docker compose exec backend bash
```

## Workflow Git recommandé

- `main` doit rester stable.
- Chaque membre travaille dans sa propre branche.
- Ne pas pousser directement sur `main`.
- Utiliser des Pull Requests.
- Ne jamais pousser `.env`.
- Ne jamais pousser `node_modules` ou `vendor`.

Exemples de branches :

```txt
feature/teams-crud
feature/players-crud
feature/matches
feature/rankings
docs/conception
docs/readme-setup
```

## Prochaines étapes

- Finaliser la conception UML.
- Créer le diagramme de cas d'utilisation.
- Créer le diagramme de classes.
- Créer le schéma de base de données.
- Développer les migrations Laravel.
- Développer les API REST.
- Créer les pages React.