<?php

namespace Database\Seeders;

use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Ranking;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Database\Seeders\Concerns\SeedsLeagueFixtures;
use Database\Seeders\Concerns\SeedsRealisticMatchStatistics;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use SeedsLeagueFixtures;
    use SeedsRealisticMatchStatistics;
    /**
     * Local demo data.
     *
     * Logins:
     * - Admin: admin@example.com / password
     * - User:  user@example.com / password
     * - User2: creator2@example.com / password
     *
     * After migrate:fresh, expected tournament IDs include:
     * - #1 Tournoi Ligue 16 Équipes (creator2): /rankings?tournament_id=1
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

        $creator2 = User::create([
            'name' => 'Createur Tournois 2',
            'email' => 'creator2@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'account_status' => 'active',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'avatar_url' => 'https://ui-avatars.com/api/?name=Createur+Demo&background=059669&color=fff',
        ]);

        $league = Tournament::create([
            'created_by' => $creator2->id,
            'name' => 'Tournoi Ligue 16 Équipes',
            'description' => 'Demo locale: tournoi format ligue sur 7 mois pour tester les classements, matchs et statistiques.',
            'city' => 'Rabat',
            'location' => 'Stade Municipal Demo',
            'banner_path' => 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
            'format' => 'league',
            'start_date' => '2026-02-01',
            'end_date' => '2026-08-31',
            'status' => 'active',
            'approval_status' => 'accepted',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        [$teams, $playersByTeam] = $this->createTeamsAndPlayers($creator);

        $teamIds = collect($teams)->pluck('id')->all();
        $league->teams()->sync($teamIds);

        foreach ($teams as $team) {
            JoinRequest::create([
                'tournament_id' => $league->id,
                'team_id' => $team->id,
                'manager_id' => $creator->id,
                'status' => 'accepted',
                'message' => "{$team->name} accepte de participer a {$league->name}.",
            ]);
        }

        $leagueRankings = $this->emptyRankingStats($teams);
        $this->seedLeagueMatches($league, $teams, $playersByTeam, $creator, $leagueRankings);
        $this->storeRankings($league, $leagueRankings);

        $this->call(MoroccanTournamentsSeeder::class);
    }

    /**
     * @return array{0: array<int, Team>, 1: array<int, array<int, Player>>}
     */
    private function createTeamsAndPlayers(User $manager): array
    {
        $teams = [];
        $playersByTeam = [];

        foreach ($this->botolaSquads() as $entry) {
            $team = Team::create([
                'manager_id' => $manager->id,
                'name' => $entry['name'],
                'short_name' => $entry['short_name'],
                'logo_path' => $entry['logo_path'],
                'city' => $entry['city'],
            ]);

            $teams[] = $team;
            $playersByTeam[$team->id] = [];

            foreach ($entry['players'] as $playerData) {
                $playersByTeam[$team->id][] = Player::create([
                    'team_id' => $team->id,
                    'first_name' => $playerData['first_name'],
                    'last_name' => $playerData['last_name'],
                    'birth_date' => $playerData['birth_date'],
                    'position' => $playerData['position'],
                    'number' => $playerData['number'],
                    'photo_path' => $playerData['photo_path'],
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
    private function seedLeagueMatches(
        Tournament $tournament,
        array $teams,
        array $playersByTeam,
        User $creator,
        array &$rankingStats
    ): void {
        $rajaTeam = $this->findRajaTeam($teams);
        $dcheiraTeam = $this->findDcheiraTeam($teams);
        $gameweeks = $this->buildRoundRobinGameweeks(count($teams));
        $totalGameweeks = count($gameweeks);
        $startDate = Carbon::parse($tournament->start_date);
        $endDate = Carbon::parse($tournament->end_date);
        $gameweeksToPlay = max(1, (int) floor(count($gameweeks) * 0.45));

        foreach ($gameweeks as $gwIndex => $weekFixtures) {
            if ($gwIndex >= $gameweeksToPlay) {
                break;
            }

            foreach ($weekFixtures as $slot => [$homeIndex, $awayIndex]) {
                [$homeScore, $awayScore] = $this->generateMatchScores(
                    $teams[$homeIndex],
                    $teams[$awayIndex],
                    $rajaTeam,
                    $dcheiraTeam,
                );

                $this->createPlayedMatch(
                    $tournament,
                    $creator,
                    $teams[$homeIndex],
                    $teams[$awayIndex],
                    $homeScore,
                    $awayScore,
                    $playersByTeam,
                    $rankingStats,
                    $gwIndex,
                    $slot,
                    $startDate,
                    $endDate,
                    $totalGameweeks,
                );
            }
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
        array $playersByTeam,
        array &$rankingStats,
        int $gameweekIndex,
        int $slotInWeek,
        Carbon $startDate,
        Carbon $endDate,
        int $totalGameweeks,
    ): MatchGame {
        $match = MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $creator->id,
            'home_team_id' => $home->id,
            'away_team_id' => $away->id,
            'match_date' => $this->gameweekMatchDate($startDate, $endDate, $gameweekIndex, $slotInWeek, $totalGameweeks),
            'home_score' => $homeScore,
            'away_score' => $awayScore,
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);

        $this->recordRankingResult($rankingStats, $home->id, $away->id, $homeScore, $awayScore);
        $this->createStatistics($match, $home, $away, $homeScore, $awayScore, $playersByTeam);
        $this->createCompositions($match, $home, $away, $playersByTeam);

        return $match;
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
     * @return array<int, array<string, mixed>>
     */
    private function botolaSquads(): array
    {
        return require __DIR__.'/botola_squads.php';
    }
}
