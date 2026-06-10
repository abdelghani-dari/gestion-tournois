# Fiche de Cadrage — Gestion Tournois

## 1. Intitulé du projet

Application de Gestion Sportive — Gestion Tournois

## 2. Contexte du projet

Dans le cadre du projet tutoré, notre équipe développe une application web de gestion sportive orientée football.

L'objectif est de créer une plateforme permettant de gérer et consulter à la fois :

- des compétitions officielles ou majeures comme la Coupe du Monde, la Ligue des Champions, La Liga ou la Botola ;
- des compétitions locales créées par des organisateurs, comme les tournois de quartier, tournois Ramadan, compétitions scolaires ou associatives.

La plateforme permet aussi aux team managers de créer leurs équipes et de demander la participation à des compétitions locales.

## 3. Problématique

La gestion manuelle des compétitions sportives devient difficile lorsque le nombre d'équipes, de joueurs et de matchs augmente.

Ce problème est encore plus visible pour les compétitions locales, souvent organisées avec WhatsApp, Excel ou papier, ce qui rend difficile le suivi des résultats, classements et statistiques.

Les responsables sportifs et organisateurs ont besoin d'un outil centralisé permettant de créer des compétitions, gérer les équipes, planifier les matchs, enregistrer les résultats, valider les scores et générer automatiquement les classements.

Les utilisateurs simples ont besoin d'un espace clair pour suivre les compétitions officielles et locales, les matchs, les résultats, les classements, les statistiques et les publications.

## 4. Objectifs du projet

- Gérer les saisons sportives.
- Gérer les compétitions officielles.
- Gérer les championnats.
- Gérer les tournois.
- Gérer les compétitions locales créées par les utilisateurs.
- Gérer les équipes.
- Gérer les joueurs.
- Permettre aux team managers de demander la participation à une compétition locale.
- Permettre aux organizers d'accepter ou refuser les demandes.
- Planifier les matchs.
- Saisir les résultats.
- Confirmer ou contester les résultats locaux.
- Gérer les compositions d'équipes.
- Générer les classements.
- Consulter les statistiques.
- Publier des annonces et actualités via un feed football simple.
- Simuler un paiement pour l'activation du rôle organizer.

## 5. Périmètre du projet

### Inclus dans le projet

- Interface web frontend.
- API backend.
- Base de données PostgreSQL.
- Gestion CRUD des principales entités.
- Gestion des rôles : admin, organizer, team_manager, viewer.
- Gestion des compétitions officielles.
- Gestion des compétitions locales.
- Système de paiement simulé pour organizer.
- Demandes de participation des équipes.
- Validation simple des résultats locaux.
- Classement automatique.
- Statistiques simples.
- Feed football simple.
- Déploiement local avec Docker Compose.
- Documentation technique.

### Non inclus dans la première version

- Application mobile.
- Paiement réel en ligne.
- Notifications en temps réel.
- Chat privé.
- Likes, commentaires et followers avancés.
- Gestion avancée des arbitres.
- Système complexe de billetterie.
- Connexion à une API football réelle pour les résultats live.

## 6. Utilisateurs cibles

- Administrateurs de la plateforme.
- Organisateurs de compétitions locales.
- Responsables d'équipes locales.
- Responsables sportifs.
- Membres d'organisation sportive.
- Utilisateurs simples souhaitant consulter les résultats, classements, statistiques et publications.

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

## 8. Résultat attendu

À la fin du projet, l'application devra permettre la gestion complète d'une plateforme football combinant les compétitions officielles et locales.

Le prototype devra permettre :

- à l'admin de gérer les compétitions officielles ;
- à l'organizer de créer et gérer ses propres compétitions locales ;
- au team manager de créer une équipe et demander la participation ;
- aux viewers de consulter les matchs, résultats, classements, statistiques et publications.

## 9. Contraintes

- Respect des délais du projet tutoré.
- Travail en équipe.
- Utilisation de GitHub pour la collaboration.
- Interface simple et claire.
- Code maintenable.
- Documentation complète.
- Paiement réel non inclus dans la première version.
- Fonctionnalités sociales limitées à un feed simple.

## 10. Livrables

- Fiche de cadrage
- Cahier des charges
- Planning
- Rapports d'avancement
- Documentation technique
- Prototype
- Rapport final
