# Pages Frontend — Gestion Tournois Locaux

## 1. Objectif

Ce document liste les pages frontend minimales pour tester le backend et présenter un prototype simple.

Le frontend ne doit pas être un vrai réseau social. Il doit seulement permettre de tester les fonctionnalités principales.

## 2. Pages publiques

### 2.1 Accueil

Contenu :

- présentation courte de l'application ;
- bouton login/register ;
- liste des tournois acceptés ;
- accès au détail d'un tournoi.

### 2.2 Liste des tournois

Contenu :

- nom du tournoi ;
- ville ;
- date début / fin ;
- statut ;
- bouton voir détail.

Règle : afficher seulement les tournois avec :

```txt
approval_status = accepted
```

### 2.3 Détail tournoi

Contenu :

- informations du tournoi ;
- équipes participantes ;
- matchs ;
- résultats ;
- classement ;
- bouton demander participation.

## 3. Pages Auth

### 3.1 Register

Champs :

- name ;
- email ;
- password ;
- password confirmation.

### 3.2 Login

Champs :

- email ;
- password.

## 4. Pages User

### 4.1 Dashboard User

Contenu :

- mes tournois ;
- mes équipes ;
- mes demandes ;
- raccourcis de création.

### 4.2 Créer tournoi

Champs :

- name ;
- description ;
- city ;
- location ;
- start_date ;
- end_date ;
- banner optionnelle.

Après création :

```txt
approval_status = pending
status = draft
```

### 4.3 Mes tournois

Afficher :

- nom ;
- statut de validation ;
- statut sportif ;
- note admin si refusé ;
- bouton gérer si accepté.

### 4.4 Créer équipe

Champs :

- name ;
- city ;
- logo optionnel.

### 4.5 Mes équipes

Afficher :

- équipes créées ;
- bouton gérer joueurs ;
- bouton demander participation.

### 4.6 Gérer joueurs

Actions :

- ajouter joueur ;
- modifier joueur ;
- supprimer joueur.

Champs joueur :

- first_name ;
- last_name ;
- position ;
- number ;
- photo optionnelle.

### 4.7 Mes demandes

Afficher :

- tournoi ;
- équipe ;
- statut : pending / accepted / refused.

## 5. Pages Créateur du tournoi

### 5.1 Gérer tournoi

Contenu :

- informations du tournoi ;
- demandes reçues ;
- équipes acceptées ;
- matchs ;
- classement.

### 5.2 Demandes de participation

Actions :

- accepter une demande ;
- refuser une demande.

### 5.3 Matchs

Actions :

- créer un match ;
- modifier un match ;
- saisir résultat.

Champs match :

- home_team_id ;
- away_team_id ;
- match_date.

### 5.4 Résultats

Actions :

- saisir home_score ;
- saisir away_score ;
- confirmer résultat ;
- recalculer classement.

### 5.5 Classement

Afficher :

- équipe ;
- matchs joués ;
- victoires ;
- nuls ;
- défaites ;
- buts pour ;
- buts contre ;
- différence ;
- points.

## 6. Pages Admin

### 6.1 Dashboard Admin

Contenu :

- nombre de tournois en attente ;
- nombre de tournois acceptés ;
- nombre de tournois refusés ;
- accès aux validations.

### 6.2 Tournois en attente

Actions :

- voir détail ;
- accepter ;
- refuser avec note.

### 6.3 Tous les tournois

Afficher :

- nom ;
- créateur ;
- ville ;
- statut de validation ;
- statut sportif.

## 7. Pages minimales pour la démo

Pour une démo rapide, développer seulement :

```txt
Login / Register
Dashboard User
Create Tournament
Admin Pending Tournaments
Tournament Details
Create Team
Players
Join Requests
Matches
Ranking
```
