# Cahier des Charges — Gestion Tournois

## 1. Présentation du projet

### 1.1 Intitulé

Application de Gestion Sportive — Gestion Tournois

### 1.2 Contexte

Dans le cadre du projet tutoré, notre équipe développe une application web permettant de gérer des compétitions sportives.

L'application vise à faciliter la gestion des saisons, championnats, tournois, équipes, joueurs, matchs, compositions, classements et statistiques.

## 2. Problématique

La gestion manuelle des compétitions sportives devient difficile lorsque le nombre d'équipes, de joueurs et de matchs augmente.

Les responsables sportifs ont besoin d'une solution centralisée, simple et efficace pour organiser les compétitions, enregistrer les résultats et suivre les performances.

## 3. Objectifs

L'application doit permettre de :

- gérer les saisons sportives ;
- gérer les championnats ;
- gérer les tournois ;
- gérer les équipes ;
- gérer les joueurs ;
- planifier les matchs ;
- enregistrer les résultats ;
- gérer les compositions d'équipes ;
- générer automatiquement les classements ;
- consulter les statistiques sportives.

## 4. Utilisateurs de l'application

### 4.1 Admin / Responsable sportif

L'admin peut gérer toutes les données de l'application :

- saisons ;
- championnats ;
- tournois ;
- équipes ;
- joueurs ;
- matchs ;
- résultats ;
- compositions ;
- classements ;
- statistiques.

### 4.2 Utilisateur simple / Viewer

L'utilisateur simple peut consulter :

- les équipes ;
- les joueurs ;
- les matchs ;
- les résultats ;
- les classements ;
- les statistiques.

## 5. Fonctionnalités principales

### 5.1 Gestion des saisons

- Ajouter une saison.
- Modifier une saison.
- Supprimer une saison.
- Consulter la liste des saisons.

### 5.2 Gestion des championnats

- Créer un championnat.
- Associer un championnat à une saison.
- Ajouter des équipes au championnat.
- Modifier ou supprimer un championnat.

### 5.3 Gestion des tournois

- Créer un tournoi.
- Associer un tournoi à une saison.
- Ajouter des équipes au tournoi.
- Modifier ou supprimer un tournoi.

### 5.4 Gestion des équipes

- Ajouter une équipe.
- Modifier une équipe.
- Supprimer une équipe.
- Ajouter un logo d'équipe.
- Associer une équipe à un championnat ou tournoi.

### 5.5 Gestion des joueurs

- Ajouter un joueur.
- Modifier un joueur.
- Supprimer un joueur.
- Associer un joueur à une équipe.
- Ajouter une photo de joueur.

### 5.6 Gestion des matchs

- Planifier un match.
- Définir l'équipe domicile et l'équipe extérieure.
- Définir la date et l'heure du match.
- Saisir le score.
- Modifier le statut du match.

### 5.7 Gestion des compositions

- Sélectionner les joueurs participants à un match.
- Définir les titulaires.
- Définir les remplaçants.

### 5.8 Gestion des classements

- Calcul automatique des points.
- Calcul des victoires, matchs nuls et défaites.
- Calcul des buts marqués et encaissés.
- Calcul de la différence de buts.
- Tri automatique du classement.

Règles proposées :

```txt
Victoire = 3 points
Match nul = 1 point
Défaite = 0 point
```

### 5.9 Gestion des statistiques

- Suivre les statistiques des équipes.
- Suivre les statistiques des joueurs.
- Consulter les performances sportives.

## 6. Besoins non fonctionnels

- Interface simple et ergonomique.
- Application rapide.
- Données sécurisées.
- Code maintenable.
- Architecture claire.
- Collaboration via GitHub.
- Environnement de développement simple avec Docker.
- Documentation complète.

## 7. Technologies utilisées

| Partie | Technologie |
|---|---|
| Backend | Laravel |
| Frontend | React |
| Base de données | PostgreSQL |
| API | REST API |
| Déploiement local | Docker + Docker Compose |
| Versioning | Git + GitHub |
| Conception | UML |
| IDE | VS Code |

## 8. Architecture technique

L'application suit une architecture web moderne :

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

Les services sont lancés avec Docker Compose :

```bash
docker compose up -d --build
```

## 9. Gestion des images

Les images uploadées par les utilisateurs sont stockées dans Laravel :

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

Les images statiques de l'interface sont stockées dans :

```txt
frontend/src/assets
```

ou :

```txt
frontend/public
```

## 10. Contraintes

- Respect du délai du projet tutoré.
- Travail en équipe.
- Utilisation de GitHub.
- Utilisation de Docker pour simplifier l'installation.
- Ne pas pousser les fichiers `.env`.
- Ne pas pousser `node_modules` ni `vendor`.
- Garder une structure claire entre frontend et backend.

## 11. Résultat attendu

À la fin du projet, l'application devra permettre la gestion complète d'une compétition sportive, depuis l'inscription des équipes jusqu'à la génération des classements et statistiques.

## 12. Livrables

- Fiche de cadrage
- Cahier des charges
- Planning
- Rapports d'avancement
- Documentation technique
- Prototype
- Rapport final