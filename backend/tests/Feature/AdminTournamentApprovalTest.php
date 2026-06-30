<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AdminTournamentApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_admin_can_list_pending_tournaments(): void
    {
        $admin = $this->makeAdmin();
        $creator = $this->makeUser();
        $pendingTournament = $this->createTournament($creator, [
            'name' => 'Pending Cup',
            'approval_status' => 'pending',
        ]);
        $acceptedTournament = $this->createTournament($creator, [
            'name' => 'Accepted Cup',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);
        $refusedTournament = $this->createTournament($creator, [
            'name' => 'Refused Cup',
            'approval_status' => 'refused',
            'status' => 'cancelled',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($admin))
            ->getJson('/api/admin/tournaments/pending');

        $response->assertOk();

        $tournamentIds = $this->tournamentIdsFrom($response->json());

        $this->assertContains($pendingTournament->id, $tournamentIds);
        $this->assertNotContains($acceptedTournament->id, $tournamentIds);
        $this->assertNotContains($refusedTournament->id, $tournamentIds);

        foreach ($response->json() as $tournament) {
            $this->assertSame('pending', $tournament['approval_status']);
            $this->assertArrayHasKey('creator', $tournament);
        }
    }

    public function test_normal_user_cannot_list_pending_tournaments(): void
    {
        $user = $this->makeUser();

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->getJson('/api/admin/tournaments/pending');

        $response
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');
    }

    public function test_admin_can_accept_tournament(): void
    {
        $admin = $this->makeAdmin();
        $creator = $this->makeUser();
        $tournament = $this->createTournament($creator, [
            'name' => 'Tournament To Accept',
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$tournament->id}/accept");

        $response
            ->assertOk()
            ->assertJsonPath('id', $tournament->id)
            ->assertJsonPath('name', 'Tournament To Accept')
            ->assertJsonPath('approval_status', 'accepted')
            ->assertJsonPath('status', 'open');
    }

    public function test_accepting_tournament_sets_approval_status_accepted_and_status_open(): void
    {
        $admin = $this->makeAdmin();
        $creator = $this->makeUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);

        $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$tournament->id}/accept")
            ->assertOk()
            ->assertJsonPath('approval_status', 'accepted')
            ->assertJsonPath('status', 'open');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);
    }

    public function test_accepting_tournament_sets_approved_by_and_approved_at(): void
    {
        $admin = $this->makeAdmin();
        $creator = $this->makeUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
            'approved_by' => null,
            'approved_at' => null,
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$tournament->id}/accept");

        $response
            ->assertOk()
            ->assertJsonPath('approved_by', $admin->id);

        $this->assertNotEmpty($response->json('approved_at'));

        $tournament->refresh();

        $this->assertSame($admin->id, $tournament->approved_by);
        $this->assertNotNull($tournament->approved_at);
    }

    public function test_admin_can_refuse_tournament_with_admin_note(): void
    {
        $admin = $this->makeAdmin();
        $creator = $this->makeUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$tournament->id}/refuse", [
                'admin_note' => 'Tournament information is incomplete.',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('id', $tournament->id)
            ->assertJsonPath('approval_status', 'refused')
            ->assertJsonPath('status', 'cancelled')
            ->assertJsonPath('admin_note', 'Tournament information is incomplete.')
            ->assertJsonPath('approved_by', $admin->id);

        $this->assertNotEmpty($response->json('approved_at'));
        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'approval_status' => 'refused',
            'status' => 'cancelled',
            'admin_note' => 'Tournament information is incomplete.',
            'approved_by' => $admin->id,
        ]);
    }

    public function test_refused_tournament_is_not_public(): void
    {
        $admin = $this->makeAdmin();
        $creator = $this->makeUser();
        $acceptedTournament = $this->createTournament($creator, [
            'name' => 'Accepted Public Cup',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);
        $refusedTournament = $this->createTournament($creator, [
            'name' => 'Refused Private Cup',
            'approval_status' => 'pending',
            'status' => 'draft',
        ]);

        $this
            ->withHeaders($this->authHeaders($admin))
            ->putJson("/api/admin/tournaments/{$refusedTournament->id}/refuse", [
                'admin_note' => 'Not approved for publication.',
            ])
            ->assertOk();

        $response = $this->getJson('/api/tournaments');

        $response->assertOk();

        $tournamentIds = $this->tournamentIdsFrom($response->json());

        $this->assertContains($acceptedTournament->id, $tournamentIds);
        $this->assertNotContains($refusedTournament->id, $tournamentIds);
    }

    public function test_normal_user_cannot_accept_tournament(): void
    {
        $user = $this->makeUser();
        $creator = $this->makeUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
            'approved_by' => null,
            'approved_at' => null,
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->putJson("/api/admin/tournaments/{$tournament->id}/accept");

        $response
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'approval_status' => 'pending',
            'status' => 'draft',
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function test_normal_user_cannot_refuse_tournament(): void
    {
        $user = $this->makeUser();
        $creator = $this->makeUser();
        $tournament = $this->createTournament($creator, [
            'approval_status' => 'pending',
            'status' => 'draft',
            'admin_note' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->putJson("/api/admin/tournaments/{$tournament->id}/refuse", [
                'admin_note' => 'This should not be saved.',
            ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'approval_status' => 'pending',
            'status' => 'draft',
            'admin_note' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    private function makeUser(array $overrides = []): User
    {
        return User::factory()->create([
            ...[
                'role' => 'user',
                'account_status' => 'active',
            ],
            ...$overrides,
        ]);
    }

    private function makeAdmin(array $overrides = []): User
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
    private function tournamentPayload(User $creator, array $overrides = []): array
    {
        return [
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
        ];
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createTournament(User $creator, array $overrides = []): Tournament
    {
        return Tournament::create($this->tournamentPayload($creator, $overrides));
    }

    /**
     * @param array<int, array<string, mixed>> $tournaments
     *
     * @return array<int, int>
     */
    private function tournamentIdsFrom(array $tournaments): array
    {
        return array_column($tournaments, 'id');
    }
}
