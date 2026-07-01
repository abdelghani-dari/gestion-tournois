# Diagramme de Classes — Gestion Tournois Locaux

## 1. Objectif

Ce document présente les principales classes du système **Gestion Tournois Locaux** ainsi que leurs relations.

La conception est simplifiée : pas de championnats, pas de compétitions officielles et pas de paiement simulé.

## 2. Classes principales

- User
- Tournament
- Team
- Player
- MatchGame
- Composition
- Ranking
- Statistic
- JoinRequest
- TournamentTeam

## 3. Diagramme de classes

```mermaid
classDiagram

    class User {
        +bigint id
        +string name
        +string email
        +string password
        +string role
        +timestamp created_at
        +timestamp updated_at
    }

    class Tournament {
        +bigint id
        +bigint created_by
        +string name
        +text description
        +string city
        +string location
        +string banner_path
        +string format
        +date start_date
        +date end_date
        +string status
        +string approval_status
        +text admin_note
        +bigint approved_by
        +timestamp approved_at
        +timestamp created_at
        +timestamp updated_at
    }

    class Team {
        +bigint id
        +bigint manager_id
        +string name
        +string logo_path
        +string city
        +timestamp created_at
        +timestamp updated_at
    }

    class Player {
        +bigint id
        +bigint team_id
        +string first_name
        +string last_name
        +date birth_date
        +string position
        +int number
        +string photo_path
        +timestamp created_at
        +timestamp updated_at
    }

    class TournamentTeam {
        +bigint id
        +bigint tournament_id
        +bigint team_id
        +timestamp created_at
        +timestamp updated_at
    }

    class JoinRequest {
        +bigint id
        +bigint tournament_id
        +bigint team_id
        +bigint manager_id
        +string status
        +text message
        +timestamp created_at
        +timestamp updated_at
    }

    class MatchGame {
        +bigint id
        +bigint tournament_id
        +bigint created_by
        +bigint home_team_id
        +bigint away_team_id
        +datetime match_date
        +int home_score
        +int away_score
        +string status
        +string result_status
        +timestamp created_at
        +timestamp updated_at
    }

    class Composition {
        +bigint id
        +bigint match_game_id
        +bigint team_id
        +bigint player_id
        +string role
        +timestamp created_at
        +timestamp updated_at
    }

    class Ranking {
        +bigint id
        +bigint tournament_id
        +bigint team_id
        +int played
        +int wins
        +int draws
        +int losses
        +int goals_for
        +int goals_against
        +int goal_difference
        +int points
        +timestamp created_at
        +timestamp updated_at
    }

    class Statistic {
        +bigint id
        +bigint match_game_id
        +bigint team_id
        +bigint player_id
        +string stat_type
        +int value
        +timestamp created_at
        +timestamp updated_at
    }

    User "1" --> "0..*" Tournament : creates
    User "0..1" --> "0..*" Tournament : approves
    User "1" --> "0..*" Team : manages
    User "1" --> "0..*" JoinRequest : sends
    User "0..1" --> "0..*" MatchGame : creates

    Tournament "1" --> "0..*" TournamentTeam : includes
    Team "1" --> "0..*" TournamentTeam : participates

    Team "1" --> "0..*" Player : has

    Tournament "1" --> "0..*" JoinRequest : receives
    Team "1" --> "0..*" JoinRequest : makes

    Tournament "1" --> "0..*" MatchGame : contains
    Team "1" --> "0..*" MatchGame : home_team
    Team "1" --> "0..*" MatchGame : away_team

    MatchGame "1" --> "0..*" Composition : has
    Team "1" --> "0..*" Composition : uses
    Player "1" --> "0..*" Composition : selected_in

    Tournament "1" --> "0..*" Ranking : has
    Team "1" --> "0..*" Ranking : ranked_in

    MatchGame "0..1" --> "0..*" Statistic : has
    Team "0..1" --> "0..*" Statistic : owns
    Player "0..1" --> "0..*" Statistic : records
```

## 4. Remarques de conception

- `User.role` contient seulement `admin` ou `user`.
- `Tournament.created_by` permet de savoir quel utilisateur a créé le tournoi.
- `Tournament.approved_by` est optionnel : il reste vide tant que le tournoi est en attente.
- `Tournament.approval_status` permet à l'admin d'accepter ou refuser un tournoi.
- `Tournament.status` représente l'état sportif du tournoi : `draft`, `open`, `active`, `finished` ou `cancelled`.
- `Tournament.format` est fixé à `league` (championnat local avec classement).
- `JoinRequest` permet à une équipe de demander la participation à un tournoi.
- `TournamentTeam` est la table pivot qui contient uniquement les équipes acceptées dans un tournoi.
- `MatchGame.home_team_id` et `MatchGame.away_team_id` représentent deux relations différentes vers `Team`.
- `Composition` appartient à un match, une équipe et un joueur.
- `Statistic` appartient directement à `MatchGame`, `Team` et `Player`.
- Il n'y a pas de relation directe entre `Composition` et `Statistic`.
- `Ranking` dépend de `tournament_id` et `team_id`.

## 5. Contraintes importantes à respecter

```txt
home_team_id != away_team_id
home_team_id et away_team_id doivent exister dans tournament_team pour le tournoi concerné
player_id dans Composition doit appartenir à team_id
tournament_team doit être unique par tournament_id + team_id
rankings doit être unique par tournament_id + team_id
join_requests doit éviter les doublons par tournament_id + team_id
```
