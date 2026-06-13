# Rapport Final — Gestion Tournois Locaux

> Ce document est un modèle de rapport final. Il peut être complété progressivement jusqu'à la soutenance.

## Page de garde

- Nom du projet : Application de Gestion des Tournois Locaux de Football
- Formation : Projet Tutoré
- Équipe : [Noms des membres]
- Encadrant : [Nom de l'encadrant]
- Année universitaire : 2025/2026

## Remerciements

[Ajouter les remerciements à l'encadrant, à l'établissement et aux membres qui ont aidé.]

## Résumé

Ce projet consiste à développer une application web permettant de gérer les tournois locaux de football. L'application permet à un utilisateur de créer un tournoi, à l'administrateur de le valider, aux équipes de demander la participation, puis au créateur du tournoi de gérer les matchs, les résultats, les classements et les statistiques.

## Table des matières

1. Introduction
2. Contexte du projet
3. Problématique
4. Objectifs
5. Analyse des besoins
6. Conception UML
7. Architecture technique
8. Réalisation
9. Tests
10. Difficultés rencontrées
11. Conclusion et perspectives

## 1. Introduction

Dans le cadre du projet tutoré, notre équipe a développé une application web de gestion des tournois locaux de football.

## 2. Contexte du projet

Les tournois locaux sont souvent gérés manuellement avec WhatsApp, Excel ou papier. Cette méthode devient difficile lorsque le nombre d'équipes et de matchs augmente.

## 3. Problématique

Comment proposer une solution simple et centralisée pour créer, valider, organiser et suivre les tournois locaux de football ?

## 4. Objectifs

- Créer un tournoi local.
- Valider le tournoi par l'admin.
- Gérer les équipes.
- Gérer les joueurs.
- Gérer les demandes de participation.
- Planifier les matchs.
- Saisir les résultats.
- Générer le classement.
- Consulter les statistiques.

## 5. Analyse des besoins

### 5.1 Besoins fonctionnels

- Authentification.
- Gestion des tournois.
- Validation admin.
- Gestion des équipes.
- Gestion des joueurs.
- Demandes de participation.
- Matchs et résultats.
- Classements et statistiques.

### 5.2 Besoins non fonctionnels

- Interface simple.
- Sécurité des données.
- Performance acceptable.
- Code maintenable.
- Déploiement local avec Docker.

## 6. Conception UML

Insérer ici :

- diagramme de cas d'utilisation ;
- diagramme de classes ;
- diagrammes de séquence ;
- schéma de base de données.

## 7. Architecture technique

L'application suit une architecture frontend/backend :

```txt
React Frontend -> Laravel API -> PostgreSQL
```

## 8. Réalisation

### 8.1 Backend

- Laravel.
- API REST.
- Migrations.
- Modèles.
- Contrôleurs.
- Validation des données.

### 8.2 Frontend

- React.
- Pages principales.
- Formulaires.
- Appels API.
- Tableaux d'affichage.

### 8.3 Base de données

- PostgreSQL.
- Tables principales : users, tournaments, teams, players, match_games, rankings, statistics.

## 9. Tests

Tests réalisés :

- lancement Docker ;
- migration base de données ;
- création utilisateur ;
- création tournoi ;
- validation admin ;
- création équipe ;
- ajout joueurs ;
- demande participation ;
- création match ;
- saisie résultat ;
- calcul classement.

## 10. Difficultés rencontrées

- Choix du périmètre initial trop large.
- Simplification du modèle de données.
- Organisation du travail en équipe.
- Intégration frontend/backend.

## 11. Conclusion

Le projet a permis de créer une application web simple et utile pour gérer les tournois locaux de football. La solution centralise les informations, facilite le suivi des équipes et automatise le calcul des classements.

## 12. Perspectives

- Ajouter notifications.
- Ajouter arbitres.
- Ajouter export PDF du classement.
- Ajouter application mobile.
- Ajouter commentaires ou annonces simples.
