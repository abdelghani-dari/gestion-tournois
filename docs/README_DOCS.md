# Documentation — Gestion Tournois Locaux

Ce dossier contient la version simplifiée et corrigée de la documentation du projet **Gestion Tournois**.

## Nouvelle orientation validée

L'application ne gère plus :

- les championnats ;
- les compétitions officielles ou majeures ;
- les paiements simulés ;
- les rôles `organizer`, `team_manager`, `viewer` ;
- les grandes compétitions comme World Cup, Champions League, La Liga ou Botola.

L'application devient une plateforme simple de **gestion des tournois locaux de football**.

## Principe principal

Un utilisateur peut créer un tournoi local. Le tournoi n'est pas directement visible : il passe d'abord par une validation de l'administrateur.

Après validation :

1. le tournoi devient public ;
2. les équipes peuvent demander la participation ;
3. le créateur du tournoi accepte ou refuse les équipes ;
4. le créateur planifie les matchs ;
5. le créateur saisit les résultats ;
6. le système calcule le classement et les statistiques.

## Documents inclus

| Fichier | Rôle |
|---|---|
| `fiche-de-cadrage.md` | Présentation générale du projet |
| `cahier-des-charges.md` | Besoins fonctionnels et non fonctionnels |
| `planning.md` | Planning prévisionnel |
| `conception.md` | Conception fonctionnelle et règles métier |
| `architecture.md` | Architecture technique avec diagramme |
| `database-schema.md` | Schéma de base de données et ERD |
| `use-case-diagram.md` | Acteurs et cas d'utilisation |
| `class-diagram.md` | Diagramme de classes |
| `sequence-diagrams.md` | Diagrammes de séquence principaux |
| `documentation-technique.md` | Documentation technique backend/frontend/API |
| `rapport-avancement-1.md` | Rapport d'avancement adapté |
| `rapport-final-template.md` | Structure de rapport final prête à compléter |
| `implementation-changes.md` | Changements techniques à faire dans le code |
| `frontend-pages.md` | Pages frontend minimales du prototype |

## Remarque

Les diagrammes sont écrits en Mermaid. Ils peuvent être affichés directement dans GitHub, GitLab, Notion, Obsidian ou dans un éditeur compatible Mermaid.
