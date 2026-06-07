# Rapport d'Avancement 1 — Gestion Tournois

## 1. Présentation

Ce document présente le premier état d'avancement du projet Gestion Tournois.

Le projet consiste à développer une application web de gestion sportive permettant de gérer les saisons, championnats, tournois, équipes, joueurs, matchs, compositions, classements et statistiques.

## 2. État d'avancement général

| Élément | Statut |
|---|---|
| Équipe constituée | Terminé |
| Sujet choisi | Terminé |
| Dépôt GitHub créé | Terminé |
| Technologies choisies | Terminé |
| Environnement Docker configuré | Terminé |
| Backend Laravel installé | Terminé |
| Frontend React installé | Terminé |
| PostgreSQL configuré | Terminé |
| Documentation setup commencée | Terminé |
| Conception UML commencée | En cours |

## 3. Technologies retenues

| Partie | Technologie |
|---|---|
| Backend | Laravel |
| Frontend | React |
| Base de données | PostgreSQL |
| API | REST API |
| Déploiement local | Docker + Docker Compose |
| Versioning | Git + GitHub |
| Conception | UML |

## 4. Travail réalisé

### 4.1 Installation et environnement

Nous avons installé et configuré les outils nécessaires au développement :

- Docker Desktop
- PHP 8.4
- Composer
- Node.js / npm
- Laravel
- React
- PostgreSQL

### 4.2 Configuration Docker

Nous avons créé une configuration Docker permettant de lancer le projet avec une seule commande :

```bash
docker compose up -d --build

Les services Docker sont :

Service	Container	Port
Backend	gt-backend	8000
Frontend	gt-frontend	5173
PostgreSQL	gt-postgres	5433 sur Windows / 5432 dans Docker
4.3 GitHub

Le projet est versionné avec Git et GitHub.

Le dépôt GitHub est :

https://github.com/abdelghani-dari/gestion-tournois

Une première configuration Docker a été créée, poussée dans une branche, puis fusionnée dans main.

4.4 Documentation

Les premiers documents ont été créés :

README setup
Fiche de cadrage
Cahier des charges mis à jour
Planning
Documentation technique
Document de conception
Diagramme de cas d'utilisation
Diagramme de classes
Schéma de base de données
Architecture technique
5. Problèmes rencontrés
5.1 Configuration de l'environnement

Certains membres peuvent rencontrer des problèmes avec le fichier .env, la génération de la clé Laravel ou la connexion à la base de données.

Solution proposée :

mettre à jour backend/.env.example ;
documenter les commandes dans le README ;
utiliser Docker Compose pour uniformiser l'environnement.
5.2 Choix du stockage des images

Nous avons clarifié la stratégie suivante :

les images uploadées sont stockées dans Laravel storage/app/public ;
la base de données stocke seulement le chemin de l'image ;
les images statiques de l'interface restent dans le frontend.
6. Travail en cours
Finalisation de la conception UML.
Validation du schéma de base de données.
Préparation des migrations Laravel.
Organisation du travail entre les membres.
7. Prochaines étapes
Finaliser les diagrammes UML.
Valider le modèle de base de données.
Créer les migrations Laravel.
Développer les modèles Laravel.
Créer les contrôleurs API.
Développer les pages React.
Tester l'intégration frontend/backend.
8. Conclusion

Le projet est bien lancé. L'environnement technique est fonctionnel, la configuration Docker permet de lancer l'application facilement, et la conception est en cours de finalisation.

La prochaine étape principale est de valider la conception avant de commencer le développement des fonctionnalités.