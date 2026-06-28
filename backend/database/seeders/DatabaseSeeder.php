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
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Local demo data.
     *
     * Logins:
     * - Admin: admin@example.com / password
     * - User:  user@example.com / password
     *
     * After migrate:fresh, expected tournament IDs are:
     * - #1 Tournoi Knockout 16 Équipes: /tournaments/1/bracket and /rankings?tournament_id=1
     * - #2 Tournoi Ligue 16 Équipes: /rankings?tournament_id=2
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Demo',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'account_status' => 'active',
            'approved_at' => now(),
            'avatar_url' => 'https://ui-avatars.com/api/?name=Admin+Demo&background=2563eb&color=fff',
        ]);

        $creator = User::create([
            'name' => 'Createur Demo',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'account_status' => 'active',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'avatar_url' => 'https://ui-avatars.com/api/?name=Createur+Demo&background=059669&color=fff',
        ]);

        $knockout = Tournament::create([
            'created_by' => $creator->id,
            'name' => 'Tournoi Knockout 16 Équipes',
            'description' => 'Demo locale: bracket complet a elimination directe avec 16 equipes, resultats confirmes et champion.',
            'city' => 'Casablanca',
            'location' => 'Complexe Sportif Demo',
            'banner_path' => 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
            'format' => 'knockout',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-20',
            'status' => 'active',
            'approval_status' => 'accepted',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        $league = Tournament::create([
            'created_by' => $creator->id,
            'name' => 'Tournoi Ligue 16 Équipes',
            'description' => 'Demo locale: tournoi format ligue pour tester les classements, matchs et statistiques.',
            'city' => 'Rabat',
            'location' => 'Stade Municipal Demo',
            'banner_path' => 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
            'format' => 'league',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-30',
            'status' => 'active',
            'approval_status' => 'accepted',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        [$teams, $playersByTeam] = $this->createTeamsAndPlayers($creator);

        $teamIds = collect($teams)->pluck('id')->all();
        $knockout->teams()->sync($teamIds);
        $league->teams()->sync($teamIds);

        foreach ([$knockout, $league] as $tournament) {
            foreach ($teams as $team) {
                JoinRequest::create([
                    'tournament_id' => $tournament->id,
                    'team_id' => $team->id,
                    'manager_id' => $creator->id,
                    'status' => 'accepted',
                    'message' => "{$team->name} accepte de participer a {$tournament->name}.",
                ]);
            }
        }

        $knockoutRankings = $this->emptyRankingStats($teams);
        $leagueRankings = $this->emptyRankingStats($teams);

        $this->seedKnockoutBracket($knockout, $teams, $playersByTeam, $creator, $knockoutRankings);
        $this->seedLeagueMatches($league, $teams, $playersByTeam, $creator, $leagueRankings);

        $this->storeRankings($knockout, $knockoutRankings);
        $this->storeRankings($league, $leagueRankings);
    }

    /**
     * @return array{0: array<int, Team>, 1: array<int, array<int, Player>>}
     */
    private function createTeamsAndPlayers(User $manager): array
    {
        $cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Meknes', 'Oujda'];
        $firstNames = [
            'Yassine', 'Omar', 'Hamza', 'Anas', 'Mehdi', 'Bilal', 'Soufiane', 'Karim',
            'Ayoub', 'Reda', 'Zakaria', 'Nabil', 'Adam', 'Ilyas', 'Samir', 'Taha',
        ];
        $lastNames = [
            'El Amrani', 'Benali', 'Idrissi', 'Rahimi', 'Alaoui', 'Karimi', 'Naciri', 'Essafi',
            'Mansouri', 'Fathi', 'Rami', 'Chafi', 'Berrada', 'Hakimi', 'El Kadi', 'Mouline',
        ];
        $positions = [
            ['GK', 1],
            ['DF', 4],
            ['MF', 8],
            ['FW', 10],
            ['ST', 9],
        ];

        $teams = [];
        $playersByTeam = [];

        for ($i = 1; $i <= 16; $i++) {
            $team = Team::create([
                'manager_id' => $manager->id,
                'name' => sprintf('Team %02d FC', $i),
                'short_name' => sprintf('T%02d', $i),
                'logo_path' => sprintf('https://ui-avatars.com/api/?name=T%02d&background=%s&color=fff', $i, $this->teamColor($i)),
                'city' => $cities[($i - 1) % count($cities)],
            ]);

            $teams[] = $team;
            $playersByTeam[$team->id] = [];

            foreach ($positions as $slot => [$position, $number]) {
                $firstName = $firstNames[($i + $slot - 1) % count($firstNames)];
                $lastName = $lastNames[(($i * 2) + $slot - 2) % count($lastNames)];

                $playersByTeam[$team->id][] = Player::create([
                    'team_id' => $team->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'birth_date' => Carbon::create(1998 + (($i + $slot) % 8), (($slot + 3) % 12) + 1, (($i + $slot) % 24) + 1)->toDateString(),
                    'position' => $position,
                    'number' => $number + ($slot === 0 ? 0 : $i % 3),
                    'photo_path' => 'https://ui-avatars.com/api/?name='.urlencode("{$firstName} {$lastName}").'&background=111827&color=fff',
                ]);
            }
        }

        return [$teams, $playersByTeam];
    }

    /**
     * @param array<int, Team> $teams
     * @param array<int, array<int, Player>> $playersByTeam
     * @param array<int, array<string, int>> $rankingStats
     */
    private function seedKnockoutBracket(
        Tournament $tournament,
        array $teams,
        array $playersByTeam,
        User $creator,
        array &$rankingStats
    ): void {
        $roundOf16Pairs = [
            [0, 15, 3, 0],
            [7, 8, 2, 1],
            [3, 12, 1, 0],
            [4, 11, 2, 0],
            [1, 14, 4, 1],
            [6, 9, 2, 0],
            [2, 13, 3, 2],
            [5, 10, 1, 0],
        ];

        $roundOf16 = [];
        foreach ($roundOf16Pairs as $position => [$homeIndex, $awayIndex, $homeScore, $awayScore]) {
            $roundOf16[] = $this->createPlayedMatch(
                $tournament,
                $creator,
                $teams[$homeIndex],
                $teams[$awayIndex],
                $homeScore,
                $awayScore,
                1,
                $position + 1,
                $playersByTeam,
                $rankingStats
            );
        }

        $quarterFinalScores = [[2, 0], [1, 2], [3, 1], [2, 0]];
        $quarterFinals = [];
        for ($i = 0; $i < 4; $i++) {
            $home = $this->winnerTeam($roundOf16[$i * 2], $teams);
            $away = $this->winnerTeam($roundOf16[($i * 2) + 1], $teams);
            [$homeScore, $awayScore] = $quarterFinalScores[$i];

            $quarterFinals[] = $this->createPlayedMatch(
                $tournament,
                $creator,
                $home,
                $away,
                $homeScore,
                $awayScore,
                2,
                $i + 1,
                $playersByTeam,
                $rankingStats
            );
        }

        $semiFinalScores = [[2, 1], [1, 2]];
        $semiFinals = [];
        for ($i = 0; $i < 2; $i++) {
            $home = $this->winnerTeam($quarterFinals[$i * 2], $teams);
            $away = $this->winnerTeam($quarterFinals[($i * 2) + 1], $teams);
            [$homeScore, $awayScore] = $semiFinalScores[$i];

            $semiFinals[] = $this->createPlayedMatch(
                $tournament,
                $creator,
                $home,
                $away,
                $homeScore,
                $awayScore,
                3,
                $i + 1,
                $playersByTeam,
                $rankingStats
            );
        }

        $final = $this->createPlayedMatch(
            $tournament,
            $creator,
            $this->winnerTeam($semiFinals[0], $teams),
            $this->winnerTeam($semiFinals[1], $teams),
            3,
            2,
            4,
            1,
            $playersByTeam,
            $rankingStats
        );

        $this->connectRound($roundOf16, $quarterFinals);
        $this->connectRound($quarterFinals, $semiFinals);
        $this->connectRound($semiFinals, [$final]);
    }

    /**
     * @param array<int, Team> $teams
     * @param array<int, array<int, Player>> $playersByTeam
     * @param array<int, array<string, int>> $rankingStats
     */
    private function seedLeagueMatches(
        Tournament $tournament,
        array $teams,
        array $playersByTeam,
        User $creator,
        array &$rankingStats
    ): void {
        $fixtures = [
            [0, 1, 2, 2], [2, 3, 3, 1], [4, 5, 1, 0], [6, 7, 2, 1],
            [8, 9, 0, 0], [10, 11, 1, 2], [12, 13, 4, 2], [14, 15, 1, 3],
            [0, 2, 2, 1], [1, 3, 0, 2], [4, 6, 3, 3], [5, 7, 2, 0],
            [8, 10, 1, 0], [9, 11, 2, 2], [12, 14, 1, 1], [13, 15, 2, 4],
        ];

        foreach ($fixtures as $position => [$homeIndex, $awayIndex, $homeScore, $awayScore]) {
            $this->createPlayedMatch(
                $tournament,
                $creator,
                $teams[$homeIndex],
                $teams[$awayIndex],
                $homeScore,
                $awayScore,
                null,
                null,
                $playersByTeam,
                $rankingStats,
                $position
            );
        }
    }

    /**
     * @param array<int, array<int, Player>> $playersByTeam
     * @param array<int, array<string, int>> $rankingStats
     */
    private function createPlayedMatch(
        Tournament $tournament,
        User $creator,
        Team $home,
        Team $away,
        int $homeScore,
        int $awayScore,
        ?int $roundNumber,
        ?int $bracketPosition,
        array $playersByTeam,
        array &$rankingStats,
        int $positionOffset = 0
    ): MatchGame {
        $winnerTeamId = null;
        if ($roundNumber !== null) {
            $winnerTeamId = $homeScore > $awayScore ? $home->id : $away->id;
        }

        $match = MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $creator->id,
            'home_team_id' => $home->id,
            'away_team_id' => $away->id,
            'match_date' => $this->matchDate($tournament, $roundNumber, $bracketPosition, $positionOffset),
            'home_score' => $homeScore,
            'away_score' => $awayScore,
            'status' => 'played',
            'result_status' => 'confirmed',
            'round_number' => $roundNumber,
            'bracket_position' => $bracketPosition,
            'winner_team_id' => $winnerTeamId,
            'bracket_status' => $roundNumber === null ? null : 'completed',
        ]);

        $this->recordRankingResult($rankingStats, $home->id, $away->id, $homeScore, $awayScore);
        $this->createStatistics($match, $home, $away, $homeScore, $awayScore, $playersByTeam);
        $this->createCompositions($match, $home, $away, $playersByTeam);

        return $match;
    }

    /**
     * @param array<int, MatchGame> $currentRound
     * @param array<int, MatchGame> $nextRound
     */
    private function connectRound(array $currentRound, array $nextRound): void
    {
        foreach ($currentRound as $index => $match) {
            $match->update([
                'next_match_id' => $nextRound[(int) floor($index / 2)]->id,
                'next_slot' => $index % 2 === 0 ? 'home' : 'away',
            ]);
        }
    }

    /**
     * @param array<int, Team> $teams
     */
    private function winnerTeam(MatchGame $match, array $teams): Team
    {
        $winnerId = $match->winner_team_id;

        foreach ($teams as $team) {
            if ((int) $team->id === (int) $winnerId) {
                return $team;
            }
        }

        throw new \RuntimeException('Winner team not found while seeding bracket.');
    }

    private function matchDate(Tournament $tournament, ?int $roundNumber, ?int $bracketPosition, int $positionOffset): string
    {
        $dayOffset = $roundNumber === null
            ? $positionOffset
            : (($roundNumber - 1) * 3) + (int) floor((($bracketPosition ?? 1) - 1) / 4);

        $hour = 16 + (($bracketPosition ?? $positionOffset) % 4);

        return Carbon::parse($tournament->start_date)
            ->addDays($dayOffset)
            ->setTime($hour, 0)
            ->toDateTimeString();
    }

    /**
     * @param array<int, Team> $teams
     * @return array<int, array<string, int>>
     */
    private function emptyRankingStats(array $teams): array
    {
        $stats = [];

        foreach ($teams as $team) {
            $stats[$team->id] = [
                'played' => 0,
                'wins' => 0,
                'draws' => 0,
                'losses' => 0,
                'goals_for' => 0,
                'goals_against' => 0,
                'goal_difference' => 0,
                'points' => 0,
            ];
        }

        return $stats;
    }

    /**
     * @param array<int, array<string, int>> $stats
     */
    private function recordRankingResult(array &$stats, int $homeTeamId, int $awayTeamId, int $homeScore, int $awayScore): void
    {
        $stats[$homeTeamId]['played']++;
        $stats[$awayTeamId]['played']++;
        $stats[$homeTeamId]['goals_for'] += $homeScore;
        $stats[$homeTeamId]['goals_against'] += $awayScore;
        $stats[$awayTeamId]['goals_for'] += $awayScore;
        $stats[$awayTeamId]['goals_against'] += $homeScore;

        if ($homeScore > $awayScore) {
            $stats[$homeTeamId]['wins']++;
            $stats[$homeTeamId]['points'] += 3;
            $stats[$awayTeamId]['losses']++;
        } elseif ($homeScore < $awayScore) {
            $stats[$awayTeamId]['wins']++;
            $stats[$awayTeamId]['points'] += 3;
            $stats[$homeTeamId]['losses']++;
        } else {
            $stats[$homeTeamId]['draws']++;
            $stats[$awayTeamId]['draws']++;
            $stats[$homeTeamId]['points']++;
            $stats[$awayTeamId]['points']++;
        }

        $stats[$homeTeamId]['goal_difference'] = $stats[$homeTeamId]['goals_for'] - $stats[$homeTeamId]['goals_against'];
        $stats[$awayTeamId]['goal_difference'] = $stats[$awayTeamId]['goals_for'] - $stats[$awayTeamId]['goals_against'];
    }

    /**
     * @param array<int, array<string, int>> $rankingStats
     */
    private function storeRankings(Tournament $tournament, array $rankingStats): void
    {
        foreach ($rankingStats as $teamId => $stats) {
            Ranking::create([
                'tournament_id' => $tournament->id,
                'team_id' => $teamId,
                ...$stats,
            ]);
        }
    }

    /**
     * @param array<int, array<int, Player>> $playersByTeam
     */
    private function createStatistics(
        MatchGame $match,
        Team $home,
        Team $away,
        int $homeScore,
        int $awayScore,
        array $playersByTeam
    ): void {
        $this->stat($match, $home, $playersByTeam[$home->id][4], 'goal', $homeScore);
        $this->stat($match, $away, $playersByTeam[$away->id][4], 'goal', $awayScore);

        if ($homeScore > 0) {
            $this->stat($match, $home, $playersByTeam[$home->id][2], 'assist', max(1, $homeScore - 1));
        }

        if ($awayScore > 0) {
            $this->stat($match, $away, $playersByTeam[$away->id][2], 'assist', max(1, $awayScore - 1));
        }

        $this->stat($match, $home, $playersByTeam[$home->id][1], 'yellow_card', 1);

        if ($awayScore === 0) {
            $this->stat($match, $home, $playersByTeam[$home->id][0], 'clean_sheet', 1);
        }

        if ($homeScore === 0) {
            $this->stat($match, $away, $playersByTeam[$away->id][0], 'clean_sheet', 1);
        }
    }

    private function stat(MatchGame $match, Team $team, Player $player, string $type, int $value): void
    {
        if ($value <= 0) {
            return;
        }

        Statistic::create([
            'match_game_id' => $match->id,
            'team_id' => $team->id,
            'player_id' => $player->id,
            'stat_type' => $type,
            'value' => $value,
        ]);
    }

    /**
     * @param array<int, array<int, Player>> $playersByTeam
     */
    private function createCompositions(MatchGame $match, Team $home, Team $away, array $playersByTeam): void
    {
        foreach ([$home, $away] as $team) {
            foreach ($playersByTeam[$team->id] as $player) {
                Composition::create([
                    'match_game_id' => $match->id,
                    'team_id' => $team->id,
                    'player_id' => $player->id,
                    'role' => 'starter',
                ]);
            }
        }
    }

    private function teamColor(int $index): string
    {
        $colors = [
            '1d4ed8', '0f766e', 'be123c', 'ca8a04',
            '7c3aed', '0369a1', '15803d', 'b91c1c',
            '4338ca', '047857', 'c2410c', 'a21caf',
            '0e7490', '4d7c0f', '9f1239', '334155',
        ];

        return $colors[($index - 1) % count($colors)];
    }
}
