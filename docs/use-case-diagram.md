# Diagramme de Cas d'Utilisation — Gestion Tournois

## 1. Objectif

Ce diagramme présente les principales fonctionnalités de l'application et les acteurs qui interagissent avec le système.

## 2. Acteurs

### Admin / Responsable sportif

L'admin est l'acteur principal. Il peut gérer toutes les données sportives.

### Utilisateur simple / Viewer

L'utilisateur simple peut consulter les informations publiques : équipes, matchs, classements et statistiques.

## 3. Cas d'utilisation

- S'authentifier
- Gérer les saisons
- Gérer les championnats
- Gérer les tournois
- Gérer les équipes
- Gérer les joueurs
- Planifier les matchs
- Saisir les résultats
- Gérer les compositions d'équipes
- Générer les classements
- Consulter les statistiques

## 4. Diagramme

```mermaid
flowchart LR
    Admin[Admin / Responsable sportif]
    Viewer[Utilisateur simple / Viewer]

    UC1((S'authentifier))
    UC2((Gérer les saisons))
    UC3((Gérer les championnats))
    UC4((Gérer les tournois))
    UC5((Gérer les équipes))
    UC6((Gérer les joueurs))
    UC7((Planifier les matchs))
    UC8((Saisir les résultats))
    UC9((Gérer les compositions))
    UC10((Générer les classements))
    UC11((Consulter les statistiques))

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    Viewer --> UC1
    Viewer --> UC10
    Viewer --> UC11
```

## 5. Remarque

L'admin possède les droits de gestion, tandis que l'utilisateur simple possède seulement des droits de consultation.