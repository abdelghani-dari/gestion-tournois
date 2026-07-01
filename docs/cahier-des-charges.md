# Cahier des Charges — Gestion Tournois Locaux

## 1. Présentation du projet

### 1.1 Intitulé

**Application de Gestion des Tournois Locaux de Football**

### 1.2 Contexte

L'application vise à faciliter la gestion des tournois locaux de football. Elle permet à un utilisateur de proposer un tournoi, puis à l'administrateur de le valider avant sa publication.

Après validation, les équipes peuvent demander à participer. Le créateur du tournoi gère les demandes, les matchs, les scores, le classement et les statistiques.

## 2. Problématique

Les tournois locaux sont souvent organisés avec des outils non centralisés : messages, feuilles Excel, papier ou publications dispersées. Cela rend difficile le suivi des inscriptions, des matchs, des scores et du classement.

L'application répond à ce problème en proposant un espace unique pour gérer les tournois locaux.

## 3. Objectifs fonctionnels

L'application doit permettre de :

- créer un compte utilisateur ;
- se connecter ;
- créer un tournoi local ;
- soumettre le tournoi à l'administrateur ;
- accepter ou refuser un tournoi par l'administrateur ;
- afficher les tournois acceptés ;
- créer une équipe ;
- ajouter des joueurs à une équipe ;
- envoyer une demande de participation à un tournoi ;
- accepter ou refuser une demande de participation ;
- ajouter les équipes acceptées au tournoi ;
- planifier les matchs ;
- saisir les scores ;
- gérer l'état des résultats ;
- générer le classement automatiquement ;
- consulter les statistiques simples.

## 4. Utilisateurs de l'application

### 4.1 Admin

L'administrateur peut :

- consulter les tournois en attente ;
- accepter un tournoi ;
- refuser un tournoi avec une remarque ;
- consulter tous les tournois ;
- gérer les utilisateurs si nécessaire ;
- superviser les données de l'application.

### 4.2 User

L'utilisateur peut :

- créer un compte ;
- se connecter ;
- créer un tournoi local ;
- consulter l'état de validation de ses tournois ;
- créer une équipe ;
- ajouter des joueurs ;
- demander la participation à un tournoi accepté ;
- consulter les matchs, résultats et classements.

### 4.3 Créateur du tournoi

Le créateur du tournoi peut gérer uniquement ses propres tournois. Il peut :

- modifier les informations de son tournoi ;
- consulter les demandes de participation reçues ;
- accepter ou refuser les équipes ;
- planifier les matchs ;
- saisir les résultats ;
- lancer le recalcul du classement.

## 5. Fonctionnalités principales

### 5.1 Authentification

- Inscription.
- Connexion.
- Déconnexion.
- Protection des routes privées.

### 5.2 Gestion des utilisateurs

- Rôle `admin`.
- Rôle `user`.
- Un utilisateur peut devenir responsable d'un tournoi uniquement s'il en est le créateur.

### 5.3 Gestion des tournois

- Créer un tournoi.
- Modifier un tournoi créé par soi-même.
- Supprimer un tournoi si aucun match n'est encore joué.
- Consulter les tournois acceptés.
- Consulter les détails d'un tournoi.

Champs principaux :

- nom ;
- description ;
- ville ;
- lieu ;
- date de début ;
- date de fin ;
- statut du tournoi ;
- statut de validation admin.

### 5.4 Validation des tournois

Lorsqu'un utilisateur crée un tournoi, le tournoi prend l'état :

```txt
approval_status = pending
status = draft
```

L'administrateur peut ensuite :

```txt
accept -> approval_status = accepted, status = open
refuse -> approval_status = refused
```

Un tournoi refusé n'est pas affiché dans la liste publique.

### 5.5 Gestion des équipes

- Créer une équipe.
- Modifier son équipe.
- Ajouter un logo.
- Définir la ville de l'équipe.
- Associer l'équipe à son responsable.

### 5.6 Gestion des joueurs

- Ajouter un joueur.
- Modifier un joueur.
- Supprimer un joueur.
- Associer chaque joueur à une équipe.
- Définir le poste et le numéro du joueur.

### 5.7 Demandes de participation

- Une équipe envoie une demande pour rejoindre un tournoi accepté.
- Le créateur du tournoi reçoit les demandes.
- Le créateur accepte ou refuse chaque demande.
- Une demande acceptée ajoute l'équipe à la table `tournament_team`.

États possibles :

```txt
pending
accepted
refused
```

### 5.8 Gestion des matchs

- Créer un match dans un tournoi.
- Choisir l'équipe domicile.
- Choisir l'équipe extérieure.
- Définir la date et l'heure.
- Modifier le statut du match.

États possibles :

```txt
scheduled
played
cancelled
```

### 5.9 Gestion des résultats

- Saisir le score.
- Passer le match à `played`.
- Gérer le statut du résultat.

États proposés :

```txt
pending
confirmed
disputed
```

Pour le prototype, le créateur du tournoi peut valider le résultat. Les résultats confirmés sont utilisés pour calculer le classement.

### 5.10 Gestion des compositions

Fonction optionnelle mais utile pour la documentation :

- sélectionner les joueurs participants à un match ;
- définir les titulaires ;
- définir les remplaçants.

### 5.11 Gestion des classements

Le classement est calculé automatiquement avec les règles suivantes :

```txt
Victoire = 3 points
Match nul = 1 point
Défaite = 0 point
```

Le tri du classement se fait par :

1. points ;
2. différence de buts ;
3. buts marqués ;
4. nom de l'équipe.

### 5.12 Gestion des statistiques

Statistiques simples :

- buts ;
- passes décisives ;
- cartons jaunes ;
- cartons rouges ;
- clean sheet.

## 6. Besoins non fonctionnels

- Interface simple et ergonomique.
- Application rapide en local.
- Données sécurisées.
- Mots de passe hashés.
- Validation des données côté backend.
- Architecture claire frontend/backend.
- Code maintenable.
- Collaboration GitHub.
- Déploiement local avec Docker.
- Documentation claire.

## 7. Technologies utilisées

| Partie | Technologie |
|---|---|
| Backend | Laravel |
| Frontend | React |
| Base de données | PostgreSQL |
| API | REST API |
| Déploiement local | Docker + Docker Compose |
| Versioning | Git + GitHub |
| IDE | VS Code |
| Conception | UML / Mermaid |

## 8. Architecture technique

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

## 9. Gestion des images

Les images uploadées sont stockées dans Laravel :

```txt
backend/storage/app/public
```

La base de données stocke uniquement le chemin de l'image.

Exemples :

```txt
teams/logo.png
players/photo.jpg
tournaments/banner.jpg
```

## 10. Contraintes

- Pas de championnats.
- Pas de compétitions officielles.
- Pas de paiement réel.
- Pas de paiement simulé.
- Pas de réseau social complet.
- Ne pas pousser `.env`.
- Ne pas pousser `vendor` ni `node_modules`.

## 11. Résultat attendu

Le prototype doit permettre à un utilisateur de créer un tournoi local, attendre la validation de l'admin, gérer les équipes participantes, créer les matchs, saisir les scores et afficher automatiquement le classement.

## 12. Livrables

- Fiche de cadrage.
- Cahier des charges.
- Planning.
- Rapports d'avancement.
- Documentation technique.
- Prototype.
- Rapport final.
