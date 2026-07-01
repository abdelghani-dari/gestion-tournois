# Résultats des tests backend

## Résumé général

La campagne de tests backend a permis de valider les principaux parcours métier de l'application et de sécuriser les règles d'autorisation critiques.

Résultat global :

- 162 tests passés;
- 834 assertions;
- 0 test en échec après correction;
- exécution dans l'environnement Docker Compose local.

Résultat des tests unitaires :

- 48 tests passés;
- 115 assertions;
- tests exécutés sans routes API, sans base de données et sans JWT.

## Tableau récapitulatif

| Fichier de test | Nombre de tests | Assertions | Objectif principal |
| --- | ---: | ---: | --- |
| `AuthTest.php` | 7 | 44 | Vérifier l'inscription, la connexion JWT, le profil utilisateur, la déconnexion et les accès invités. |
| `TournamentTest.php` | 9 | 59 | Vérifier la création, les statuts par défaut, la liste publique, les tournois personnels, la propriété et la validation des dates. |
| `AdminTournamentApprovalTest.php` | 9 | 49 | Vérifier le workflow d'acceptation/refus des tournois par l'administrateur et les restrictions pour les utilisateurs normaux. |
| `TeamPlayerTest.php` | 12 | 77 | Vérifier la création et la gestion des équipes, des joueurs, des droits de propriété et des validations principales. |
| `JoinRequestTest.php` | 14 | 72 | Vérifier les demandes de participation, les doublons, l'acceptation/refus par le créateur du tournoi et l'insertion dans `tournament_team`. |
| `MatchGameTest.php` | 17 | 91 | Vérifier la création de matchs, les règles de participation des équipes, la saisie des résultats, la confirmation/refus et la sécurité. |
| `RankingTest.php` | 12 | 103 | Vérifier le recalcul des classements, les points, les buts, les différences de buts, les tris et l'exclusion des résultats non confirmés. |
| `StatisticTest.php` | 17 | 79 | Vérifier les statistiques de match, les types autorisés, les validations de contexte et les permissions créateur/admin. |
| `FullTournamentFlowTest.php` | 3 | 89 | Vérifier le parcours complet : tournoi, validation admin, équipe, joueur, demande, match, résultat, classement et statistique. |
| `SecurityRegressionTest.php` | 14 | 56 | Vérifier les règles de sécurité principales et empêcher le retour des bugs déjà corrigés. |
| Tests unitaires des services métier | 48 | 115 | Vérifier les règles métier isolées sans API, sans base de données et sans JWT. |
| **Total** | **162** | **834** | **Couverture backend professionnelle des parcours métier critiques et des règles isolées.** |

## Tests unitaires ajoutés

Des services métier ont été ajoutés dans `backend/app/Services/` afin de séparer la logique pure des contrôleurs.

Services couverts :

- `RankingCalculator.php`;
- `MatchResultRules.php`;
- `StatisticRules.php`;
- `TournamentRules.php`;
- `JoinRequestRules.php`;
- `OwnershipRules.php`.

Les tests unitaires associés vérifient ces règles sans appeler les routes API, sans utiliser la base de données, sans utiliser `RefreshDatabase` et sans générer de token JWT.

Fichiers de tests unitaires :

- `RankingCalculatorTest.php`;
- `MatchResultRulesTest.php`;
- `StatisticRulesTest.php`;
- `TournamentRulesTest.php`;
- `JoinRequestRulesTest.php`;
- `OwnershipRulesTest.php`.

## Bugs détectés et corrigés

### 1. Liste des demandes de participation reçues

Problème détecté :

La liste des demandes de participation reçues utilisait une logique basée sur le rôle `creator`. Or les créateurs de tournois du projet utilisent principalement le rôle `user`.

Impact :

Un utilisateur ayant créé un tournoi pouvait accepter ou refuser une demande, mais ne pouvait pas correctement lister les demandes reçues.

Correction :

La logique a été corrigée pour utiliser la propriété réelle du tournoi :

```text
tournaments.created_by = current_user.id
```

Le test de régression confirme que la liste fonctionne par propriété du tournoi, et non par rôle.

### 2. Sécurité et validation des statistiques

Problème détecté :

La création et la modification des statistiques n'étaient pas suffisamment restreintes. Un utilisateur pouvait créer ou modifier une statistique pour un match d'un tournoi qu'il ne gère pas.

Problème complémentaire :

Le contexte métier n'était pas assez strict : une statistique pouvait être créée sans contexte match/équipe/joueur suffisamment cohérent.

Impact :

Risque d'incohérence des données et de modification non autorisée des statistiques de match.

Correction :

Les règles suivantes ont été ajoutées :

- seul le créateur du tournoi ou un administrateur peut créer, modifier ou supprimer une statistique;
- `match_game_id` est obligatoire;
- `team_id` est obligatoire;
- `player_id` est obligatoire pour les statistiques joueur comme `goal`, `assist`, `yellow_card` et `red_card`;
- `clean_sheet` reste une statistique d'équipe et peut être créée sans `player_id`;
- le joueur doit appartenir à l'équipe sélectionnée;
- l'équipe doit faire partie du match.

Les tests de sécurité et de régression confirment que ces règles restent appliquées.

## Observations importantes

Les tests Feature/API utilisent de vrais tokens JWT Bearer obtenus via la route `/api/login`. Cela valide le comportement réel de l'authentification et évite de contourner le mécanisme JWT.

Les tests Feature/API utilisent `RefreshDatabase`, ce qui permet de garder chaque scénario indépendant et reproductible.

Les tests unitaires des services métier restent isolés : ils n'appellent pas les routes API, n'utilisent pas la base de données et n'utilisent pas de JWT.

Les tests présentés dans ce document couvrent le backend Laravel. Les tests end-to-end frontend sont documentés séparément dans docs/e2e-testing.md.

## Commande utilisée

Exécution complète de la suite backend :

```bash
docker compose exec backend php artisan test
```

Exécution des tests unitaires :

```bash
docker compose exec backend php artisan test --testsuite=Unit
```

Exécution ciblée pendant le développement :

```bash
docker compose exec backend php artisan test --filter=NomDuTest
```

## Conclusion

La suite de tests backend valide les fonctionnalités critiques de l'application de gestion de tournois : authentification, autorisations, gestion des tournois, équipes, joueurs, demandes de participation, matchs, résultats, classements et statistiques.

Les tests ont également permis d'identifier et de corriger deux bugs réels liés aux autorisations et à la cohérence des données.

Avec 162 tests passés et 834 assertions, le backend dispose maintenant d'une base de tests solide pour réduire les régressions et soutenir la qualité du projet lors de la soutenance et des évolutions futures.
