# Planning du Projet — Gestion Tournois

## 1. Objectif

Ce document présente le planning prévisionnel du projet Gestion Tournois.

Le projet est organisé en plusieurs phases : préparation, conception, développement, tests, documentation et présentation finale.

La nouvelle version du projet est une plateforme football qui combine :

- la gestion des compétitions officielles ;
- la gestion des compétitions locales ;
- les rôles admin, organizer, team_manager et viewer ;
- le paiement simulé pour organizer ;
- les demandes de participation ;
- la validation des résultats locaux ;
- un feed football simple.

## 2. Phases du projet

| Phase | Travail à réaliser | Résultat attendu |
|---|---|---|
| Phase 1 | Setup + GitHub + Docker | Environnement fonctionnel |
| Phase 2 | Conception UML mise à jour | Diagrammes et schéma validés |
| Phase 3 | Base de données | Migrations Laravel mises à jour |
| Phase 4 | Auth + rôles | Gestion admin, organizer, team_manager, viewer |
| Phase 5 | Backend API | API REST fonctionnelle |
| Phase 6 | Frontend React | Pages principales |
| Phase 7 | Tests | Correction des erreurs |
| Phase 8 | Documentation | Livrables complets |
| Phase 9 | Présentation finale | Prototype prêt |

## 3. Planning détaillé

| Étape | Tâches | Responsable | Statut |
|---|---|---|---|
| 1 | Installation Docker, Laravel, React, PostgreSQL | Équipe | Terminé |
| 2 | Configuration Docker Compose | Équipe | Terminé |
| 3 | README et documentation setup | Équipe | En cours |
| 4 | Mise à jour de la fiche de cadrage | Documentation | Terminé |
| 5 | Mise à jour du cahier des charges | Documentation | Terminé |
| 6 | Mise à jour du diagramme de cas d'utilisation | Conception | Terminé |
| 7 | Mise à jour du diagramme de classes | Conception | Terminé |
| 8 | Mise à jour du schéma de base de données | Backend / Conception | Terminé |
| 9 | Migration users : rôles, paiement simulé | Backend | À faire |
| 10 | Migration championships : created_by, level, source, city, country | Backend | À faire |
| 11 | Migration tournaments : created_by, level, source, city, country | Backend | À faire |
| 12 | Migration teams : manager_id, country | Backend | À faire |
| 13 | Migration match_games : created_by, result_status | Backend | À faire |
| 14 | Création table fake_payments | Backend | À faire |
| 15 | Création table join_requests | Backend | À faire |
| 16 | Création table posts | Backend | À faire |
| 17 | API auth + rôles | Backend | À faire |
| 18 | API paiement simulé | Backend | À faire |
| 19 | API saisons/championnats/tournois | Backend | En cours |
| 20 | API équipes/joueurs | Backend | À faire |
| 21 | API demandes de participation | Backend | À faire |
| 22 | API matchs/résultats | Backend | À faire |
| 23 | API classements/statistiques | Backend | À faire |
| 24 | API posts/feed | Backend | À faire |
| 25 | Pages publiques : Home, compétitions, résultats | Frontend | À faire |
| 26 | Pages auth : login, register, choose role, fake payment | Frontend | À faire |
| 27 | Dashboard admin | Frontend | À faire |
| 28 | Dashboard organizer | Frontend | À faire |
| 29 | Dashboard team manager | Frontend | À faire |
| 30 | Intégration frontend/backend | Frontend / Backend | À faire |
| 31 | Tests et corrections | Équipe | À faire |
| 32 | Rapport final | Documentation | À faire |
| 33 | Préparation soutenance | Équipe | À faire |

## 4. Répartition proposée

| Rôle équipe | Missions |
|---|---|
| Chef de projet | Organisation, suivi, coordination GitHub |
| Responsable conception | UML, schéma de base de données |
| Backend developer 1 | Auth, rôles, users, fake_payments |
| Backend developer 2 | Championnats, tournois, équipes, joueurs |
| Backend developer 3 | Matchs, résultats, classements, statistiques |
| Frontend developer 1 | Pages publiques, feed, résultats |
| Frontend developer 2 | Dashboards admin, organizer, team_manager |
| Responsable documentation | Livrables, rapports, README |
| Responsable tests | Vérification, bugs, validation du prototype |

## 5. Livrables attendus

- Fiche de cadrage
- Cahier des charges
- Planning
- Rapports d'avancement
- Documentation technique
- Prototype
- Rapport final

## 6. Suivi d'avancement

### Rapport d'avancement 1

- Équipe constituée
- Sujet choisi
- GitHub créé
- Docker configuré
- Technologies choisies
- Début de conception

### Rapport d'avancement 2

- Nouvelle orientation validée
- Rôles validés
- UML mis à jour
- Schéma de base de données terminé
- Migrations commencées
- Backend commencé
- Frontend commencé

### Rapport d'avancement 3

- API terminées
- Frontend intégré
- Paiement simulé fonctionnel
- Demandes de participation fonctionnelles
- Classements/statistiques fonctionnels
- Feed simple fonctionnel
- Tests commencés
- Documentation mise à jour
