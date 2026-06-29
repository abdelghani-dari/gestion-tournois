# Rapport d'Avancement 1 — Gestion Tournois Locaux

## 1. Présentation

Ce document présente le premier état d'avancement du projet **Gestion Tournois Locaux**.

Le projet consiste à développer une application web permettant de gérer les tournois locaux de football.

Après recadrage, l'application ne gère plus les championnats, les compétitions officielles ou les paiements simulés. Elle se concentre uniquement sur la gestion complète des tournois locaux.

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
| Recentrage du sujet sur les tournois locaux | Terminé |
| Conception UML mise à jour | En cours |
| Schéma de base de données simplifié | En cours |

## 3. Technologies retenues

| Partie | Technologie |
|---|---|
| Backend | Laravel |
| Frontend | React |
| Base de données | PostgreSQL |
| API | REST API |
| Déploiement local | Docker + Docker Compose |
| Versioning | Git + GitHub |
| Conception | UML / Mermaid |

## 4. Travail réalisé

### 4.1 Installation et environnement

Nous avons installé et configuré les outils nécessaires au développement :

- Docker Desktop ;
- PHP ;
- Composer ;
- Node.js / npm ;
- Laravel ;
- React ;
- PostgreSQL.

### 4.2 Configuration Docker

Nous avons créé une configuration Docker permettant de lancer le projet avec une seule commande :

```bash
docker compose up -d --build
```

Les services Docker sont :

| Service | Container | Port |
|---|---|---|
| Backend | gt-backend | 8000 |
| Frontend | gt-frontend | 5173 |
| PostgreSQL | gt-postgres | 5433 sur Windows / 5432 dans Docker |

### 4.3 GitHub

Le projet est versionné avec Git et GitHub.

Le dépôt GitHub est :

```txt
https://github.com/abdelghani-dari/gestion-tournois
```

### 4.4 Documentation

Les documents suivants ont été préparés ou mis à jour :

- fiche de cadrage ;
- cahier des charges ;
- planning ;
- documentation technique ;
- document de conception ;
- diagramme de cas d'utilisation ;
- diagramme de classes ;
- schéma de base de données ;
- architecture technique ;
- diagrammes de séquence.

### 4.5 Recentrage fonctionnel

L'idée précédente était trop large car elle incluait :

- compétitions officielles ;
- championnats ;
- paiement simulé ;
- feed football ;
- plusieurs rôles complexes.

La nouvelle version est plus simple et plus adaptée au projet tutoré :

- un utilisateur crée un tournoi local ;
- l'administrateur accepte ou refuse le tournoi ;
- les équipes demandent à participer ;
- le créateur du tournoi accepte/refuse les équipes ;
- le créateur gère les matchs et les résultats ;
- le système calcule le classement.

## 5. Problèmes rencontrés

### 5.1 Périmètre trop large

La première conception contenait des fonctionnalités non nécessaires pour la première version.

Solution : limiter le projet aux tournois locaux uniquement.

### 5.2 Complexité des rôles

Les rôles `organizer`, `team_manager` et `viewer` rendaient le projet plus complexe.

Solution : garder seulement deux rôles :

```txt
admin
user
```

Le créateur du tournoi est identifié avec `tournaments.created_by`.

### 5.3 Paiement simulé non nécessaire

Le paiement simulé a été supprimé car l'application ne repose plus sur un abonnement organizer.

## 6. Travail en cours

- Finalisation de la conception UML.
- Validation du schéma de base de données.
- Adaptation des migrations Laravel.
- Adaptation des contrôleurs API.
- Préparation des pages frontend simples.

## 7. Prochaines étapes

- Mettre à jour les migrations.
- Supprimer ou ignorer les tables `championships` et `fake_payments`.
- Adapter les modèles Laravel.
- Adapter les contrôleurs API.
- Ajouter les routes admin d'acceptation/refus.
- Tester la création et validation des tournois.
- Tester les demandes de participation.
- Tester les matchs et classements.
- Préparer un prototype frontend simple.

## 8. Conclusion

Le projet est bien lancé et son périmètre est maintenant plus clair. La nouvelle version est plus simple, plus réaliste et mieux adaptée au délai du projet tutoré.

La prochaine étape principale est l'adaptation technique du backend et la préparation d'un frontend simple pour la démonstration.
