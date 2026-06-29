# Planning du Projet — Gestion Tournois Locaux

## 1. Objectif

Ce document présente le planning prévisionnel du projet **Gestion Tournois Locaux**.

Le projet est organisé en plusieurs phases : préparation, conception, développement, tests, documentation et présentation finale.

## 2. Phases du projet

| Phase | Travail à réaliser | Résultat attendu |
|---|---|---|
| Phase 1 | Setup + GitHub + Docker | Environnement fonctionnel |
| Phase 2 | Recentrage du sujet | Application limitée aux tournois locaux |
| Phase 3 | Conception UML | Diagrammes validés |
| Phase 4 | Base de données | Migrations Laravel simplifiées |
| Phase 5 | Backend API | API REST fonctionnelle |
| Phase 6 | Frontend React | Pages principales du prototype |
| Phase 7 | Tests | Correction des erreurs |
| Phase 8 | Documentation | Livrables complets |
| Phase 9 | Présentation finale | Prototype prêt |

## 3. Planning détaillé

| Étape | Tâches | Responsable | Statut |
|---|---|---|---|
| 1 | Installation Docker, Laravel, React, PostgreSQL | Équipe | Terminé |
| 2 | Configuration Docker Compose | Équipe | Terminé |
| 3 | Recentrer le projet sur les tournois locaux | Équipe | Terminé |
| 4 | Supprimer la logique championnats / official / fake payment de la conception | Conception | À faire |
| 5 | Mettre à jour fiche de cadrage | Documentation | Terminé |
| 6 | Mettre à jour cahier des charges | Documentation | Terminé |
| 7 | Mettre à jour diagramme de cas d'utilisation | Conception | Terminé |
| 8 | Mettre à jour diagramme de classes | Conception | Terminé |
| 9 | Mettre à jour schéma de base de données | Backend / Conception | Terminé |
| 10 | Modifier migrations users | Backend | À faire |
| 11 | Modifier migrations tournaments | Backend | À faire |
| 12 | Supprimer ou ignorer championships | Backend | À faire |
| 13 | Supprimer ou ignorer fake_payments | Backend | À faire |
| 14 | Modifier match_games pour dépendre uniquement de tournament_id | Backend | À faire |
| 15 | Modifier rankings pour dépendre uniquement de tournament_id | Backend | À faire |
| 16 | Modifier join_requests pour dépendre uniquement de tournament_id | Backend | À faire |
| 17 | API auth simple | Backend | À faire |
| 18 | API admin validation des tournois | Backend | À faire |
| 19 | API tournois | Backend | À faire |
| 20 | API équipes / joueurs | Backend | À faire |
| 21 | API demandes de participation | Backend | À faire |
| 22 | API matchs / résultats | Backend | À faire |
| 23 | API classements / statistiques | Backend | À faire |
| 24 | Pages login/register | Frontend | À faire |
| 25 | Dashboard utilisateur | Frontend | À faire |
| 26 | Dashboard admin validation tournois | Frontend | À faire |
| 27 | Pages tournois | Frontend | À faire |
| 28 | Pages équipes / joueurs | Frontend | À faire |
| 29 | Pages matchs / résultats / classement | Frontend | À faire |
| 30 | Intégration frontend/backend | Frontend / Backend | Terminé |
| 31 | Tests et corrections | Équipe | Terminé |
| 32 | Rapport final | Documentation | En cours |
| 33 | Préparation soutenance | Équipe | En cours |

## 4. Répartition proposée

| Rôle équipe | Missions |
|---|---|
| Chef de projet | Organisation, suivi, coordination GitHub |
| Responsable conception | UML, schéma de base de données |
| Backend developer 1 | Auth, users, admin approval |
| Backend developer 2 | Tournaments, teams, players |
| Backend developer 3 | Join requests, matches, results, rankings |
| Frontend developer 1 | Login, register, dashboard, tournaments |
| Frontend developer 2 | Teams, players, matches, rankings |
| Responsable documentation | Livrables, rapport final, README |
| Responsable tests | Vérification API, bugs, validation du prototype |

## 5. Livrables attendus

- Fiche de cadrage.
- Cahier des charges.
- Planning.
- Rapports d'avancement.
- Documentation technique.
- Prototype.
- Rapport final.

## 6. Jalons de suivi

### Rapport d'avancement 1

- Équipe constituée.
- Sujet choisi.
- GitHub créé.
- Docker configuré.
- Technologies choisies.
- Début de conception.

### Rapport d'avancement 2

- Sujet recentré sur les tournois locaux.
- Championnats et paiement simulé supprimés du périmètre.
- UML mis à jour.
- Schéma de base de données simplifié.
- Backend commencé.
- Frontend commencé.

### Rapport d'avancement 3

- API principales terminées.
- Validation admin fonctionnelle.
- Demandes de participation fonctionnelles.
- Matchs, résultats et classements fonctionnels.
- Frontend intégré.
- Tests commencés.
- Documentation mise à jour.
