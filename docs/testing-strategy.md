# Stratégie de test backend

## Objectif

L'objectif de la stratégie de test est de vérifier que le backend Laravel respecte les règles métier principales de l'application de gestion de tournois, tout en sécurisant les actions sensibles.

Les tests couvrent les parcours critiques : authentification, création et validation des tournois, gestion des équipes et des joueurs, demandes de participation, matchs, résultats, classements, statistiques et workflow complet.

## Types de tests utilisés

### 1. Tests unitaires

Les tests unitaires servent à vérifier une logique isolée, sans exécuter tout un parcours applicatif.

Dans le projet, des services métier ont été introduits pour séparer la logique pure des contrôleurs. Ces services sont placés dans `backend/app/Services/` et couvrent les règles de classement, de résultat de match, de statistiques, de tournoi, de demande de participation et de propriété.

Les tests unitaires vérifient ces règles de manière isolée :

- ils n'appellent pas les routes API;
- ils n'utilisent pas la base de données;
- ils n'utilisent pas de token JWT;
- ils ne dépendent pas de PostgreSQL;
- ils ne déclenchent pas `RefreshDatabase`.

Résultat actuel des tests unitaires :

- 48 tests passés;
- 115 assertions.

### 2. Tests Feature/API

Les tests Feature/API vérifient les endpoints HTTP réels de l'application.

Ils sont utilisés pour tester :

- les routes API;
- les statuts HTTP;
- les réponses JSON;
- la validation des champs;
- les autorisations;
- les effets en base de données.

Ce type de test est essentiel pour un backend Laravel, car il valide le comportement tel qu'il est consommé par le frontend.

### 3. Tests d'intégration

Les tests d'intégration vérifient un enchaînement complet de plusieurs modules.

Ils sont utilisés pour s'assurer que les fonctionnalités fonctionnent ensemble, par exemple :

- création d'un tournoi;
- validation par un administrateur;
- création d'équipe et de joueur;
- demande de participation;
- acceptation de la demande;
- création d'un match;
- saisie d'un résultat;
- recalcul du classement;
- création d'une statistique.

Ces tests permettent de valider les parcours métier complets, et pas seulement les endpoints séparés.

### 4. Tests de sécurité

Les tests de sécurité vérifient que les utilisateurs ne peuvent pas accéder aux ressources ou aux actions qui ne leur appartiennent pas.

Ils sont utilisés pour contrôler :

- l'accès aux routes protégées;
- les routes réservées aux administrateurs;
- les actions réservées aux créateurs de tournois;
- l'interdiction de modifier les données d'un autre utilisateur;
- le rejet des tokens JWT invalides.

Ces tests réduisent le risque de régression sur les règles d'autorisation.

### 5. Tests de validation

Les tests de validation vérifient que l'API refuse les données invalides.

Ils couvrent notamment :

- les champs obligatoires;
- les dates invalides;
- les types de statistiques autorisés;
- les scores négatifs;
- les numéros de joueurs non entiers;
- les relations invalides entre match, équipe et joueur.

Ces tests garantissent que les données en base restent cohérentes.

### 6. Tests de régression

Les tests de régression empêchent le retour de bugs déjà détectés.

Deux régressions importantes sont maintenant protégées :

- la liste des demandes de participation reçues doit utiliser la propriété du tournoi, et pas seulement le rôle `creator`;
- la création et la modification des statistiques doivent être réservées au créateur du tournoi ou à l'administrateur, avec un contexte match/équipe/joueur valide.

### 7. Tests smoke

Les tests smoke sont des vérifications rapides pour confirmer que les routes backend essentielles répondent après le démarrage de l'application ou après une modification.

Ils ne remplacent pas les tests métier détaillés. Leur objectif est seulement de détecter rapidement une route cassée, une erreur d'authentification ou une réponse non JSON.

Le fichier `SmokeTest.php` vérifie :

- l'endpoint public des tournois;
- la connexion avec des identifiants valides;
- le rejet de `/api/me` pour un visiteur non connecté;
- le fonctionnement de `/api/me` avec un vrai token JWT Bearer;
- les routes publiques de classement et de statistiques;
- les réponses JSON.

Résultat actuel des tests smoke :

- 5 tests passés;
- 22 assertions.

## Outils utilisés

### Laravel PHPUnit

Laravel PHPUnit est utilisé pour exécuter les tests backend. Il permet de tester les routes API, les réponses JSON, la validation, les autorisations et les effets en base de données.

### RefreshDatabase

Le trait `RefreshDatabase` est utilisé par les tests Feature/API pour remettre la base de test dans un état propre entre les tests.

Cela garantit que les tests sont indépendants, reproductibles et non dépendants de données créées par un autre test.

Les tests unitaires des services métier ne l'utilisent pas, car ils ne touchent pas à la base de données.

### Tokens JWT Bearer réels

Les tests Feature/API utilisent de vrais tokens JWT Bearer obtenus via la route :

```bash
POST /api/login
```

Ce choix permet de tester l'authentification comme en conditions réelles, au lieu de simuler artificiellement un utilisateur connecté.

Les tests unitaires des services métier n'utilisent pas de JWT.

### Docker Compose

Docker Compose est utilisé pour exécuter les tests dans l'environnement local du projet.

Cela permet de lancer les tests dans le même contexte que l'application backend :

- conteneur backend;
- base PostgreSQL;
- configuration Laravel;
- dépendances PHP installées dans le conteneur.

## Périmètre de test

La campagne de tests backend couvre les modules suivants :

- Authentification;
- Tournois;
- Validation administrative des tournois;
- Équipes et joueurs;
- Demandes de participation;
- Matchs et résultats;
- Classements;
- Statistiques;
- Règles métier unitaires isolées;
- Tests smoke des routes essentielles;
- Workflow complet d'un tournoi;
- Sécurité et régressions.

## Commande d'exécution

Pour exécuter toute la suite de tests backend :

```bash
docker compose exec backend php artisan test
```

Pour exécuter uniquement les tests unitaires :

```bash
docker compose exec backend php artisan test --testsuite=Unit
```

Pour exécuter uniquement les tests smoke :

```bash
docker compose exec backend php artisan test --filter=SmokeTest
```

Pour exécuter un fichier ou un groupe de tests spécifique :

```bash
docker compose exec backend php artisan test --filter=NomDuTest
```
