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

class MoroccanTournamentsSeeder extends Seeder
{
    use SeedsLeagueFixtures;
    use SeedsRealisticMatchStatistics;
    private const PLAYER_PHOTO_BASE = 'https://images.fotmob.com/image_resources/playerimages/';

    /** @var array<int, string> */
    private array $playerPhotos = [];

    /** @var array<int, array{first: string, last: string}> */
    private array $namePool = [
        ['first' => 'Youssef', 'last' => 'Alami'],
        ['first' => 'Mehdi', 'last' => 'Bennani'],
        ['first' => 'Amine', 'last' => 'Chakir'],
        ['first' => 'Omar', 'last' => 'El Fassi'],
        ['first' => 'Karim', 'last' => 'Idrissi'],
        ['first' => 'Hassan', 'last' => 'Lamrani'],
        ['first' => 'Reda', 'last' => 'Ouazzani'],
        ['first' => 'Adil', 'last' => 'Tazi'],
        ['first' => 'Rachid', 'last' => 'Zerouali'],
        ['first' => 'Hamza', 'last' => 'Amrani'],
        ['first' => 'Khalid', 'last' => 'Bouazza'],
        ['first' => 'Nabil', 'last' => 'Cherkaoui'],
        ['first' => 'Saad', 'last' => 'Dahbi'],
        ['first' => 'Tarik', 'last' => 'El Amrani'],
        ['first' => 'Walid', 'last' => 'Fathi'],
        ['first' => 'Anas', 'last' => 'Ghazi'],
        ['first' => 'Ismail', 'last' => 'Haddad'],
        ['first' => 'Mounir', 'last' => 'Jabri'],
        ['first' => 'Said', 'last' => 'Kabbaj'],
        ['first' => 'Aziz', 'last' => 'Lahlou'],
        ['first' => 'Bilal', 'last' => 'Mansouri'],
        ['first' => 'Driss', 'last' => 'Naciri'],
        ['first' => 'Fouad', 'last' => 'Qadiri'],
        ['first' => 'Hicham', 'last' => 'Rahmani'],
        ['first' => 'Jamal', 'last' => 'Saadi'],
        ['first' => 'Lotfi', 'last' => 'Toumi'],
        ['first' => 'Majid', 'last' => 'Yousfi'],
        ['first' => 'Noureddine', 'last' => 'Zahiri'],
        ['first' => 'Othmane', 'last' => 'Benkirane'],
        ['first' => 'Yassine', 'last' => 'Filali'],
        ['first' => 'Zakaria', 'last' => 'Hafidi'],
        ['first' => 'Ayoub', 'last' => 'Kadiri'],
    ];

    private int $nameIndex = 0;

    private int $photoIndex = 0;

    public function run(): void
    {
        $this->playerPhotos = $this->collectPlayerPhotos();

        $creator = User::where('email', 'user@example.com')->firstOrFail();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $teamData = require __DIR__.'/moroccan_teams_data.php';

        $this->seedTournament(
            $creator,
            $admin,
            $teamData['hightech'],
            [
                'name' => 'HIGHTECH-Tournois',
                'description' => 'Championnat regional tech & sport — saison 2025 sur 6 mois.',
                'city' => 'Kenitra',
                'location' => 'Complexe HIGHTECH Arena',
                'banner_path' => '/hightech_tournois_banner.png',
                'format' => 'league',
                'start_date' => '2025-03-01',
                'end_date' => '2025-08-31',
                'status' => 'active',
                'completion_ratio' => 0.72,
                'matches_per_week' => 3,
            ],
        );

        $this->seedTournament(
            $creator,
            $admin,
            $teamData['d10'],
            [
                'name' => 'D10-champs',
                'description' => 'Coupe D10 — championnat sur 5 mois.',
                'city' => 'Rabat',
                'location' => 'Stade D10 National',
                'banner_path' => 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
                'format' => 'league',
                'start_date' => '2025-09-01',
                'end_date' => '2026-01-31',
                'status' => 'completed',
                'completion_ratio' => 1.0,
                'matches_per_week' => 5,
            ],
        );

        $this->seedTournament(
            $creator,
            $admin,
            $teamData['ramadan'],
            [
                'name' => 'Ramadan 2026 Casa',
                'description' => 'Tournoi de quartiers casablancais — saison sur 6 mois.',
                'city' => 'Casablanca',
                'location' => 'Terrains municipaux Casa',
                'banner_path' => 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
                'format' => 'league',
                'start_date' => '2025-11-15',
                'end_date' => '2026-05-15',
                'status' => 'active',
                'completion_ratio' => 0.58,
                'matches_per_week' => 6,
            ],
        );
    }

    /**
     * @param array<string, mixed> $meta
     * @param array<string, mixed> $bundle
     */
    private function seedTournament(User $creator, User $admin, array $bundle, array $meta): void
    {
        $tournament = Tournament::create([
            'created_by' => $creator->id,
            'name' => $meta['name'],
            'description' => $meta['description'],
            'city' => $meta['city'],
            'location' => $meta['location'],
                'banner_path' => $meta['banner_path'] ?? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
            'format' => $meta['format'],
            'start_date' => $meta['start_date'],
            'end_date' => $meta['end_date'],
            'status' => $meta['status'],
            'approval_status' => 'accepted',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        [$teams, $playersByTeam] = $this->createTeamsAndPlayers($creator, $bundle);
        $teamIds = collect($teams)->pluck('id')->all();
        $tournament->teams()->sync($teamIds);

        foreach ($teams as $team) {
            JoinRequest::create([
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
                'manager_id' => $creator->id,
                'status' => 'accepted',
                'message' => "{$team->name} participe a {$tournament->name}.",
            ]);
        }

        $rankingStats = $this->emptyRankingStats($teams);
        $rajaTeam = $this->findRajaTeam($teams);
        $dcheiraTeam = $this->findDcheiraTeam($teams);
        $gameweeks = $this->buildRoundRobinGameweeks(count($teams));
        $totalGameweeks = count($gameweeks);
        $startDate = Carbon::parse($meta['start_date']);
        $endDate = Carbon::parse($meta['end_date']);
        $isCompleted = ($meta['status'] ?? '') === 'completed';
        $completionRatio = $isCompleted ? 1.0 : (float) ($meta['completion_ratio'] ?? 1.0);
        $gameweeksToPlay = max(1, (int) floor(count($gameweeks) * $completionRatio));

        foreach ($gameweeks as $gwIndex => $weekFixtures) {
            $isPlayedWeek = $gwIndex < $gameweeksToPlay;

            foreach ($weekFixtures as $slot => [$homeIndex, $awayIndex]) {
                $home = $teams[$homeIndex];
                $away = $teams[$awayIndex];

                if ($isPlayedWeek) {
                    [$homeScore, $awayScore] = $this->generateMatchScores($home, $away, $rajaTeam, $dcheiraTeam);
                    $this->createPlayedMatch(
                        $tournament,
                        $creator,
                        $home,
                        $away,
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
                } else {
                    $this->createScheduledMatch(
                        $tournament,
                        $creator,
                        $home,
                        $away,
                        $gwIndex,
                        $slot,
                        $startDate,
                        $endDate,
                        $totalGameweeks,
                    );
                }
            }
        }

        $this->storeRankings($tournament, $rankingStats);
    }

    /**
     * @param array<string, mixed> $bundle
     * @return array{0: array<int, Team>, 1: array<int, array<int, Player>>}
     */
    private function createTeamsAndPlayers(User $manager, array $bundle): array
    {
        $folder = (int) $bundle['folder'];
        $playerCount = (int) $bundle['player_count'];
        $positions = ['GK', 'CB', 'LB', 'RB', 'CM', 'CAM', 'LW', 'ST'];
        $teams = [];
        $playersByTeam = [];

        foreach ($bundle['teams'] as $entry) {
            $team = Team::create([
                'manager_id' => $manager->id,
                'name' => $entry['name'],
                'short_name' => $entry['short_name'],
                'logo_path' => "/teams/{$folder}/{$entry['logo']}",
                'city' => $entry['city'],
            ]);

            $teams[] = $team;
            $playersByTeam[$team->id] = [];

            for ($i = 0; $i < $playerCount; $i++) {
                $name = $this->nextName();
                $photo = $this->nextPhoto($i);

                $playersByTeam[$team->id][] = Player::create([
                    'team_id' => $team->id,
                    'first_name' => $name['first'],
                    'last_name' => $name['last'],
                    'birth_date' => $this->randomBirthDate(),
                    'position' => $positions[$i] ?? 'MID',
                    'number' => $i + 1,
                    'photo_path' => $photo,
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

    private function createScheduledMatch(
        Tournament $tournament,
        User $creator,
        Team $home,
        Team $away,
        int $gameweekIndex,
        int $slotInWeek,
        Carbon $startDate,
        Carbon $endDate,
        int $totalGameweeks,
    ): MatchGame {
        return MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $creator->id,
            'home_team_id' => $home->id,
            'away_team_id' => $away->id,
            'match_date' => $this->gameweekMatchDate($startDate, $endDate, $gameweekIndex, $slotInWeek, $totalGameweeks),
            'home_score' => null,
            'away_score' => null,
            'status' => 'scheduled',
            'result_status' => 'pending',
        ]);
    }

    /**
     * @return array{first: string, last: string}
     */
    private function nextName(): array
    {
        $name = $this->namePool[$this->nameIndex % count($this->namePool)];
        $this->nameIndex++;

        return $name;
    }

    private function nextPhoto(int $playerIndex): ?string
    {
        if ($this->playerPhotos === []) {
            return null;
        }

        if ($playerIndex % 5 === 4) {
            return null;
        }

        $photoId = $this->playerPhotos[$this->photoIndex % count($this->playerPhotos)];
        $this->photoIndex++;

        return self::PLAYER_PHOTO_BASE.$photoId.'.png';
    }

    private function randomBirthDate(): string
    {
        $year = random_int(1994, 2006);
        $month = random_int(1, 12);
        $day = random_int(1, 28);

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    /**
     * @return array<int, string>
     */
    private function collectPlayerPhotos(): array
    {
        $photos = [];
        $squads = require __DIR__.'/botola_squads.php';

        foreach ($squads as $entry) {
            foreach ($entry['players'] as $player) {
                if (! empty($player['photo_path']) && preg_match('/playerimages\/(\d+)\.png/', $player['photo_path'], $matches)) {
                    $photos[] = $matches[1];
                }
            }
        }

        return array_values(array_unique($photos));
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

}
