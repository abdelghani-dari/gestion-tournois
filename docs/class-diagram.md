# Diagramme de Classes — Gestion Tournois

## 1. Objectif

Ce document présente les principales classes du système et leurs relations.

## 2. Classes principales

- User
- Season
- Championship
- Tournament
- Team
- Player
- MatchGame
- Composition
- Ranking
- Statistic

## 3. Diagramme de classes

```mermaid
classDiagram

    class User {
        +bigint id
        +string name
        +string email
        +string password
        +string role
    }

    class Season {
        +bigint id
        +string name
        +date start_date
        +date end_date
        +string status
    }

    class Championship {
        +bigint id
        +bigint season_id
        +string name
        +text description
        +string status
    }

    class Tournament {
        +bigint id
        +bigint season_id
        +string name
        +text description
        +date start_date
        +date end_date
        +string status
    }

    class Team {
        +bigint id
        +string name
        +string logo_path
        +string city
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
    }

    class MatchGame {
        +bigint id
        +bigint championship_id
        +bigint tournament_id
        +bigint home_team_id
        +bigint away_team_id
        +datetime match_date
        +int home_score
        +int away_score
        +string status
    }

    class Composition {
        +bigint id
        +bigint match_game_id
        +bigint team_id
        +bigint player_id
        +string role
    }

    class Ranking {
        +bigint id
        +bigint championship_id
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
    }

    class Statistic {
        +bigint id
        +bigint match_game_id
        +bigint team_id
        +bigint player_id
        +string stat_type
        +int value
    }

    Season "1" --> "*" Championship
    Season "1" --> "*" Tournament

    Championship "*" --> "*" Team
    Tournament "*" --> "*" Team

    Team "1" --> "*" Player

    Championship "1" --> "*" MatchGame
    Tournament "1" --> "*" MatchGame

    Team "1" --> "*" MatchGame : home_team
    Team "1" --> "*" MatchGame : away_team

    MatchGame "1" --> "*" Composition
    Team "1" --> "*" Composition
    Player "1" --> "*" Composition

    Championship "1" --> "*" Ranking
    Tournament "1" --> "*" Ranking
    Team "1" --> "*" Ranking

    MatchGame "1" --> "*" Statistic
    Team "1" --> "*" Statistic
    Player "1" --> "*" Statistic
```

## 4. Remarque importante

Le modèle `MatchGame` est utilisé au lieu de `Match`, car `match` est un mot réservé en PHP.