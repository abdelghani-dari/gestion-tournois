<?php

namespace Tests\Feature;

use App\Models\MatchGame;
use App\Models\Ranking;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class RankingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_recalculation_creates_ranking_rows_for_participating_teams(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Atlas FC',
            'Berkane FC',
            'Chabab FC',
        ]);

        $response = $this->recalculateRanking($creator, $tournament);

        $response->assertOk();
        $this->assertCount(3, $response->json());
        $this->assertSame(3, Ranking::where('tournament_id', $tournament->id)->count());

        foreach ($teams as $team) {
            $this->assertDatabaseHas('rankings', [
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
                'played' => 0,
                'points' => 0,
            ]);
        }
    }

    public function test_win_gives_three_points_and_loss_gives_zero_points(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Winner FC',
            'Loser FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 2, 0);

        $this->recalculateRanking($creator, $tournament)->assertOk();

        $winnerRanking = $this->rankingFor($tournament, $teams[0]);
        $loserRanking = $this->rankingFor($tournament, $teams[1]);

        $this->assertSame(3, $winnerRanking->points);
        $this->assertSame(1, $winnerRanking->wins);
        $this->assertSame(0, $winnerRanking->losses);
        $this->assertSame(0, $loserRanking->points);
        $this->assertSame(0, $loserRanking->wins);
        $this->assertSame(1, $loserRanking->losses);
    }

    public function test_draw_gives_one_point_to_each_team(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Draw Home FC',
            'Draw Away FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 1, 1);

        $this->recalculateRanking($creator, $tournament)->assertOk();

        $homeRanking = $this->rankingFor($tournament, $teams[0]);
        $awayRanking = $this->rankingFor($tournament, $teams[1]);

        $this->assertSame(1, $homeRanking->points);
        $this->assertSame(1, $homeRanking->draws);
        $this->assertSame(1, $awayRanking->points);
        $this->assertSame(1, $awayRanking->draws);
    }

    public function test_goals_for_goals_against_and_goal_difference_are_calculated(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Attack FC',
            'Defense FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 4, 2);

        $this->recalculateRanking($creator, $tournament)->assertOk();

        $homeRanking = $this->rankingFor($tournament, $teams[0]);
        $awayRanking = $this->rankingFor($tournament, $teams[1]);

        $this->assertSame(4, $homeRanking->goals_for);
        $this->assertSame(2, $homeRanking->goals_against);
        $this->assertSame(2, $homeRanking->goal_difference);
        $this->assertSame(2, $awayRanking->goals_for);
        $this->assertSame(4, $awayRanking->goals_against);
        $this->assertSame(-2, $awayRanking->goal_difference);
    }

    public function test_pending_results_are_ignored(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Confirmed Winner FC',
            'Pending Winner FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 1, 0);
        $this->createPendingMatch($tournament, $creator, $teams[1], $teams[0], 8, 0);

        $this->recalculateRanking($creator, $tournament)->assertOk();

        $confirmedWinner = $this->rankingFor($tournament, $teams[0]);
        $pendingWinner = $this->rankingFor($tournament, $teams[1]);

        $this->assertSame(3, $confirmedWinner->points);
        $this->assertSame(1, $confirmedWinner->goals_for);
        $this->assertSame(0, $confirmedWinner->goals_against);
        $this->assertSame(0, $pendingWinner->points);
        $this->assertSame(0, $pendingWinner->wins);
    }

    public function test_disputed_results_are_ignored(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Confirmed FC',
            'Disputed FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 2, 1);
        $this->createDisputedMatch($tournament, $creator, $teams[1], $teams[0], 7, 0);

        $this->recalculateRanking($creator, $tournament)->assertOk();

        $confirmedTeam = $this->rankingFor($tournament, $teams[0]);
        $disputedTeam = $this->rankingFor($tournament, $teams[1]);

        $this->assertSame(3, $confirmedTeam->points);
        $this->assertSame(2, $confirmedTeam->goals_for);
        $this->assertSame(1, $confirmedTeam->goals_against);
        $this->assertSame(0, $disputedTeam->points);
        $this->assertSame(1, $disputedTeam->goals_for);
        $this->assertSame(2, $disputedTeam->goals_against);
    }

    public function test_ranking_is_sorted_by_points_desc(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Top Points FC',
            'No Points FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 1, 0);

        $response = $this->recalculateRanking($creator, $tournament);

        $response->assertOk();
        $this->assertSame($teams[0]->id, $response->json('0.team_id'));
        $this->assertSame(3, $response->json('0.points'));
    }

    public function test_ranking_is_sorted_by_goal_difference_when_points_are_equal(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'High Difference FC',
            'Low Difference FC',
            'Shared Opponent FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[2], 3, 0);
        $this->createConfirmedMatch($tournament, $creator, $teams[1], $teams[2], 1, 0);

        $response = $this->recalculateRanking($creator, $tournament);

        $response->assertOk();
        $this->assertSame($teams[0]->id, $response->json('0.team_id'));
        $this->assertSame($teams[1]->id, $response->json('1.team_id'));
        $this->assertSame(3, $response->json('0.goal_difference'));
        $this->assertSame(1, $response->json('1.goal_difference'));
    }

    public function test_ranking_is_sorted_by_goals_for_when_goal_difference_is_equal(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'More Goals FC',
            'Fewer Goals FC',
            'First Opponent FC',
            'Second Opponent FC',
        ]);

        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[2], 3, 1);
        $this->createConfirmedMatch($tournament, $creator, $teams[1], $teams[3], 2, 0);

        $response = $this->recalculateRanking($creator, $tournament);

        $response->assertOk();
        $this->assertSame($teams[0]->id, $response->json('0.team_id'));
        $this->assertSame($teams[1]->id, $response->json('1.team_id'));
        $this->assertSame(2, $response->json('0.goal_difference'));
        $this->assertSame(2, $response->json('1.goal_difference'));
        $this->assertSame(3, $response->json('0.goals_for'));
        $this->assertSame(2, $response->json('1.goals_for'));
    }

    public function test_recalculation_updates_existing_rows_instead_of_creating_duplicates(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Existing One FC',
            'Existing Two FC',
        ]);
        Ranking::create([
            'tournament_id' => $tournament->id,
            'team_id' => $teams[0]->id,
            'points' => 99,
        ]);
        Ranking::create([
            'tournament_id' => $tournament->id,
            'team_id' => $teams[1]->id,
            'points' => 99,
        ]);
        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 1, 0);

        $this->recalculateRanking($creator, $tournament)->assertOk();
        $this->recalculateRanking($creator, $tournament)->assertOk();

        $rankings = Ranking::where('tournament_id', $tournament->id)->get();

        $this->assertCount(2, $rankings);
        $this->assertSame(
            [$teams[0]->id, $teams[1]->id],
            $rankings->pluck('team_id')->sort()->values()->all()
        );
        $this->assertSame(1, Ranking::where('tournament_id', $tournament->id)
            ->where('team_id', $teams[0]->id)
            ->count());
        $this->assertSame(3, $this->rankingFor($tournament, $teams[0])->points);
    }

    public function test_user_can_get_rankings_for_tournament(): void
    {
        [$creator, $tournament, $teams] = $this->createTournamentWithTeams([
            'Public Ranking FC',
            'Public Opponent FC',
        ]);
        $this->createConfirmedMatch($tournament, $creator, $teams[0], $teams[1], 2, 0);
        $this->recalculateRanking($creator, $tournament)->assertOk();

        $response = $this->getJson("/api/rankings?tournament_id={$tournament->id}");

        $response
            ->assertOk()
            ->assertJsonPath('0.team_id', $teams[0]->id)
            ->assertJsonPath('0.points', 3)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'tournament_id',
                    'team_id',
                    'played',
                    'wins',
                    'draws',
                    'losses',
                    'goals_for',
                    'goals_against',
                    'goal_difference',
                    'points',
                    'team',
                ],
            ]);
    }

    public function test_missing_tournament_id_is_rejected(): void
    {
        $response = $this->getJson('/api/rankings');

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'tournament_id',
            ]);
    }

    private function createUser(array $overrides = []): User
    {
        return User::factory()->create([
            ...[
                'role' => 'user',
                'account_status' => 'active',
            ],
            ...$overrides,
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function authHeaders(User $user): array
    {
        return [
            'Authorization' => 'Bearer '.$this->loginTokenFor($user),
        ];
    }

    private function loginTokenFor(User $user): string
    {
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk();

        return $response->json('token');
    }

    private function recalculateRanking(User $user, Tournament $tournament): TestResponse
    {
        return $this
            ->withHeaders($this->authHeaders($user))
            ->postJson('/api/rankings/recalculate', [
                'tournament_id' => $tournament->id,
            ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createAcceptedTournament(User $creator, array $overrides = []): Tournament
    {
        return Tournament::create([
            ...[
                'created_by' => $creator->id,
                'name' => 'Demo Tournament',
                'description' => 'A competitive tournament for local teams.',
                'city' => 'Casablanca',
                'location' => 'Main Stadium',
                'format' => 'league',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-15',
                'status' => 'open',
                'approval_status' => 'accepted',
                'admin_note' => null,
                'approved_by' => $creator->id,
                'approved_at' => now(),
            ],
            ...$overrides,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createTeam(User $manager, array $overrides = []): Team
    {
        return Team::create([
            ...[
                'manager_id' => $manager->id,
                'name' => 'Demo Team',
                'short_name' => 'DMT',
                'city' => 'Casablanca',
                'logo_path' => null,
            ],
            ...$overrides,
        ]);
    }

    private function attachTeamToTournament(Tournament $tournament, Team $team): void
    {
        $tournament->teams()->syncWithoutDetaching([$team->id]);
    }

    /**
     * @param array<int, string> $teamNames
     *
     * @return array{0: User, 1: Tournament, 2: array<int, Team>}
     */
    private function createTournamentWithTeams(array $teamNames): array
    {
        $creator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $teams = [];

        foreach ($teamNames as $index => $teamName) {
            $team = $this->createTeam($this->createUser(), [
                'name' => $teamName,
                'short_name' => strtoupper(substr(str_replace(' ', '', $teamName), 0, 3)) ?: 'TM'.($index + 1),
            ]);
            $this->attachTeamToTournament($tournament, $team);
            $teams[] = $team;
        }

        return [$creator, $tournament, $teams];
    }

    private function createConfirmedMatch(
        Tournament $tournament,
        User $creator,
        Team $homeTeam,
        Team $awayTeam,
        int $homeScore,
        int $awayScore
    ): MatchGame {
        return $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, $homeScore, $awayScore, [
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);
    }

    private function createPendingMatch(
        Tournament $tournament,
        User $creator,
        Team $homeTeam,
        Team $awayTeam,
        int $homeScore,
        int $awayScore
    ): MatchGame {
        return $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, $homeScore, $awayScore, [
            'status' => 'played',
            'result_status' => 'pending',
        ]);
    }

    private function createDisputedMatch(
        Tournament $tournament,
        User $creator,
        Team $homeTeam,
        Team $awayTeam,
        int $homeScore,
        int $awayScore
    ): MatchGame {
        return $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, $homeScore, $awayScore, [
            'status' => 'played',
            'result_status' => 'disputed',
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createMatch(
        Tournament $tournament,
        User $creator,
        Team $homeTeam,
        Team $awayTeam,
        int $homeScore,
        int $awayScore,
        array $overrides = []
    ): MatchGame {
        return MatchGame::create([
            ...[
                'tournament_id' => $tournament->id,
                'created_by' => $creator->id,
                'home_team_id' => $homeTeam->id,
                'away_team_id' => $awayTeam->id,
                'match_date' => '2026-09-01 18:30:00',
                'home_score' => $homeScore,
                'away_score' => $awayScore,
                'status' => 'played',
                'result_status' => 'confirmed',
            ],
            ...$overrides,
        ]);
    }

    private function rankingFor(Tournament $tournament, Team $team): Ranking
    {
        return Ranking::where('tournament_id', $tournament->id)
            ->where('team_id', $team->id)
            ->firstOrFail();
    }
}
