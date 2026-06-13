<?php

namespace Database\Seeders;

use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
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
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $tournament = Tournament::create([
            'created_by' => $user->id,
            'name' => 'Demo Local Tournament',
            'description' => 'Accepted demo tournament for local testing.',
            'city' => 'Casablanca',
            'location' => 'Local Stadium',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-15',
            'status' => 'open',
            'approval_status' => 'accepted',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        $team = Team::create([
            'manager_id' => $user->id,
            'name' => 'Demo Team',
            'city' => 'Casablanca',
        ]);

        $demoGoalkeeper = Player::create([
            'team_id' => $team->id,
            'first_name' => 'Omar',
            'last_name' => 'Benali',
            'position' => 'GK',
            'number' => 1,
        ]);

        $demoMidfielder = Player::create([
            'team_id' => $team->id,
            'first_name' => 'Karim',
            'last_name' => 'El Mansouri',
            'position' => 'MF',
            'number' => 8,
        ]);

        $secondTeam = Team::create([
            'manager_id' => $user->id,
            'name' => 'Lions FC',
            'city' => 'Taourirt',
        ]);

        $lionsPlayer = Player::create([
            'team_id' => $secondTeam->id,
            'first_name' => 'Youssef',
            'last_name' => 'Amrani',
            'position' => 'ST',
            'number' => 9,
        ]);

        JoinRequest::create([
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
            'manager_id' => $user->id,
            'status' => 'accepted',
            'message' => 'Demo Team would like to join this tournament.',
        ]);

        JoinRequest::create([
            'tournament_id' => $tournament->id,
            'team_id' => $secondTeam->id,
            'manager_id' => $user->id,
            'status' => 'accepted',
            'message' => 'Lions FC would like to join this tournament.',
        ]);

        $tournament->teams()->syncWithoutDetaching([$team->id, $secondTeam->id]);

        $confirmedMatch = MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $user->id,
            'home_team_id' => $team->id,
            'away_team_id' => $secondTeam->id,
            'match_date' => '2026-07-01 18:00:00',
            'home_score' => 2,
            'away_score' => 1,
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);

        MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $user->id,
            'home_team_id' => $team->id,
            'away_team_id' => $secondTeam->id,
            'match_date' => '2026-07-02 18:00:00',
            'home_score' => 1,
            'away_score' => 1,
            'status' => 'played',
            'result_status' => 'disputed',
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $team->id,
            'player_id' => $demoGoalkeeper->id,
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $team->id,
            'player_id' => $demoMidfielder->id,
            'stat_type' => 'assist',
            'value' => 1,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $secondTeam->id,
            'player_id' => $lionsPlayer->id,
            'stat_type' => 'yellow_card',
            'value' => 1,
        ]);
    }
}
