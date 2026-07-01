<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\Ranking;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class FullTournamentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_complete_tournament_flow_from_creation_to_ranking_and_statistics(): void
    {
        $creator = $this->createUser([
            'email' => 'creator@example.com',
        ]);
        $admin = $this->createAdmin([
            'email' => 'admin@example.com',
        ]);
        $firstManager = $this->createUser([
            'email' => 'manager-one@example.com',
        ]);
        $secondManager = $this->createUser([
            'email' => 'manager-two@example.com',
        ]);

        $tournamentResponse = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/tournaments', $this->tournamentPayload([
                'name' => 'Full Flow Cup',
            ]));

        $tournamentResponse
            ->assertCreated()
            ->assertJsonPath('name', 'Full Flow Cup')
            ->assertJsonPath('created_by', $creator->id)
            ->assertJsonPath('approval_status', 'pending')
            ->assertJsonPath('status', 'draft');

        $tournamentId = $tournamentResponse->json('id');

        $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$tournamentId}/accept")
            ->assertOk()
            ->assertJsonPath('approval_status', 'accepted')
            ->assertJsonPath('status', 'open')
            ->assertJsonPath('approved_by', $admin->id);

        $tournament = Tournament::findOrFail($tournamentId);

        [$firstTeam, $firstPlayer] = $this->createTeamAndPlayerThroughApi(
            $this->authHeaders($firstManager),
            'Atlas Flow FC',
            'Atlas',
            'Forward',
            9
        );

        $firstJoinRequestId = $this->sendJoinRequestThroughApi($this->authHeaders($firstManager), $tournament, $firstTeam);

        $joinRequestsResponse = $this
            ->withHeaders($this->authHeaders($creator))
            ->getJson('/api/join-requests');

        $joinRequestsResponse->assertOk();
        $this->assertContains($firstJoinRequestId, $this->idsFrom($joinRequestsResponse->json()));

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$firstJoinRequestId}/accept")
            ->assertOk()
            ->assertJsonPath('status', 'accepted');

        $this->assertDatabaseHas('tournament_team', [
            'tournament_id' => $tournament->id,
            'team_id' => $firstTeam->id,
        ]);

        [$secondTeam] = $this->createTeamAndPlayerThroughApi(
            $this->authHeaders($secondManager),
            'Rabat Flow FC',
            'Rabat',
            'Midfielder',
            8
        );

        $secondJoinRequestId = $this->sendJoinRequestThroughApi($this->authHeaders($secondManager), $tournament, $secondTeam);

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$secondJoinRequestId}/accept")
            ->assertOk()
            ->assertJsonPath('status', 'accepted');

        $matchResponse = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', [
                'tournament_id' => $tournament->id,
                'home_team_id' => $firstTeam->id,
                'away_team_id' => $secondTeam->id,
                'match_date' => '2026-09-01 18:30:00',
            ]);

        $matchResponse
            ->assertCreated()
            ->assertJsonPath('tournament_id', $tournament->id)
            ->assertJsonPath('home_team_id', $firstTeam->id)
            ->assertJsonPath('away_team_id', $secondTeam->id)
            ->assertJsonPath('status', 'scheduled')
            ->assertJsonPath('result_status', 'pending');

        $matchId = $matchResponse->json('id');

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$matchId}/result", [
                'home_score' => 2,
                'away_score' => 1,
            ])
            ->assertOk()
            ->assertJsonPath('home_score', 2)
            ->assertJsonPath('away_score', 1)
            ->assertJsonPath('status', 'played')
            ->assertJsonPath('result_status', 'pending');

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$matchId}/confirm-result")
            ->assertOk()
            ->assertJsonPath('result_status', 'confirmed');

        $rankingResponse = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/rankings/recalculate', [
                'tournament_id' => $tournament->id,
            ]);

        $rankingResponse->assertOk();

        $winnerRanking = Ranking::where('tournament_id', $tournament->id)
            ->where('team_id', $firstTeam->id)
            ->firstOrFail();
        $loserRanking = Ranking::where('tournament_id', $tournament->id)
            ->where('team_id', $secondTeam->id)
            ->firstOrFail();

        $this->assertSame(3, $winnerRanking->points);
        $this->assertSame(0, $loserRanking->points);
        $this->assertSame(2, $winnerRanking->goals_for);
        $this->assertSame(1, $winnerRanking->goals_against);

        $statisticResponse = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', [
                'match_game_id' => $matchId,
                'team_id' => $firstTeam->id,
                'player_id' => $firstPlayer->id,
                'stat_type' => 'goal',
                'value' => 1,
            ]);

        $statisticResponse
            ->assertCreated()
            ->assertJsonPath('match_game_id', $matchId)
            ->assertJsonPath('team_id', $firstTeam->id)
            ->assertJsonPath('player_id', $firstPlayer->id)
            ->assertJsonPath('stat_type', 'goal')
            ->assertJsonPath('value', 1);

        $statisticsResponse = $this->getJson("/api/statistics?match_game_id={$matchId}");

        $statisticsResponse->assertOk();
        $this->assertContains($statisticResponse->json('id'), $this->idsFrom($statisticsResponse->json()));
    }

    public function test_public_visitor_can_see_accepted_tournament_after_admin_approval(): void
    {
        $creator = $this->createUser();
        $admin = $this->createAdmin();

        $tournamentId = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/tournaments', $this->tournamentPayload([
                'name' => 'Public Approved Cup',
            ]))
            ->assertCreated()
            ->json('id');

        $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$tournamentId}/accept")
            ->assertOk()
            ->assertJsonPath('approval_status', 'accepted')
            ->assertJsonPath('status', 'open');

        $response = $this->getJson('/api/tournaments');

        $response->assertOk();

        $tournamentIds = $this->idsFrom($response->json());

        $this->assertContains($tournamentId, $tournamentIds);
    }

    public function test_public_visitor_can_see_ranking_after_result_recalculation(): void
    {
        $creator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $homeTeam = $this->createTeam($this->createUser(), [
            'name' => 'Ranking Winner FC',
            'short_name' => 'RWF',
        ]);
        $awayTeam = $this->createTeam($this->createUser(), [
            'name' => 'Ranking Loser FC',
            'short_name' => 'RLF',
        ]);

        $this->attachTeamToTournament($tournament, $homeTeam);
        $this->attachTeamToTournament($tournament, $awayTeam);
        $this->createConfirmedMatch($tournament, $creator, $homeTeam, $awayTeam, 2, 1);

        $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/rankings/recalculate', [
                'tournament_id' => $tournament->id,
            ])
            ->assertOk();

        $response = $this->getJson("/api/rankings?tournament_id={$tournament->id}");

        $response
            ->assertOk()
            ->assertJsonPath('0.team_id', $homeTeam->id)
            ->assertJsonPath('0.points', 3)
            ->assertJsonPath('1.team_id', $awayTeam->id)
            ->assertJsonPath('1.points', 0);
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

    private function createAdmin(array $overrides = []): User
    {
        return User::factory()->create([
            ...[
                'role' => 'admin',
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

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function tournamentPayload(array $overrides = []): array
    {
        return [
            ...[
                'name' => 'Demo Tournament',
                'description' => 'A competitive tournament for local teams.',
                'city' => 'Casablanca',
                'location' => 'Main Stadium',
                'format' => 'league',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-15',
            ],
            ...$overrides,
        ];
    }

    /**
     * @return array{0: Team, 1: Player}
     */
    private function createTeamAndPlayerThroughApi(
        array $managerHeaders,
        string $teamName,
        string $playerFirstName,
        string $position,
        int $number
    ): array {
        $teamResponse = $this
            ->withHeaders($managerHeaders)
            ->postJson('/api/teams', [
                'name' => $teamName,
                'short_name' => strtoupper(substr(str_replace(' ', '', $teamName), 0, 3)),
                'city' => 'Casablanca',
            ]);

        $teamResponse
            ->assertCreated()
            ->assertJsonPath('name', $teamName);

        $team = Team::findOrFail($teamResponse->json('id'));

        $playerResponse = $this
            ->withHeaders($managerHeaders)
            ->postJson('/api/players', [
                'team_id' => $team->id,
                'first_name' => $playerFirstName,
                'last_name' => 'Player',
                'birth_date' => '2000-01-15',
                'position' => $position,
                'number' => $number,
            ]);

        $playerResponse
            ->assertCreated()
            ->assertJsonPath('team_id', $team->id)
            ->assertJsonPath('first_name', $playerFirstName);

        return [$team, Player::findOrFail($playerResponse->json('id'))];
    }

    private function sendJoinRequestThroughApi(array $managerHeaders, Tournament $tournament, Team $team): int
    {
        $response = $this
            ->withHeaders($managerHeaders)
            ->postJson('/api/join-requests', [
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
                'message' => "{$team->name} wants to join {$tournament->name}.",
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('tournament_id', $tournament->id)
            ->assertJsonPath('team_id', $team->id)
            ->assertJsonPath('status', 'pending');

        return (int) $response->json('id');
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

    private function createConfirmedMatch(
        Tournament $tournament,
        User $creator,
        Team $homeTeam,
        Team $awayTeam,
        int $homeScore,
        int $awayScore
    ): void {
        \App\Models\MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => $creator->id,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $awayTeam->id,
            'match_date' => '2026-09-01 18:30:00',
            'home_score' => $homeScore,
            'away_score' => $awayScore,
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);
    }

    /**
     * @param array<int, array<string, mixed>> $items
     *
     * @return array<int, int>
     */
    private function idsFrom(array $items): array
    {
        return array_column($items, 'id');
    }
}
