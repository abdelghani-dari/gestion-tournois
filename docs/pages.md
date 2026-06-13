# Pages de l'Application — Gestion Tournois Locaux

## 1. Objectif

Ce document présente les pages nécessaires pour le prototype frontend de l'application **Gestion Tournois Locaux**.

La nouvelle version de l'application se concentre uniquement sur la gestion des tournois locaux de football.

L'application ne contient pas :

- de championnats ;
- de compétitions officielles ;
- de paiement simulé ;
- de réseau social complet.

Le principe principal est simple :

```txt
Un utilisateur crée un tournoi local.
L'administrateur accepte ou refuse le tournoi.
Si le tournoi est accepté, les équipes peuvent demander la participation.
Le créateur du tournoi gère les équipes, les matchs, les résultats et les classements.
```

---

## 2. Pages publiques

Ces pages sont accessibles sans connexion.

| Page | Route proposée | Description |
|---|---|---|
| Accueil | `/` | Présentation simple de l'application |
| Liste des tournois | `/tournaments` | Affiche uniquement les tournois acceptés par l'admin |
| Détail tournoi | `/tournaments/:id` | Affiche les informations, équipes, matchs, résultats et classement du tournoi |
| Classement tournoi | `/tournaments/:id/ranking` | Affiche le classement du tournoi |
| Résultats tournoi | `/tournaments/:id/results` | Affiche les matchs joués et les scores |
| Connexion | `/login` | Connexion utilisateur |
| Inscription | `/register` | Création de compte utilisateur |

### 2.1 Accueil

Contenu conseillé :

- nom de l'application ;
- description courte ;
- bouton vers la liste des tournois ;
- bouton connexion / inscription.

### 2.2 Liste des tournois

Cette page affiche seulement les tournois validés :

```txt
approval_status = accepted
```

Informations affichées :

- nom du tournoi ;
- ville ;
- lieu ;
- date de début ;
- date de fin ;
- statut : open, active, finished.

### 2.3 Détail tournoi

Cette page affiche :

- informations générales ;
- équipes participantes ;
- matchs programmés ;
- derniers résultats ;
- classement ;
- bouton de demande de participation si l'utilisateur possède une équipe.

---

## 3. Pages utilisateur connecté

Ces pages sont accessibles après connexion.

| Page | Route proposée | Description |
|---|---|---|
| Dashboard utilisateur | `/dashboard` | Résumé des tournois et équipes de l'utilisateur |
| Mes tournois | `/my-tournaments` | Liste des tournois créés par l'utilisateur |
| Créer tournoi | `/my-tournaments/create` | Formulaire de création d'un tournoi local |
| Modifier tournoi | `/my-tournaments/:id/edit` | Modification d'un tournoi créé par l'utilisateur |
| Gestion tournoi | `/my-tournaments/:id/manage` | Page centrale de gestion du tournoi |
| Mes équipes | `/my-teams` | Liste des équipes créées par l'utilisateur |
| Créer équipe | `/my-teams/create` | Formulaire de création d'une équipe |
| Modifier équipe | `/my-teams/:id/edit` | Modification d'une équipe |
| Joueurs équipe | `/my-teams/:id/players` | Gestion des joueurs d'une équipe |
| Mes demandes | `/my-requests` | Suivi des demandes de participation envoyées |

---

## 4. Pages de gestion d'un tournoi

Ces pages concernent le créateur du tournoi.

| Page | Route proposée | Description |
|---|---|---|
| Gestion tournoi | `/my-tournaments/:id/manage` | Vue globale de gestion |
| Demandes de participation | `/my-tournaments/:id/requests` | Accepter ou refuser les équipes |
| Équipes participantes | `/my-tournaments/:id/teams` | Liste des équipes acceptées |
| Matchs | `/my-tournaments/:id/matches` | Liste des matchs du tournoi |
| Créer match | `/my-tournaments/:id/matches/create` | Planifier un match |
| Modifier match | `/my-tournaments/:id/matches/:matchId/edit` | Modifier un match |
| Saisir résultat | `/my-tournaments/:id/matches/:matchId/result` | Entrer le score du match |
| Classement | `/my-tournaments/:id/ranking` | Voir le classement calculé |
| Statistiques | `/my-tournaments/:id/statistics` | Voir ou ajouter les statistiques simples |

### 4.1 Gestion tournoi

Cette page sert comme tableau de bord du tournoi.

Elle affiche :

- statut de validation admin ;
- nombre d'équipes acceptées ;
- nombre de demandes en attente ;
- nombre de matchs programmés ;
- derniers résultats ;
- accès rapide aux pages de gestion.

### 4.2 Demandes de participation

Le créateur du tournoi peut :

- consulter les demandes reçues ;
- accepter une équipe ;
- refuser une équipe ;
- voir le message envoyé par le responsable d'équipe.

Quand une demande est acceptée :

```txt
L'équipe est ajoutée à tournament_team.
La demande devient accepted.
```

### 4.3 Matchs et résultats

Le créateur du tournoi peut :

- créer un match ;
- choisir l'équipe domicile ;
- choisir l'équipe extérieure ;
- définir la date et l'heure ;
- saisir le score ;
- marquer le match comme joué.

---

## 5. Pages admin

Ces pages sont réservées à l'administrateur.

| Page | Route proposée | Description |
|---|---|---|
| Dashboard admin | `/admin` | Vue globale de l'administration |
| Tournois en attente | `/admin/tournaments/pending` | Liste des tournois à valider |
| Tous les tournois | `/admin/tournaments` | Liste complète des tournois |
| Détail tournoi admin | `/admin/tournaments/:id` | Voir les informations complètes d'un tournoi |
| Utilisateurs | `/admin/users` | Liste simple des utilisateurs |

### 5.1 Tournois en attente

Cette page est importante dans la nouvelle version.

L'admin peut :

- voir les tournois avec `approval_status = pending` ;
- accepter un tournoi ;
- refuser un tournoi ;
- écrire une note de refus optionnelle.

Règle :

```txt
Un tournoi refusé n'est pas visible publiquement.
Un tournoi accepté devient visible et les équipes peuvent demander la participation.
```

### 5.2 Détail tournoi admin

L'admin peut consulter :

- nom du tournoi ;
- créateur ;
- ville ;
- lieu ;
- dates ;
- description ;
- statut de validation ;
- équipes ;
- matchs ;
- résultats.

---

## 6. Pages optionnelles

Ces pages peuvent être ajoutées si le temps reste suffisant.

| Page | Route proposée | Description |
|---|---|---|
| Profil | `/profile` | Modifier le nom ou mot de passe |
| Annonces tournoi | `/my-tournaments/:id/posts` | Publier une annonce simple liée au tournoi |
| Composition match | `/my-tournaments/:id/matches/:matchId/compositions` | Définir titulaires/remplaçants |

Ces pages ne sont pas prioritaires pour le prototype.

---

## 7. Pages prioritaires pour le prototype

Pour une démonstration simple, les pages prioritaires sont :

```txt
1. Login / Register
2. Dashboard utilisateur
3. Créer tournoi
4. Liste des tournois publics
5. Détail tournoi
6. Admin : accepter/refuser tournoi
7. Créer équipe
8. Demander participation
9. Accepter/refuser équipe
10. Créer match
11. Saisir résultat
12. Voir classement
```

---

## 8. Parcours de démonstration

Parcours conseillé pour la soutenance :

```txt
1. Un utilisateur crée un compte.
2. Il crée un tournoi local.
3. Le tournoi apparaît dans l'espace admin comme pending.
4. L'admin accepte le tournoi.
5. Le tournoi devient visible dans la liste publique.
6. Un utilisateur crée une équipe.
7. Il demande la participation au tournoi.
8. Le créateur du tournoi accepte l'équipe.
9. Le créateur planifie un match.
10. Il saisit le résultat.
11. Le système affiche le classement automatiquement.
```

---

## 9. Résumé des routes frontend

```txt
/
/login
/register
/dashboard
/tournaments
/tournaments/:id
/tournaments/:id/ranking
/tournaments/:id/results
/my-tournaments
/my-tournaments/create
/my-tournaments/:id/edit
/my-tournaments/:id/manage
/my-tournaments/:id/requests
/my-tournaments/:id/teams
/my-tournaments/:id/matches
/my-tournaments/:id/matches/create
/my-tournaments/:id/matches/:matchId/edit
/my-tournaments/:id/matches/:matchId/result
/my-tournaments/:id/ranking
/my-tournaments/:id/statistics
/my-teams
/my-teams/create
/my-teams/:id/edit
/my-teams/:id/players
/my-requests
/admin
/admin/tournaments
/admin/tournaments/pending
/admin/tournaments/:id
/admin/users
```

---

## 10. Conclusion

Le frontend doit rester simple et centré sur la gestion des tournois locaux.

Les pages les plus importantes sont celles qui montrent le cycle complet :

```txt
création tournoi → validation admin → participation équipe → matchs → résultats → classement
```
