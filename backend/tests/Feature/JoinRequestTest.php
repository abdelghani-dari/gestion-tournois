<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class JoinRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_user_can_send_join_request_to_accepted_tournament(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);

        $response = $this
            ->withHeaders($this->authHeaders($manager))
            ->postJson('/api/join-requests', $this->joinRequestPayload($tournament, $team, [
                'message' => 'We would like to join this tournament.',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('tournament_id', $tournament->id)
            ->assertJsonPath('team_id', $team->id)
            ->assertJsonPath('manager_id', $manager->id)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('message', 'We would like to join this tournament.')
            ->assertJsonStructure([
                'id',
                'tournament_id',
                'team_id',
                'manager_id',
                'status',
                'message',
                'tournament',
                'team',
                'manager',
                'created_at',
                'updated_at',
            ]);
    }

    public function test_join_request_is_pending_by_default(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);

        $response = $this
            ->withHeaders($this->authHeaders($manager))
            ->postJson('/api/join-requests', $this->joinRequestPayload($tournament, $team));

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('join_requests', [
            'id' => $response->json('id'),
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
            'manager_id' => $manager->id,
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_send_join_request_to_pending_tournament(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);
        $team = $this->createTeam($manager);

        $response = $this
            ->withHeaders($this->authHeaders($manager))
            ->postJson('/api/join-requests', $this->joinRequestPayload($tournament, $team));

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Tournament must be accepted before teams can request participation.');

        $this->assertDatabaseMissing('join_requests', [
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
        ]);
    }

    public function test_user_cannot_send_join_request_to_refused_tournament(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'refused',
            'status' => 'cancelled',
        ]);
        $team = $this->createTeam($manager);

        $response = $this
            ->withHeaders($this->authHeaders($manager))
            ->postJson('/api/join-requests', $this->joinRequestPayload($tournament, $team));

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Tournament must be accepted before teams can request participation.');

        $this->assertDatabaseMissing('join_requests', [
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
        ]);
    }

    public function test_user_cannot_send_duplicate_join_request_for_same_team_and_tournament(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $this->createJoinRequest($tournament, $team, $manager);

        $response = $this
            ->withHeaders($this->authHeaders($manager))
            ->postJson('/api/join-requests', $this->joinRequestPayload($tournament, $team));

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This team already has a join request for this tournament.');

        $this->assertSame(1, JoinRequest::query()
            ->where('tournament_id', $tournament->id)
            ->where('team_id', $team->id)
            ->count());
    }

    public function test_tournament_creator_can_list_received_join_requests(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $otherCreator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator, [
            'name' => 'Creator Tournament',
        ]);
        $otherTournament = $this->createAcceptedTournament($otherCreator, [
            'name' => 'Other Tournament',
        ]);
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

        $this->assertContains($receivedRequest->id, $joinRequestIds);
        $this->assertNotContains($otherRequest->id, $joinRequestIds);
    }

    public function test_tournament_creator_can_accept_join_request(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$joinRequest->id}/accept");

        $response
            ->assertOk()
            ->assertJsonPath('id', $joinRequest->id)
            ->assertJsonPath('status', 'accepted')
            ->assertJsonPath('tournament_id', $tournament->id)
            ->assertJsonPath('team_id', $team->id);
    }

    public function test_accepting_join_request_changes_status_to_accepted(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$joinRequest->id}/accept")
            ->assertOk()
            ->assertJsonPath('status', 'accepted');

        $this->assertDatabaseHas('join_requests', [
            'id' => $joinRequest->id,
            'status' => 'accepted',
        ]);
    }

    public function test_accepting_join_request_adds_team_to_tournament_team(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$joinRequest->id}/accept")
            ->assertOk();

        $this->assertDatabaseHas('tournament_team', [
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
        ]);
    }

    public function test_tournament_creator_can_refuse_join_request(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$joinRequest->id}/refuse");

        $response
            ->assertOk()
            ->assertJsonPath('id', $joinRequest->id)
            ->assertJsonPath('status', 'refused')
            ->assertJsonPath('tournament_id', $tournament->id)
            ->assertJsonPath('team_id', $team->id);
    }

    public function test_refusing_join_request_changes_status_to_refused(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/join-requests/{$joinRequest->id}/refuse")
            ->assertOk()
            ->assertJsonPath('status', 'refused');

        $this->assertDatabaseHas('join_requests', [
            'id' => $joinRequest->id,
            'status' => 'refused',
        ]);
    }

    public function test_non_creator_cannot_accept_join_request(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $nonCreator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->putJson("/api/join-requests/{$joinRequest->id}/accept");

        $this->assertContains($response->status(), [403, 404]);

        $this->assertDatabaseHas('join_requests', [
            'id' => $joinRequest->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseMissing('tournament_team', [
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
        ]);
    }

    public function test_non_creator_cannot_refuse_join_request(): void
    {
        $creator = $this->createUser();
        $manager = $this->createUser();
        $nonCreator = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($manager);
        $joinRequest = $this->createJoinRequest($tournament, $team, $manager);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->putJson("/api/join-requests/{$joinRequest->id}/refuse");

        $this->assertContains($response->status(), [403, 404]);

        $this->assertDatabaseHas('join_requests', [
            'id' => $joinRequest->id,
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_send_join_request_with_another_users_team(): void
    {
        $creator = $this->createUser();
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $tournament = $this->createAcceptedTournament($creator);
        $team = $this->createTeam($owner);

        $response = $this
            ->withHeaders($this->authHeaders($otherUser))
            ->postJson('/api/join-requests', $this->joinRequestPayload($tournament, $team));

        $this->assertContains($response->status(), [403, 422]);
        $response->assertJsonPath('message', 'The manager does not own this team.');

        $this->assertDatabaseMissing('join_requests', [
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
            'manager_id' => $otherUser->id,
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

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function joinRequestPayload(Tournament $tournament, Team $team, array $overrides = []): array
    {
        return [
            ...[
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
                'message' => 'Please accept our team.',
            ],
            ...$overrides,
        ];
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
