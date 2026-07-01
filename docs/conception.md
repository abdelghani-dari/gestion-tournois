# Conception — Gestion Tournois Locaux

## 1. Objectif de la conception

Ce document définit la structure fonctionnelle et technique de l'application **Gestion Tournois Locaux**.

L'application permet de gérer uniquement des tournois locaux de football. Elle ne gère pas les championnats, les compétitions officielles ou les paiements.

## 2. Acteurs

### 2.1 Admin

L'administrateur supervise la plateforme. Son rôle principal est de valider les tournois créés par les utilisateurs avant leur publication.

Il peut :

- consulter les tournois en attente ;
- accepter un tournoi ;
- refuser un tournoi ;
- ajouter une remarque de refus ;
- consulter tous les tournois ;
- superviser les utilisateurs.

### 2.2 User

L'utilisateur est le rôle principal de l'application.

Il peut :

- créer un compte ;
- se connecter ;
- créer un tournoi local ;
- créer une équipe ;
- ajouter des joueurs ;
- demander la participation à un tournoi ;
- consulter les matchs, les résultats, les classements et les statistiques.

### 2.3 Créateur du tournoi

Le créateur du tournoi est un utilisateur normal qui possède des permissions supplémentaires uniquement sur les tournois qu'il a créés.

Il peut, pour ses propres tournois :

- modifier les informations du tournoi ;
- consulter les demandes de participation ;
- accepter ou refuser une équipe ;
- planifier les matchs ;
- saisir les résultats ;
- recalculer le classement.

## 3. Cas d'utilisation principaux

### Cas communs

- S'inscrire.
- Se connecter.
- Consulter les tournois acceptés.
- Consulter les matchs.
- Consulter les résultats.
- Consulter les classements.
- Consulter les statistiques.

### Admin

- Consulter les tournois en attente.
- Accepter un tournoi.
- Refuser un tournoi.
- Ajouter une note d'administration.
- Superviser la plateforme.

### User

- Créer un tournoi local.
- Consulter le statut de validation de son tournoi.
- Créer une équipe.
- Ajouter des joueurs.
- Envoyer une demande de participation.
- Consulter ses demandes.

### Créateur du tournoi

- Gérer son tournoi.
- Gérer les demandes reçues.
- Ajouter les équipes acceptées.
- Planifier les matchs.
- Saisir les résultats.
- Gérer les classements.

## 4. Entités principales

- User
- Tournament
- Team
- Player
- MatchGame
- Composition
- Ranking
- Statistic
- JoinRequest
- TournamentTeam

## 5. Règles métier importantes

### 5.1 Règles des rôles

```txt
Admin : valide/refuse les tournois et supervise l'application.
User  : crée des tournois, équipes, joueurs et consulte les résultats.
```

### 5.2 Règle du créateur de tournoi

Un utilisateur devient responsable uniquement des tournois qu'il a créés.

```txt
tournaments.created_by = users.id
```

Il ne peut pas modifier les tournois créés par d'autres utilisateurs.

### 5.3 Règle de validation admin

Un tournoi créé par un utilisateur n'est pas visible directement dans la liste publique.

Processus :

```txt
1. User crée un tournoi.
2. approval_status = pending.
3. Admin accepte ou refuse.
4. Si accepté : approval_status = accepted et status = open.
5. Si refusé : approval_status = refused.
```

### 5.4 Règle de participation

Une équipe peut participer à un tournoi uniquement si :

- le tournoi est accepté par l'admin ;
- l'équipe envoie une demande ;
- le créateur du tournoi accepte la demande.

### 5.5 Règle des résultats

Un résultat peut avoir trois états :

```txt
pending
confirmed
disputed
```

Seuls les matchs avec `result_status = confirmed` sont utilisés pour calculer le classement.

### 5.6 Règle de classement

```txt
Victoire = 3 points
Match nul = 1 point
Défaite = 0 point
```

Le classement est trié par :

1. points ;
2. différence de buts ;
3. buts marqués ;
4. nom de l'équipe.

## 6. Parcours principal

```txt
User crée un tournoi
        ↓
Admin accepte le tournoi
        ↓
Le tournoi devient public
        ↓
User crée une équipe
        ↓
Équipe demande à participer
        ↓
Créateur du tournoi accepte l'équipe
        ↓
Créateur planifie les matchs
        ↓
Créateur saisit les résultats
        ↓
Système calcule le classement
```

## 7. Remarque technique

Le modèle représentant un match ne doit pas s'appeler `Match`, car `match` est un mot réservé en PHP. Le nom recommandé reste :

```txt
MatchGame
```
