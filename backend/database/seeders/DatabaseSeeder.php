<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Composition;
use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Post;
use App\Models\Ranking;
use App\Models\Season;
use App\Models\Statistic;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $organizer = User::create([
            'name' => 'Organizer Test',
            'email' => 'organizer@test.com',
            'password' => Hash::make('password'),
            'role' => 'organizer',
            'payment_status' => 'paid',
            'subscription_plan' => 'organizer',
        ]);

        $manager = User::create([
            'name' => 'Manager Test',
            'email' => 'manager@test.com',
            'password' => Hash::make('password'),
            'role' => 'team_manager',
        ]);

        User::create([
            'name' => 'Viewer Test',
            'email' => 'viewer@test.com',
            'password' => Hash::make('password'),
            'role' => 'viewer',
        ]);

        $season = Season::create([
            'name' => 'Saison 2026',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'active',
        ]);

        $championship = Championship::create([
            'season_id' => $season->id,
            'created_by' => $admin->id,
            'name' => 'Botola Demo',
            'description' => 'Official national championship demo',
            'level' => 'national',
            'source' => 'official',
            'city' => 'Casablanca',
            'country' => 'Morocco',
            'status' => 'active',
        ]);

        $tournament = Tournament::create([
            'season_id' => $season->id,
            'created_by' => $organizer->id,
            'name' => 'Taourirt Local Cup',
            'description' => 'Local tournament demo',
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-30',
            'level' => 'local',
            'source' => 'user_created',
            'city' => 'Taourirt',
            'country' => 'Morocco',
            'status' => 'active',
        ]);

        $teamOne = Team::create([
            'manager_id' => $manager->id,
            'name' => 'Atlas FC',
            'city' => 'Taourirt',
            'country' => 'Morocco',
        ]);

        $teamTwo = Team::create([
            'manager_id' => $organizer->id,
            'name' => 'Rif United',
            'city' => 'Taourirt',
            'country' => 'Morocco',
        ]);

        $championship->teams()->syncWithoutDetaching([$teamOne->id, $teamTwo->id]);
        $tournament->teams()->syncWithoutDetaching([$teamOne->id, $teamTwo->id]);

        $teamOnePlayers = [];
        $teamTwoPlayers = [];

        for ($i = 1; $i <= 5; $i++) {
            $teamOnePlayers[] = Player::create([
                'team_id' => $teamOne->id,
                'first_name' => 'Atlas',
                'last_name' => 'Player '.$i,
                'position' => $i === 1 ? 'Goalkeeper' : 'Midfielder',
                'number' => $i,
            ]);

            $teamTwoPlayers[] = Player::create([
                'team_id' => $teamTwo->id,
                'first_name' => 'Rif',
                'last_name' => 'Player '.$i,
                'position' => $i === 1 ? 'Goalkeeper' : 'Forward',
                'number' => $i,
            ]);
        }

        $confirmedMatch = MatchGame::create([
            'championship_id' => $championship->id,
            'created_by' => $organizer->id,
            'home_team_id' => $teamOne->id,
            'away_team_id' => $teamTwo->id,
            'match_date' => '2026-04-15 18:00:00',
            'home_score' => 2,
            'away_score' => 1,
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);

        MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $organizer->id,
            'home_team_id' => $teamTwo->id,
            'away_team_id' => $teamOne->id,
            'match_date' => '2026-04-20 18:00:00',
            'status' => 'scheduled',
            'result_status' => 'pending',
        ]);

        foreach (array_slice($teamOnePlayers, 0, 3) as $player) {
            Composition::create([
                'match_game_id' => $confirmedMatch->id,
                'team_id' => $teamOne->id,
                'player_id' => $player->id,
                'role' => 'starter',
            ]);
        }

        foreach (array_slice($teamTwoPlayers, 0, 3) as $player) {
            Composition::create([
                'match_game_id' => $confirmedMatch->id,
                'team_id' => $teamTwo->id,
                'player_id' => $player->id,
                'role' => 'starter',
            ]);
        }

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $teamOne->id,
            'stat_type' => 'goal',
            'value' => 2,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $teamTwo->id,
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'player_id' => $teamOnePlayers[1]->id,
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        Ranking::create([
            'championship_id' => $championship->id,
            'team_id' => $teamOne->id,
            'played' => 1,
            'wins' => 1,
            'draws' => 0,
            'losses' => 0,
            'goals_for' => 2,
            'goals_against' => 1,
            'goal_difference' => 1,
            'points' => 3,
        ]);

        Ranking::create([
            'championship_id' => $championship->id,
            'team_id' => $teamTwo->id,
            'played' => 1,
            'wins' => 0,
            'draws' => 0,
            'losses' => 1,
            'goals_for' => 1,
            'goals_against' => 2,
            'goal_difference' => -1,
            'points' => 0,
        ]);

        Post::create([
            'user_id' => $admin->id,
            'content' => 'Official platform news for the demo season.',
            'type' => 'news',
            'scope' => 'official',
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        Post::create([
            'user_id' => $organizer->id,
            'tournament_id' => $tournament->id,
            'content' => 'Registrations are open for Taourirt Local Cup.',
            'type' => 'announcement',
            'scope' => 'local',
            'status' => 'pending',
        ]);

        Post::create([
            'user_id' => $organizer->id,
            'tournament_id' => $tournament->id,
            'content' => 'Taourirt Local Cup schedule is now available.',
            'type' => 'announcement',
            'scope' => 'local',
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        JoinRequest::create([
            'tournament_id' => $tournament->id,
            'team_id' => $teamOne->id,
            'manager_id' => $manager->id,
            'status' => 'pending',
            'message' => 'Atlas FC would like to join Taourirt Local Cup.',
        ]);
    }
}
