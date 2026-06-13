<?php

namespace Database\Seeders;

use App\Models\JoinRequest;
use App\Models\Player;
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

        Player::create([
            'team_id' => $team->id,
            'first_name' => 'Omar',
            'last_name' => 'Benali',
            'position' => 'GK',
            'number' => 1,
        ]);

        Player::create([
            'team_id' => $team->id,
            'first_name' => 'Karim',
            'last_name' => 'El Mansouri',
            'position' => 'MF',
            'number' => 8,
        ]);

        JoinRequest::create([
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
            'manager_id' => $user->id,
            'status' => 'pending',
            'message' => 'Demo Team would like to join this tournament.',
        ]);
    }
}
