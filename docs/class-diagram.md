# Diagramme de Classes — Gestion Tournois

## 1. Objectif

Ce document présente les principales classes du système Gestion Tournois ainsi que leurs relations.

L'application permet de gérer les compétitions officielles, les compétitions locales, les équipes, les joueurs, les matchs, les compositions, les classements, les statistiques, les demandes de participation, les paiements simulés et les publications.

---

## 2. Classes principales

- User
- FakePayment
- Season
- Championship
- Tournament
- Team
- Player
- MatchGame
- Composition
- Ranking
- Statistic
- JoinRequest
- Post
- ChampionshipTeam
- TournamentTeam

---

## 3. Diagramme de classes

```mermaid
classDiagram

    class User {
        +bigint id
        +string name
        +string email
        +string password
        +string role
        +string payment_status
        +string subscription_plan
        +timestamp created_at
        +timestamp updated_at
    }

    class FakePayment {
        +bigint id
        +bigint user_id
        +string plan
        +decimal amount
        +string status
        +timestamp paid_at
        +timestamp created_at
        +timestamp updated_at
    }

    class Season {
        +bigint id
        +string name
        +date start_date
        +date end_date
        +string status
        +timestamp created_at
        +timestamp updated_at
    }

    class Championship {
        +bigint id
        +bigint season_id
        +bigint created_by
        +string name
        +text description
        +string level
        +string source
        +string city
        +string country
        +string status
        +timestamp created_at
        +timestamp updated_at
    }

    class Tournament {
        +bigint id
        +bigint season_id
        +bigint created_by
        +string name
        +text description
        +string level
        +string source
        +string city
        +string country
        +date start_date
        +date end_date
        +string status
        +timestamp created_at
        +timestamp updated_at
    }

    class Team {
        +bigint id
        +bigint manager_id
        +string name
        +string logo_path
        +string city
        +string country
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

    class MatchGame {
        +bigint id
        +bigint championship_id
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

    class JoinRequest {
        +bigint id
        +bigint championship_id
        +bigint tournament_id
        +bigint team_id
        +bigint manager_id
        +string status
        +text message
        +timestamp created_at
        +timestamp updated_at
    }

    class Post {
        +bigint id
        +bigint user_id
        +bigint championship_id
        +bigint tournament_id
        +text content
        +string image_path
        +string type
        +timestamp created_at
        +timestamp updated_at
    }

    class ChampionshipTeam {
        +bigint id
        +bigint championship_id
        +bigint team_id
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

    User "1" --> "*" FakePayment
    User "1" --> "*" Championship : created_by
    User "1" --> "*" Tournament : created_by
    User "1" --> "*" Team : manager_id
    User "1" --> "*" JoinRequest : manager_id
    User "1" --> "*" Post

    Season "1" --> "*" Championship
    Season "1" --> "*" Tournament

    Championship "1" --> "*" ChampionshipTeam
    Team "1" --> "*" ChampionshipTeam

    Tournament "1" --> "*" TournamentTeam
    Team "1" --> "*" TournamentTeam

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

    Championship "1" --> "*" JoinRequest
    Tournament "1" --> "*" JoinRequest
    Team "1" --> "*" JoinRequest

    Championship "1" --> "*" Post
    Tournament "1" --> "*" Post
```

---

## 4. Remarques de conception

- `User.role` définit les permissions principales : admin, organizer, team_manager, viewer.
- `Championship.level` et `Tournament.level` permettent de distinguer une compétition internationale, nationale ou locale.
- `Championship.source` et `Tournament.source` permettent de distinguer une compétition officielle d'une compétition créée par un utilisateur.
- `MatchGame.result_status` permet de gérer la validation des résultats locaux.
- `JoinRequest` permet à un team manager de demander la participation de son équipe à une compétition locale.
- `FakePayment` simule l'abonnement organizer dans le prototype.
- `Post` représente le feed social football simple.
