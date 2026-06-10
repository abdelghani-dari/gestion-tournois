# Conception — Gestion Tournois

## 1. Objectif de la conception

Cette conception définit la structure fonctionnelle et technique de l'application **Gestion Tournois**.

L'application devient une plateforme football permettant de gérer et consulter :

- les compétitions officielles : Coupe du Monde, Ligue des Champions, La Liga, Botola, etc. ;
- les compétitions locales créées par les organisateurs ;
- les saisons sportives ;
- les championnats ;
- les tournois ;
- les équipes ;
- les joueurs ;
- les matchs ;
- les compositions d'équipes ;
- les résultats ;
- les classements ;
- les statistiques ;
- les publications d'actualité sportive.

Le but est de proposer une plateforme qui combine la gestion sportive et un feed football simple, sans construire un réseau social complet.

---

## 2. Acteurs

### Admin

L'admin gère toute la plateforme. Il peut créer et gérer les compétitions officielles ou majeures, gérer les utilisateurs, suivre les paiements simulés et superviser les contenus.

Exemples de compétitions gérées par l'admin :

- Coupe du Monde
- Ligue des Champions
- La Liga
- Botola Pro

### Organizer

L'organizer est un utilisateur qui peut créer et gérer ses propres compétitions locales après activation de son compte via un paiement simulé.

Il peut :

- créer un tournoi local ;
- créer un championnat local ;
- gérer les équipes participantes ;
- accepter ou refuser les demandes de participation ;
- planifier les matchs ;
- saisir les résultats ;
- publier des annonces.

### Team Manager

Le team manager représente un responsable d'équipe locale.

Il peut :

- créer son équipe ;
- ajouter les joueurs ;
- demander la participation à une compétition locale ;
- suivre les matchs de son équipe ;
- confirmer ou contester un résultat local.

### Viewer / Fan

Le viewer est un utilisateur simple. Il peut consulter les informations publiques :

- compétitions officielles ;
- compétitions locales ;
- matchs ;
- résultats ;
- classements ;
- statistiques ;
- publications.

---

## 3. Cas d'utilisation principaux

### Authentification et comptes

- S'inscrire
- Se connecter
- Choisir un rôle
- Simuler un paiement pour devenir organizer

### Admin

- Gérer les utilisateurs
- Gérer les compétitions officielles
- Gérer les saisons
- Gérer les championnats officiels
- Gérer les tournois officiels
- Gérer les matchs et résultats officiels
- Consulter les paiements simulés
- Superviser les publications

### Organizer

- Créer une compétition locale
- Gérer ses championnats locaux
- Gérer ses tournois locaux
- Gérer les demandes de participation
- Gérer les matchs locaux
- Saisir les résultats locaux
- Valider les résultats
- Publier une annonce ou une actualité

### Team Manager

- Créer une équipe
- Ajouter les joueurs
- Envoyer une demande de participation
- Consulter ses demandes
- Confirmer ou contester un résultat

### Viewer / Fan

- Consulter les compétitions officielles
- Consulter les compétitions locales
- Filtrer par type, niveau, ville ou date
- Consulter les matchs du jour
- Consulter les résultats
- Consulter les classements
- Consulter les statistiques
- Consulter le feed football

---

## 4. Entités principales

- User
- FakePayment
- Season
- Championship
- Tournament
- Team
- Player
- MatchGame
- Composition
- Ranking
- Statistic
- JoinRequest
- Post
- ChampionshipTeam
- TournamentTeam

---

## 5. Règles métier importantes

### Règles des rôles

```txt
Admin       : contrôle total de la plateforme
Organizer   : contrôle uniquement ses propres compétitions locales
TeamManager : contrôle uniquement ses équipes et joueurs
Viewer      : consultation seulement
```

### Règles des compétitions

Chaque championnat ou tournoi possède deux informations importantes :

```txt
level  = international / national / local
source = official / user_created
```

Exemples :

| Compétition | Type | level | source |
|---|---|---|---|
| World Cup | tournament | international | official |
| La Liga | championship | national | official |
| Ramadan Cup Taourirt | tournament | local | user_created |
| Quartier League | championship | local | user_created |

### Règles des résultats locaux

Un résultat local peut avoir trois états :

```txt
pending
confirmed
disputed
```

Seuls les résultats `confirmed` sont utilisés pour calculer les classements.

### Règles de paiement simulé

Le paiement réel n'est pas inclus dans la première version. Le prototype utilise un système de paiement simulé pour montrer le fonctionnement futur.

Processus :

```txt
1. L'utilisateur crée un compte.
2. Il choisit le rôle organizer.
3. Il accède à une page de paiement simulé.
4. Il clique sur Fake Pay.
5. Son payment_status devient paid.
6. Son rôle devient organizer.
```

---

## 6. Remarque importante

Le modèle représentant un match ne doit pas s'appeler `Match`, car `match` est un mot réservé en PHP.

Nom recommandé :

```txt
MatchGame
```

---

## 7. Architecture générale

```txt
Utilisateur
    |
    v
React Frontend
    |
    | REST API
    v
Laravel Backend
    |
    v
PostgreSQL Database
```

Docker Compose lance les services frontend, backend et base de données.
