<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Ranking;
use App\Models\Statistic;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SecurityRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    // Security tests

    public function test_unauthenticated_user_cannot_access_protected_me_route(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_normal_user_cannot_access_admin_pending_tournaments(): void
    {
        $user = $this->createUser();

        $this
            ->withHeaders($this->authHeaders($user))
            ->getJson('/api/admin/tournaments/pending')
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');
    }

    public function test_normal_user_cannot_accept_tournament(): void
    {
        $user = $this->createUser();
        $creator = $this->createUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);

        $this
            ->withHeaders($this->authHeaders($user))
            ->putJson("/api/admin/tournaments/{$tournament->id}/accept")
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);
    }

    public function test_normal_user_cannot_refuse_tournament(): void
    {
        $user = $this->createUser();
        $creator = $this->createUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
            'admin_note' => null,
        ]);

        $this
            ->withHeaders($this->authHeaders($user))
            ->putJson("/api/admin/tournaments/{$tournament->id}/refuse", [
                'admin_note' => 'Should not persist.',
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'approval_status' => 'pending',
            'status' => 'draft',
            'admin_note' => null,
        ]);
    }

    public function test_user_cannot_update_another_users_tournament(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $tournament = $this->createTournament($owner, [
            'name' => 'Protected Tournament',
        ]);

        $this
            ->withHeaders($this->authHeaders($otherUser))
            ->putJson("/api/tournaments/{$tournament->id}", [
                'name' => 'Hijacked Tournament',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'created_by' => $owner->id,
            'name' => 'Protected Tournament',
        ]);
    }

    public function test_user_cannot_update_another_users_team(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $team = $this->createTeam($owner, [
            'name' => 'Protected Team',
        ]);

        $this
            ->withHeaders($this->authHeaders($otherUser))
            ->putJson("/api/teams/{$team->id}", [
                'name' => 'Hijacked Team',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'manager_id' => $owner->id,
            'name' => 'Protected Team',
        ]);
    }

    public function test_user_cannot_create_match_in_another_users_tournament(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $otherUser = $this->createUser();

        $this
            ->withHeaders($this->authHeaders($otherUser))
            ->postJson('/api/matches', [
                'tournament_id' => $tournament->id,
                'home_team_id' => $homeTeam->id,
                'away_team_id' => $awayTeam->id,
                'match_date' => '2026-09-01 18:30:00',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('match_games', [
            'tournament_id' => $tournament->id,
            'created_by' => $otherUser->id,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $awayTeam->id,
        ]);
        $this->assertNotSame($creator->id, $otherUser->id);
    }

    public function test_user_cannot_create_statistic_for_another_users_tournament_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $otherUser = $this->createUser();
        $player = $this->createPlayer($homeTeam);
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $this
            ->withHeaders($this->authHeaders($otherUser))
            ->postJson('/api/statistics', [
                'match_game_id' => $match->id,
                'team_id' => $homeTeam->id,
                'player_id' => $player->id,
                'stat_type' => 'goal',
                'value' => 1,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('statistics', [
            'match_game_id' => $match->id,
            'team_id' => $homeTeam->id,
            'player_id' => $player->id,
            'stat_type' => 'goal',
        ]);
    }

    public function test_invalid_bearer_token_is_rejected_if_current_api_supports_it(): void
    {
        $this
            ->withHeader('Authorization', 'Bearer definitely-invalid-token')
            ->getJson('/api/me')
            ->assertUnauthorized();
    }

    // Regression tests

    public function test_jwt_login_returns_token_when_jwt_secret_is_configured(): void
    {
        $user = $this->createUser([
            'email' => 'jwt@example.com',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('token_type', 'bearer')
            ->assertJsonStructure([
                'user',
                'token',
                'token_type',
                'expires_in',
            ]);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_public_tournament_list_excludes_pending_and_refused_tournaments(): void
    {
        $creator = $this->createUser();
        $acceptedTournament = $this->createAcceptedTournament($creator, [
            'name' => 'Accepted Public Tournament',
        ]);
        $pendingTournament = $this->createTournament($creator, [
            'name' => 'Pending Hidden Tournament',
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);
        $refusedTournament = $this->createTournament($creator, [
            'name' => 'Refused Hidden Tournament',
            'approval_status' => 'refused',
            'status' => 'cancelled',
        ]);

        $response = $this->getJson('/api/tournaments');

        $response->assertOk();

        $tournamentIds = $this->idsFrom($response->json());

        $this->assertContains($acceptedTournament->id, $tournamentIds);
        $this->assertNotContains($pendingTournament->id, $tournamentIds);
        $this->assertNotContains($refusedTournament->id, $tournamentIds);
    }

    public function test_tournament_creator_can_list_received_join_requests_by_ownership_not_creator_role(): void
    {
        $creator = $this->createUser([
            'role' => 'user',
        ]);
        $manager = $this->createUser();
        $otherCreator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $otherTournament = $this->createAcceptedTournament($otherCreator);
        $team = $this->createTeam($manager, [
            'name' => 'Requesting Team',
        ]);
        $receivedRequest = $this->createJoinRequest($tournament, $team, $manager);
        $otherRequest = $this->createJoinRequest($otherTournament, $this->createTeam($manager, [
            'name' => 'Other Requesting Team',
        ]), $manager);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->getJson('/api/join-requests');

        $response->assertOk();

        $joinRequestIds = $this->idsFrom($response->json());

        $this->assertSame('user', $creator->role);
        $this->assertContains($receivedRequest->id, $joinRequestIds);
        $this->assertNotContains($otherRequest->id, $joinRequestIds);
    }

    public function test_statistic_creation_requires_valid_match_and_team_context(): void
    {
        $creator = $this->createUser();

        $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', [
                'stat_type' => 'goal',
                'value' => 1,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'match_game_id',
                'team_id',
                'player_id',
            ]);
    }

    public function test_ranking_recalculation_ignores_pending_and_disputed_results(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();

        $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, [
            'home_score' => 1,
            'away_score' => 0,
            'status' => 'played',
            'result_status' => 'confirmed',
        ]);
        $this->createMatch($tournament, $creator, $awayTeam, $homeTeam, [
            'home_score' => 8,
            'away_score' => 0,
            'status' => 'played',
            'result_status' => 'pending',
        ]);
        $this->createMatch($tournament, $creator, $awayTeam, $homeTeam, [
            'home_score' => 7,
            'away_score' => 0,
            'status' => 'played',
            'result_status' => 'disputed',
        ]);

        $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/rankings/recalculate', [
                'tournament_id' => $tournament->id,
            ])
            ->assertOk();

        $homeRanking = $this->rankingFor($tournament, $homeTeam);
        $awayRanking = $this->rankingFor($tournament, $awayTeam);

        $this->assertSame(3, $homeRanking->points);
        $this->assertSame(1, $homeRanking->goals_for);
        $this->assertSame(0, $homeRanking->goals_against);
        $this->assertSame(0, $awayRanking->points);
        $this->assertSame(0, $awayRanking->goals_for);
        $this->assertSame(1, $awayRanking->goals_against);
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

    /**
     * @param array<string, mixed> $overrides
     */
    private function createTournament(User $creator, array $overrides = []): Tournament
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
                'status' => 'draft',
                'approval_status' => 'pending',
                'admin_note' => null,
                'approved_by' => null,
                'approved_at' => null,
            ],
            ...$overrides,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createAcceptedTournament(User $creator, array $overrides = []): Tournament
    {
        return $this->createTournament($creator, [
            ...[
                'status' => 'open',
                'approval_status' => 'accepted',
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

    /**
     * @param array<string, mixed> $overrides
     */
    private function createPlayer(Team $team, array $overrides = []): \App\Models\Player
    {
        return \App\Models\Player::create([
            ...[
                'team_id' => $team->id,
                'first_name' => 'Demo',
                'last_name' => 'Player',
                'birth_date' => '2000-01-15',
                'position' => 'Forward',
                'number' => 9,
                'photo_path' => null,
            ],
            ...$overrides,
        ]);
    }

    private function attachTeamToTournament(Tournament $tournament, Team $team): void
    {
        $tournament->teams()->syncWithoutDetaching([$team->id]);
    }

    /**
     * @return array{0: User, 1: Tournament, 2: Team, 3: Team}
     */
    private function createTournamentWithTeams(): array
    {
        $creator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $homeTeam = $this->createTeam($this->createUser(), [
            'name' => 'Home Team',
            'short_name' => 'HOM',
        ]);
        $awayTeam = $this->createTeam($this->createUser(), [
            'name' => 'Away Team',
            'short_name' => 'AWY',
        ]);

        $this->attachTeamToTournament($tournament, $homeTeam);
        $this->attachTeamToTournament($tournament, $awayTeam);

        return [$creator, $tournament, $homeTeam, $awayTeam];
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createMatch(
        Tournament $tournament,
        User $creator,
        Team $homeTeam,
        Team $awayTeam,
        array $overrides = []
    ): MatchGame {
        return MatchGame::create([
            ...[
                'tournament_id' => $tournament->id,
                'created_by' => $creator->id,
                'home_team_id' => $homeTeam->id,
                'away_team_id' => $awayTeam->id,
                'match_date' => '2026-09-01 18:30:00',
                'home_score' => null,
                'away_score' => null,
                'status' => 'scheduled',
                'result_status' => 'pending',
            ],
            ...$overrides,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createJoinRequest(
        Tournament $tournament,
        Team $team,
        User $manager,
        array $overrides = []
    ): JoinRequest {
        return JoinRequest::create([
            ...[
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
                'manager_id' => $manager->id,
                'status' => 'pending',
                'message' => 'Please accept our team.',
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
