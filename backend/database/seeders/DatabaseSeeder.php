<?php

namespace Database\Seeders;

use App\Models\Composition;
use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Ranking;
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
            'name' => 'Admin Principal',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $organizer = User::create([
            'name' => 'Organisateur Local',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $manager = User::create([
            'name' => 'Manager Atlas',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $ramadanTournament = Tournament::create([
            'created_by' => $organizer->id,
            'name' => 'Tournoi Ramadan Local',
            'description' => 'Tournoi local de football organisé à Rabat pendant le mois de Ramadan.',
            'city' => 'Rabat',
            'location' => 'Terrain Municipal de Rabat',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-15',
            'status' => 'open',
            'approval_status' => 'accepted',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        Tournament::create([
            'created_by' => $manager->id,
            'name' => 'Coupe Quartier Jeunesse',
            'description' => 'Demande de tournoi de quartier en attente de validation.',
            'city' => 'Salé',
            'location' => 'Stade de Proximité Salé',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-10',
            'status' => 'draft',
            'approval_status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
            'admin_note' => null,
        ]);

        Tournament::create([
            'created_by' => $manager->id,
            'name' => 'Tournoi Sans Dossier',
            'description' => 'Demande refusée pour dossier incomplet.',
            'city' => 'Témara',
            'location' => 'Terrain Local Témara',
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-08',
            'status' => 'draft',
            'approval_status' => 'refused',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_note' => 'Dossier incomplet',
        ]);

        $atlas = Team::create([
            'manager_id' => $organizer->id,
            'name' => 'Atlas FC',
            'city' => 'Rabat',
        ]);

        $najm = Team::create([
            'manager_id' => $organizer->id,
            'name' => 'Najm FC',
            'city' => 'Rabat',
        ]);

        $amal = Team::create([
            'manager_id' => $manager->id,
            'name' => 'Amal Salé',
            'city' => 'Salé',
        ]);

        $lions = Team::create([
            'manager_id' => $manager->id,
            'name' => 'Lions Témara',
            'city' => 'Témara',
        ]);

        $players = [
            'atlasYassine' => Player::create([
                'team_id' => $atlas->id,
                'first_name' => 'Yassine',
                'last_name' => 'El Amrani',
                'position' => 'ST',
                'number' => 9,
            ]),
            'atlasOmar' => Player::create([
                'team_id' => $atlas->id,
                'first_name' => 'Omar',
                'last_name' => 'Benali',
                'position' => 'CM',
                'number' => 8,
            ]),
            'atlasHamza' => Player::create([
                'team_id' => $atlas->id,
                'first_name' => 'Hamza',
                'last_name' => 'Idrissi',
                'position' => 'CB',
                'number' => 4,
            ]),
            'atlasAnas' => Player::create([
                'team_id' => $atlas->id,
                'first_name' => 'Anas',
                'last_name' => 'Rahimi',
                'position' => 'GK',
                'number' => 1,
            ]),
            'najmMehdi' => Player::create([
                'team_id' => $najm->id,
                'first_name' => 'Mehdi',
                'last_name' => 'Alaoui',
                'position' => 'ST',
                'number' => 10,
            ]),
            'najmBilal' => Player::create([
                'team_id' => $najm->id,
                'first_name' => 'Bilal',
                'last_name' => 'Karimi',
                'position' => 'LW',
                'number' => 11,
            ]),
            'najmSoufiane' => Player::create([
                'team_id' => $najm->id,
                'first_name' => 'Soufiane',
                'last_name' => 'Naciri',
                'position' => 'CB',
                'number' => 5,
            ]),
            'najmKarim' => Player::create([
                'team_id' => $najm->id,
                'first_name' => 'Karim',
                'last_name' => 'Essafi',
                'position' => 'GK',
                'number' => 1,
            ]),
            'amalAyoub' => Player::create([
                'team_id' => $amal->id,
                'first_name' => 'Ayoub',
                'last_name' => 'Mansouri',
                'position' => 'ST',
                'number' => 7,
            ]),
            'amalReda' => Player::create([
                'team_id' => $amal->id,
                'first_name' => 'Reda',
                'last_name' => 'Fathi',
                'position' => 'CM',
                'number' => 6,
            ]),
            'amalZakaria' => Player::create([
                'team_id' => $amal->id,
                'first_name' => 'Zakaria',
                'last_name' => 'Rami',
                'position' => 'CB',
                'number' => 3,
            ]),
            'amalNabil' => Player::create([
                'team_id' => $amal->id,
                'first_name' => 'Nabil',
                'last_name' => 'Chafi',
                'position' => 'GK',
                'number' => 1,
            ]),
            'lionsAdam' => Player::create([
                'team_id' => $lions->id,
                'first_name' => 'Adam',
                'last_name' => 'Berrada',
                'position' => 'ST',
                'number' => 9,
            ]),
            'lionsIlyas' => Player::create([
                'team_id' => $lions->id,
                'first_name' => 'Ilyas',
                'last_name' => 'Hakimi',
                'position' => 'RW',
                'number' => 17,
            ]),
            'lionsSamir' => Player::create([
                'team_id' => $lions->id,
                'first_name' => 'Samir',
                'last_name' => 'El Kadi',
                'position' => 'CB',
                'number' => 4,
            ]),
            'lionsTaha' => Player::create([
                'team_id' => $lions->id,
                'first_name' => 'Taha',
                'last_name' => 'Mouline',
                'position' => 'GK',
                'number' => 1,
            ]),
        ];

        $ramadanTournament->teams()->syncWithoutDetaching([$atlas->id, $najm->id]);

        JoinRequest::create([
            'tournament_id' => $ramadanTournament->id,
            'team_id' => $atlas->id,
            'manager_id' => $organizer->id,
            'status' => 'accepted',
            'message' => 'Atlas FC souhaite participer au Tournoi Ramadan Local.',
        ]);

        JoinRequest::create([
            'tournament_id' => $ramadanTournament->id,
            'team_id' => $najm->id,
            'manager_id' => $organizer->id,
            'status' => 'accepted',
            'message' => 'Najm FC souhaite participer au Tournoi Ramadan Local.',
        ]);

        JoinRequest::create([
            'tournament_id' => $ramadanTournament->id,
            'team_id' => $amal->id,
            'manager_id' => $manager->id,
            'status' => 'pending',
            'message' => 'Amal Salé demande à rejoindre le tournoi.',
        ]);

        JoinRequest::create([
            'tournament_id' => $ramadanTournament->id,
            'team_id' => $lions->id,
            'manager_id' => $manager->id,
            'status' => 'refused',
            'message' => 'Lions Témara demande à rejoindre le tournoi.',
        ]);

        $confirmedMatch = MatchGame::create([
            'tournament_id' => $ramadanTournament->id,
            'created_by' => $organizer->id,
            'home_team_id' => $atlas->id,
            'away_team_id' => $najm->id,
            'match_date' => '2026-07-03 18:00:00',
            'home_score' => 2,
            'away_score' => 1,
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);

        MatchGame::create([
            'tournament_id' => $ramadanTournament->id,
            'created_by' => $organizer->id,
            'home_team_id' => $najm->id,
            'away_team_id' => $atlas->id,
            'match_date' => '2026-07-08 18:00:00',
            'home_score' => null,
            'away_score' => null,
            'status' => 'scheduled',
            'result_status' => 'pending',
        ]);

        Ranking::create([
            'tournament_id' => $ramadanTournament->id,
            'team_id' => $atlas->id,
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
            'tournament_id' => $ramadanTournament->id,
            'team_id' => $najm->id,
            'played' => 1,
            'wins' => 0,
            'draws' => 0,
            'losses' => 1,
            'goals_for' => 1,
            'goals_against' => 2,
            'goal_difference' => -1,
            'points' => 0,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $atlas->id,
            'player_id' => $players['atlasYassine']->id,
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $atlas->id,
            'player_id' => $players['atlasOmar']->id,
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $najm->id,
            'player_id' => $players['najmMehdi']->id,
            'stat_type' => 'assist',
            'value' => 1,
        ]);

        Statistic::create([
            'match_game_id' => $confirmedMatch->id,
            'team_id' => $atlas->id,
            'player_id' => $players['atlasHamza']->id,
            'stat_type' => 'yellow_card',
            'value' => 1,
        ]);

        foreach ([
            [$atlas->id, $players['atlasYassine']->id, 'starter'],
            [$atlas->id, $players['atlasOmar']->id, 'starter'],
            [$atlas->id, $players['atlasHamza']->id, 'starter'],
            [$atlas->id, $players['atlasAnas']->id, 'substitute'],
            [$najm->id, $players['najmMehdi']->id, 'starter'],
            [$najm->id, $players['najmBilal']->id, 'starter'],
            [$najm->id, $players['najmSoufiane']->id, 'starter'],
            [$najm->id, $players['najmKarim']->id, 'substitute'],
        ] as [$teamId, $playerId, $role]) {
            Composition::create([
                'match_game_id' => $confirmedMatch->id,
                'team_id' => $teamId,
                'player_id' => $playerId,
                'role' => $role,
            ]);
        }
    }
}
