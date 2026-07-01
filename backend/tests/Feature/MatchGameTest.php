<?php

namespace Tests\Feature;

use App\Models\MatchGame;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MatchGameTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_tournament_creator_can_create_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $homeTeam, $awayTeam));

        $response
            ->assertCreated()
            ->assertJsonPath('tournament_id', $tournament->id)
            ->assertJsonPath('created_by', $creator->id)
            ->assertJsonPath('home_team_id', $homeTeam->id)
            ->assertJsonPath('away_team_id', $awayTeam->id)
            ->assertJsonStructure([
                'id',
                'tournament_id',
                'created_by',
                'home_team_id',
                'away_team_id',
                'match_date',
                'home_score',
                'away_score',
                'status',
                'result_status',
                'tournament',
                'homeTeam',
                'awayTeam',
                'creator',
            ]);
    }

    public function test_created_match_is_scheduled_by_default(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $homeTeam, $awayTeam));

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'scheduled')
            ->assertJsonPath('home_score', null)
            ->assertJsonPath('away_score', null);

        $this->assertDatabaseHas('match_games', [
            'id' => $response->json('id'),
            'status' => 'scheduled',
            'home_score' => null,
            'away_score' => null,
        ]);
    }

    public function test_created_match_has_pending_result_status_by_default(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $homeTeam, $awayTeam));

        $response
            ->assertCreated()
            ->assertJsonPath('result_status', 'pending');

        $this->assertDatabaseHas('match_games', [
            'id' => $response->json('id'),
            'result_status' => 'pending',
        ]);
    }

    public function test_non_creator_cannot_create_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $nonCreator = $this->createUser();

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $homeTeam, $awayTeam));

        $this->assertNotSame($creator->id, $nonCreator->id);
        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseMissing('match_games', [
            'tournament_id' => $tournament->id,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $awayTeam->id,
        ]);
    }

    public function test_match_home_team_and_away_team_must_be_different(): void
    {
        [$creator, $tournament, $homeTeam] = $this->createTournamentWithTeams();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $homeTeam, $homeTeam));

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'away_team_id',
            ]);
    }

    public function test_home_team_must_belong_to_tournament(): void
    {
        [$creator, $tournament, , $awayTeam] = $this->createTournamentWithTeams();
        $outsideTeam = $this->createTeam($this->createUser(), [
            'name' => 'Outside Home Team',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $outsideTeam, $awayTeam));

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Home team must be accepted in this tournament.');

        $this->assertDatabaseMissing('match_games', [
            'tournament_id' => $tournament->id,
            'home_team_id' => $outsideTeam->id,
            'away_team_id' => $awayTeam->id,
        ]);
    }

    public function test_away_team_must_belong_to_tournament(): void
    {
        [$creator, $tournament, $homeTeam] = $this->createTournamentWithTeams();
        $outsideTeam = $this->createTeam($this->createUser(), [
            'name' => 'Outside Away Team',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/matches', $this->matchPayload($tournament, $homeTeam, $outsideTeam));

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Away team must be accepted in this tournament.');

        $this->assertDatabaseMissing('match_games', [
            'tournament_id' => $tournament->id,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $outsideTeam->id,
        ]);
    }

    public function test_tournament_creator_can_update_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$match->id}", [
                'match_date' => '2026-09-05 20:00:00',
                'status' => 'postponed',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('id', $match->id)
            ->assertJsonPath('status', 'postponed');

        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'status' => 'postponed',
        ]);
    }

    public function test_non_creator_cannot_update_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $nonCreator = $this->createUser();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, [
            'status' => 'scheduled',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->putJson("/api/matches/{$match->id}", [
                'status' => 'postponed',
            ]);

        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_tournament_creator_can_delete_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->deleteJson("/api/matches/{$match->id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Match deleted.');

        $this->assertDatabaseMissing('match_games', [
            'id' => $match->id,
        ]);
    }

    public function test_non_creator_cannot_delete_match(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $nonCreator = $this->createUser();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->deleteJson("/api/matches/{$match->id}");

        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
        ]);
    }

    public function test_tournament_creator_can_enter_result(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$match->id}/result", [
                'home_score' => 2,
                'away_score' => 1,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('id', $match->id)
            ->assertJsonPath('home_score', 2)
            ->assertJsonPath('away_score', 1);
    }

    public function test_entering_result_sets_scores_and_status_played(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$match->id}/result", [
                'home_score' => 3,
                'away_score' => 3,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('home_score', 3)
            ->assertJsonPath('away_score', 3)
            ->assertJsonPath('status', 'played')
            ->assertJsonPath('result_status', 'pending');

        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'home_score' => 3,
            'away_score' => 3,
            'status' => 'played',
            'result_status' => 'pending',
        ]);
    }

    public function test_scores_cannot_be_negative(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$match->id}/result", [
                'home_score' => -1,
                'away_score' => 0,
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'home_score',
            ]);

        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'home_score' => null,
            'away_score' => null,
            'status' => 'scheduled',
        ]);
    }

    public function test_tournament_creator_can_confirm_result(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, [
            'home_score' => 2,
            'away_score' => 0,
            'status' => 'played',
            'result_status' => 'pending',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$match->id}/confirm-result");

        $response
            ->assertOk()
            ->assertJsonPath('id', $match->id)
            ->assertJsonPath('result_status', 'confirmed');

        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'result_status' => 'confirmed',
        ]);
    }

    public function test_tournament_creator_can_dispute_result(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam, [
            'home_score' => 1,
            'away_score' => 1,
            'status' => 'played',
            'result_status' => 'pending',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/matches/{$match->id}/dispute-result");

        $response
            ->assertOk()
            ->assertJsonPath('id', $match->id)
            ->assertJsonPath('result_status', 'disputed');

        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'result_status' => 'disputed',
        ]);
    }

    public function test_non_creator_cannot_enter_result(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam] = $this->createTournamentWithTeams();
        $nonCreator = $this->createUser();
        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->putJson("/api/matches/{$match->id}/result", [
                'home_score' => 2,
                'away_score' => 1,
            ]);

        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseHas('match_games', [
            'id' => $match->id,
            'home_score' => null,
            'away_score' => null,
            'status' => 'scheduled',
            'result_status' => 'pending',
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
     *
     * @return array<string, mixed>
     */
    private function matchPayload(
        Tournament $tournament,
        Team $homeTeam,
        Team $awayTeam,
        array $overrides = []
    ): array {
        return [
            ...[
                'tournament_id' => $tournament->id,
                'home_team_id' => $homeTeam->id,
                'away_team_id' => $awayTeam->id,
                'match_date' => '2026-09-01 18:30:00',
            ],
            ...$overrides,
        ];
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
}
