# Conception — Gestion Tournois

## 1. Objectif de la conception

Cette conception définit la structure fonctionnelle et technique de l'application de gestion sportive.

L'application doit permettre de gérer :

- les saisons sportives
- les championnats
- les tournois
- les équipes
- les joueurs
- les matchs
- les compositions d'équipes
- les classements
- les statistiques

## 2. Acteurs

### Admin / Responsable sportif

L'admin est l'utilisateur principal de l'application. Il peut gérer les données sportives, créer les compétitions, ajouter les équipes, planifier les matchs, saisir les résultats et consulter les statistiques.

### Utilisateur simple / Viewer

L'utilisateur simple peut consulter les informations publiques comme les équipes, les matchs, les classements et les statistiques.

## 3. Cas d'utilisation principaux

- S'authentifier
- Gérer les saisons
- Gérer les championnats
- Gérer les tournois
- Gérer les équipes
- Gérer les joueurs
- Planifier les matchs
- Saisir les résultats des matchs
- Gérer les compositions d'équipes
- Générer les classements
- Consulter les statistiques

## 4. Entités principales

- User
- Season
- Championship
- Tournament
- Team
- Player
- MatchGame
- Composition
- Ranking
- Statistic

## 5. Remarque importante

Le modèle représentant un match ne doit pas s'appeler `Match`, car `match` est un mot réservé en PHP.

Nom recommandé :

```txt
MatchGame

6. Architecture générale
React Frontend
      |
      | REST API
      v
Laravel Backend
      |
      v
PostgreSQL Database

Docker Compose lance les services frontend, backend et base de données.