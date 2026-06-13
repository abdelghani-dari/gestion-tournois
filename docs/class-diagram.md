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

    User "1" --> "*" Tournament : created_by
    User "1" --> "*" Team : manager_id
    User "1" --> "*" JoinRequest : manager_id
    User "1" --> "*" MatchGame : created_by

    Tournament "1" --> "*" TournamentTeam
    Team "1" --> "*" TournamentTeam

    Team "1" --> "*" Player

    Tournament "1" --> "*" JoinRequest
    Team "1" --> "*" JoinRequest

    Tournament "1" --> "*" MatchGame
    Team "1" --> "*" MatchGame : home_team
    Team "1" --> "*" MatchGame : away_team

    MatchGame "1" --> "*" Composition
    Team "1" --> "*" Composition
    Player "1" --> "*" Composition

    Tournament "1" --> "*" Ranking
    Team "1" --> "*" Ranking

    MatchGame "1" --> "*" Statistic
    Team "1" --> "*" Statistic
    Player "1" --> "*" Statistic
```

## 4. Remarques de conception

- `User.role` contient seulement `admin` ou `user`.
- `Tournament.created_by` permet de savoir qui est responsable du tournoi.
- `Tournament.approval_status` permet à l'admin d'accepter ou refuser un tournoi.
- `Tournament.status` représente l'état sportif du tournoi.
- `JoinRequest` permet à une équipe de demander la participation.
- `TournamentTeam` contient uniquement les équipes acceptées.
- `MatchGame.result_status` permet de gérer la validation des résultats.
- `Ranking` dépend uniquement de `tournament_id`.
