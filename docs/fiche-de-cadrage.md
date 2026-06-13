# Fiche de Cadrage — Gestion Tournois Locaux

## 1. Intitulé du projet

**Application de Gestion des Tournois Locaux de Football**

## 2. Contexte du projet

Dans le cadre du projet tutoré, notre équipe développe une application web destinée à faciliter l'organisation des tournois locaux de football.

Les tournois locaux, comme les tournois de quartier, les tournois scolaires, les tournois Ramadan ou les compétitions associatives, sont souvent gérés avec WhatsApp, Excel ou papier. Cette méthode devient rapidement difficile lorsque le nombre d'équipes, de joueurs et de matchs augmente.

L'application proposée permet de centraliser la création des tournois, la validation administrative, la gestion des équipes, la planification des matchs, la saisie des résultats, le calcul des classements et le suivi des statistiques.

## 3. Problématique

La gestion manuelle des tournois locaux présente plusieurs problèmes :

- difficulté à suivre les équipes inscrites ;
- manque de validation avant la publication d'un tournoi ;
- organisation compliquée des matchs ;
- erreurs possibles dans les scores et classements ;
- absence d'un espace centralisé pour consulter les résultats ;
- perte d'informations lorsque tout est géré par messages ou fichiers séparés.

Les organisateurs et les responsables d'équipes ont donc besoin d'un outil simple pour gérer un tournoi local depuis sa création jusqu'à la publication des résultats.

## 4. Objectifs du projet

L'application doit permettre de :

- gérer les comptes utilisateurs ;
- permettre à un utilisateur de créer un tournoi local ;
- permettre à l'administrateur d'accepter ou refuser un tournoi ;
- afficher uniquement les tournois acceptés ;
- permettre aux utilisateurs de créer leurs équipes ;
- permettre aux équipes d'envoyer une demande de participation ;
- permettre au créateur du tournoi d'accepter ou refuser les équipes ;
- gérer les joueurs d'une équipe ;
- planifier les matchs du tournoi ;
- saisir les résultats ;
- confirmer ou contester un résultat si nécessaire ;
- générer automatiquement le classement ;
- consulter les statistiques simples du tournoi.

## 5. Périmètre du projet

### 5.1 Inclus dans le projet

- Interface web frontend.
- API backend.
- Base de données PostgreSQL.
- Authentification simple.
- Gestion des rôles `admin` et `user`.
- Création des tournois locaux.
- Validation des tournois par l'admin.
- Gestion des équipes.
- Gestion des joueurs.
- Demandes de participation.
- Planification des matchs.
- Saisie des résultats.
- Classement automatique.
- Statistiques simples.
- Déploiement local avec Docker Compose.
- Documentation technique et UML.

### 5.2 Non inclus dans la première version

- Championnats.
- Compétitions officielles ou internationales.
- Paiement réel.
- Paiement simulé.
- Application mobile.
- Notifications temps réel.
- Chat privé.
- Likes, commentaires et followers.
- Billetterie.
- Gestion avancée des arbitres.
- API football externe.

## 6. Utilisateurs cibles

### Administrateur

L'administrateur valide ou refuse les tournois créés par les utilisateurs. Il supervise aussi les données principales de l'application.

### Utilisateur

L'utilisateur peut créer un tournoi local, créer une équipe, gérer les joueurs de son équipe et demander la participation à un tournoi.

### Créateur du tournoi

Le créateur du tournoi est un utilisateur normal, mais il devient responsable uniquement des tournois qu'il a créés. Il peut gérer les équipes participantes, les matchs et les résultats de ses propres tournois.

## 7. Technologies utilisées

| Partie | Technologie |
|---|---|
| Backend | Laravel |
| Frontend | React |
| Base de données | PostgreSQL |
| API | REST API |
| Déploiement local | Docker + Docker Compose |
| Versioning | Git + GitHub |
| Conception | UML / Mermaid |

## 8. Résultat attendu

À la fin du projet, l'application devra permettre de gérer un tournoi local de football de manière complète : création, validation par l'admin, inscription des équipes, gestion des matchs, saisie des résultats, calcul du classement et consultation des statistiques.

## 9. Contraintes

- Respect du délai du projet tutoré.
- Travail en équipe.
- Utilisation de GitHub.
- Interface simple et claire.
- Code maintenable.
- Documentation complète.
- Fonctionnalités limitées au périmètre local.

## 10. Livrables

- Fiche de cadrage.
- Cahier des charges.
- Planning.
- Rapports d'avancement.
- Documentation technique.
- Prototype.
- Rapport final.
