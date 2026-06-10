# Cahier des Charges — Gestion Tournois

## 1. Présentation du projet

### 1.1 Intitulé

Application de Gestion Sportive — Gestion Tournois

### 1.2 Nouvelle orientation

Dans le cadre du projet tutoré, notre équipe développe une plateforme web de football permettant de gérer et consulter des compétitions sportives.

L'application vise à combiner deux besoins :

- la gestion des grandes compétitions officielles ou majeures, comme la Coupe du Monde, la Ligue des Champions, La Liga ou la Botola ;
- la gestion des compétitions locales créées par des organisateurs, comme les tournois de quartier, tournois Ramadan, compétitions scolaires ou associatives.

L'application propose aussi un feed football simple permettant d'afficher les annonces, résultats, actualités et publications liées aux compétitions.

---

## 2. Problématique

Les résultats et informations des grandes compétitions sont faciles à trouver, mais les compétitions locales sont souvent gérées manuellement avec WhatsApp, papier, Excel ou publications dispersées.

Les organisateurs locaux ont besoin d'un outil centralisé pour créer leurs tournois, gérer les équipes, planifier les matchs, saisir les résultats et générer automatiquement les classements.

Les joueurs, managers et supporters ont besoin d'un espace simple pour suivre les matchs, résultats, classements et statistiques, surtout pour les compétitions locales.

---

## 3. Objectifs

L'application doit permettre de :

- gérer les saisons sportives ;
- gérer les championnats officiels et locaux ;
- gérer les tournois officiels et locaux ;
- distinguer les compétitions officielles et les compétitions créées par les utilisateurs ;
- permettre à un organizer de créer une compétition locale après paiement simulé ;
- permettre à un team manager de créer une équipe et demander la participation à une compétition locale ;
- gérer les équipes et joueurs ;
- planifier les matchs ;
- enregistrer les résultats ;
- confirmer ou contester les résultats locaux ;
- générer automatiquement les classements ;
- consulter les statistiques sportives ;
- publier des annonces et actualités dans un feed football simple.

---

## 4. Utilisateurs de l'application

### 4.1 Admin

L'admin gère la plateforme complète.

Il peut :

- gérer les utilisateurs ;
- créer et gérer les compétitions officielles ;
- gérer les saisons ;
- gérer les championnats ;
- gérer les tournois ;
- gérer les équipes officielles ;
- gérer les matchs officiels ;
- saisir les résultats officiels ;
- consulter les paiements simulés ;
- superviser les publications.

### 4.2 Organizer

L'organizer est un utilisateur qui crée et gère des compétitions locales.

Il peut :

- activer son compte via un paiement simulé ;
- créer un championnat local ;
- créer un tournoi local ;
- gérer les équipes participantes ;
- accepter ou refuser les demandes de participation ;
- planifier les matchs ;
- saisir les scores ;
- valider les résultats locaux ;
- publier des annonces.

### 4.3 Team Manager

Le team manager est le responsable d'une équipe locale.

Il peut :

- créer son équipe ;
- ajouter les joueurs ;
- demander la participation à une compétition locale ;
- consulter les matchs de son équipe ;
- confirmer ou contester un résultat.

### 4.4 Viewer / Fan

Le viewer peut consulter :

- les compétitions officielles ;
- les compétitions locales ;
- les équipes ;
- les joueurs ;
- les matchs ;
- les résultats ;
- les classements ;
- les statistiques ;
- le feed football.

---

## 5. Fonctionnalités principales

### 5.1 Authentification et rôles

- Inscription.
- Connexion.
- Choix du rôle.
- Gestion des droits selon le rôle.
- Simulation de paiement pour devenir organizer.

### 5.2 Gestion des saisons

- Ajouter une saison.
- Modifier une saison.
- Supprimer une saison.
- Consulter la liste des saisons.

### 5.3 Gestion des championnats

- Créer un championnat.
- Associer un championnat à une saison.
- Définir le niveau : international, national ou local.
- Définir la source : official ou user_created.
- Ajouter des équipes au championnat.
- Modifier ou supprimer un championnat.

### 5.4 Gestion des tournois

- Créer un tournoi.
- Associer un tournoi à une saison.
- Définir le niveau : international, national ou local.
- Définir la source : official ou user_created.
- Ajouter des équipes au tournoi.
- Modifier ou supprimer un tournoi.

### 5.5 Gestion des équipes

- Ajouter une équipe.
- Modifier une équipe.
- Supprimer une équipe.
- Ajouter un logo d'équipe.
- Associer une équipe à un championnat ou tournoi.
- Lier une équipe locale à un team manager.

### 5.6 Gestion des joueurs

- Ajouter un joueur.
- Modifier un joueur.
- Supprimer un joueur.
- Associer un joueur à une équipe.
- Ajouter une photo de joueur.

### 5.7 Demandes de participation

- Le team manager envoie une demande de participation.
- L'organizer consulte les demandes reçues.
- L'organizer accepte ou refuse la demande.
- Si la demande est acceptée, l'équipe est ajoutée à la compétition.

### 5.8 Gestion des matchs

- Planifier un match.
- Définir l'équipe domicile et l'équipe extérieure.
- Définir la date et l'heure du match.
- Saisir le score.
- Modifier le statut du match.

### 5.9 Gestion des résultats locaux

- Saisir un résultat local.
- Marquer le résultat comme pending.
- Permettre au team manager de confirmer ou contester.
- Valider le résultat.
- Utiliser uniquement les résultats confirmed pour le classement.

### 5.10 Gestion des compositions

- Sélectionner les joueurs participants à un match.
- Définir les titulaires.
- Définir les remplaçants.

### 5.11 Gestion des classements

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

### 5.12 Gestion des statistiques

- Suivre les statistiques des équipes.
- Suivre les statistiques des joueurs.
- Consulter les performances sportives.

### 5.13 Feed football

- Publier une annonce.
- Publier une actualité.
- Publier un résultat.
- Afficher les dernières publications.
- Relier une publication à un championnat ou tournoi.

---

## 6. Besoins non fonctionnels

- Interface simple et ergonomique.
- Application rapide.
- Données sécurisées.
- Code maintenable.
- Architecture claire.
- Collaboration via GitHub.
- Environnement de développement simple avec Docker.
- Documentation complète.
- Séparation claire entre frontend, backend et base de données.

---

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

---

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

---

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
posts/post-image.jpg
```

Les images statiques de l'interface sont stockées dans :

```txt
frontend/src/assets
```

ou :

```txt
frontend/public
```

---

## 10. Contraintes

- Respect du délai du projet tutoré.
- Travail en équipe.
- Utilisation de GitHub.
- Utilisation de Docker pour simplifier l'installation.
- Ne pas pousser les fichiers `.env`.
- Ne pas pousser `node_modules` ni `vendor`.
- Garder une structure claire entre frontend et backend.
- Le paiement réel n'est pas inclus dans la première version ; seul un paiement simulé est prévu.
- Les fonctionnalités sociales avancées comme chat, likes, commentaires et followers ne sont pas incluses dans la première version.

---

## 11. Résultat attendu

À la fin du projet, l'application devra permettre la gestion complète d'une plateforme football combinant compétitions officielles et locales.

Le prototype devra permettre :

- à l'admin de gérer les compétitions officielles ;
- à l'organizer de créer et gérer ses compétitions locales ;
- au team manager de créer une équipe et demander la participation ;
- au viewer de suivre les résultats, classements, statistiques et publications.

---

## 12. Livrables

- Fiche de cadrage
- Cahier des charges
- Planning
- Rapports d'avancement
- Documentation technique
- Prototype
- Rapport final
