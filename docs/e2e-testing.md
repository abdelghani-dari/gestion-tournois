# Tests end-to-end frontend

## Objectif

Les tests end-to-end vérifient que l'application fonctionne correctement du point de vue utilisateur, dans un vrai navigateur.

L'objectif est de valider les parcours critiques entre le frontend React, le backend Laravel et la base de données, sans se limiter à tester les composants ou les endpoints séparément.

## Outil utilisé

Les tests E2E utilisent **Playwright**.

Playwright permet d'ouvrir l'application dans un navigateur Chromium, d'interagir avec l'interface comme un utilisateur réel, puis de vérifier le résultat affiché ou l'état de l'application.

## Test actuel

Le premier test E2E est :

```text
frontend/e2e/login.spec.ts
```

Ce test couvre le flux de connexion entre le frontend et le backend.

## Ce que vérifie le test de connexion

Le test de connexion vérifie que :

- la page frontend `/login` s'ouvre correctement;
- les identifiants de démonstration sont saisis dans le formulaire;
- la soumission du formulaire appelle bien l'authentification backend;
- le token JWT et l'état de connexion sont enregistrés côté frontend;
- l'utilisateur est redirigé vers le dashboard ou qu'un état authentifié est visible.

Ce test valide donc le lien complet entre l'interface de connexion, l'API Laravel et la gestion du token JWT côté navigateur.

## Exécution des tests E2E

Avant de lancer les tests, reconstruire le conteneur frontend afin d'inclure Chromium dans l'image Docker :

```bash
docker compose up -d --build frontend
```

Lancer les tests E2E :

```bash
docker compose exec frontend npm run test:e2e
```

## Résultat actuel

Résultat actuel de la suite E2E :

```text
1 passed
```

## Prérequis

Le backend et la base de données doivent être démarrés.

La base doit être seedée avec les comptes de démonstration, notamment :

```text
admin@example.com / password
```

Si la base est vide, exécuter les migrations et seeders backend avant de lancer le test E2E.

## Tests E2E prévus

Les prochains tests E2E pourront couvrir :

- le parcours complet de création et validation d'un tournoi;
- l'approbation d'un tournoi par un administrateur;
- l'envoi et l'acceptation d'une demande de participation;
- la saisie d'un résultat de match;
- l'affichage et le recalcul du classement.
