# Résultats des tests backend

## Résumé général

La campagne de tests backend a permis de valider les principaux parcours métier de l'application et de sécuriser les règles d'autorisation critiques.

Résultat global :

- 114 tests passés;
- 719 assertions;
- 0 test en échec après correction;
- exécution dans l'environnement Docker Compose local.

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
| **Total** | **114** | **719** | **Couverture backend professionnelle des parcours métier critiques.** |

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

Les tests utilisent de vrais tokens JWT Bearer obtenus via la route `/api/login`. Cela valide le comportement réel de l'authentification et évite de contourner le mécanisme JWT.

Les tests utilisent `RefreshDatabase`, ce qui permet de garder chaque scénario indépendant et reproductible.

Les tests couvrent le backend Laravel. Aucun test frontend ou test end-to-end navigateur n'a été ajouté dans cette campagne backend.

## Commande utilisée

Exécution complète de la suite backend :

```bash
docker compose exec backend php artisan test
```

Exécution ciblée pendant le développement :

```bash
docker compose exec backend php artisan test --filter=NomDuTest
```

## Conclusion

La suite de tests backend valide les fonctionnalités critiques de l'application de gestion de tournois : authentification, autorisations, gestion des tournois, équipes, joueurs, demandes de participation, matchs, résultats, classements et statistiques.

Les tests ont également permis d'identifier et de corriger deux bugs réels liés aux autorisations et à la cohérence des données.

Avec 114 tests passés et 719 assertions, le backend dispose maintenant d'une base de tests solide pour réduire les régressions et soutenir la qualité du projet lors de la soutenance et des évolutions futures.
