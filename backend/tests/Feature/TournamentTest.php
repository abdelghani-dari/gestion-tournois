<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class TournamentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_authenticated_user_can_create_tournament(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->withBearerTokenFor($user)
            ->postJson('/api/tournaments', $this->validTournamentPayload([
                'name' => 'Casablanca Summer Cup',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('name', 'Casablanca Summer Cup')
            ->assertJsonPath('created_by', $user->id)
            ->assertJsonPath('format', 'league')
            ->assertJsonStructure([
                'id',
                'created_by',
                'name',
                'description',
                'city',
                'location',
                'format',
                'start_date',
                'end_date',
                'status',
                'approval_status',
                'created_at',
                'updated_at',
            ]);

        $this->assertDatabaseHas('tournaments', [
            'name' => 'Casablanca Summer Cup',
            'created_by' => $user->id,
            'format' => 'league',
        ]);
    }

    public function test_created_tournament_is_pending_and_draft_by_default(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->withBearerTokenFor($user)
            ->postJson('/api/tournaments', $this->validTournamentPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'draft')
            ->assertJsonPath('approval_status', 'pending')
            ->assertJsonPath('approved_by', null)
            ->assertJsonPath('approved_at', null);

        $this->assertDatabaseHas('tournaments', [
            'id' => $response->json('id'),
            'created_by' => $user->id,
            'status' => 'draft',
            'approval_status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function test_public_tournaments_list_only_shows_accepted_tournaments(): void
    {
        $creator = User::factory()->create();
        $firstAccepted = $this->createTournament($creator, [
            'name' => 'Accepted Cup One',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);
        $secondAccepted = $this->createTournament($creator, [
            'name' => 'Accepted Cup Two',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);

        $response = $this->getJson('/api/tournaments');

        $response->assertOk();

        $tournaments = $response->json();
        $tournamentIds = $this->tournamentIdsFrom($tournaments);

        $this->assertContains($firstAccepted->id, $tournamentIds);
        $this->assertContains($secondAccepted->id, $tournamentIds);

        foreach ($tournaments as $tournament) {
            $this->assertSame('accepted', $tournament['approval_status']);
        }
    }

    public function test_public_tournaments_list_hides_pending_and_refused_tournaments(): void
    {
        $creator = User::factory()->create();
        $accepted = $this->createTournament($creator, [
            'name' => 'Accepted Cup',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);
        $pending = $this->createTournament($creator, [
            'name' => 'Pending Cup',
            'approval_status' => 'pending',
        ]);
        $refused = $this->createTournament($creator, [
            'name' => 'Refused Cup',
            'approval_status' => 'refused',
        ]);

        $response = $this->getJson('/api/tournaments');

        $response->assertOk();

        $tournamentIds = $this->tournamentIdsFrom($response->json());

        $this->assertContains($accepted->id, $tournamentIds);
        $this->assertNotContains($pending->id, $tournamentIds);
        $this->assertNotContains($refused->id, $tournamentIds);
    }

    public function test_user_can_list_his_own_tournaments(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $firstOwnTournament = $this->createTournament($user, [
            'name' => 'My Pending Cup',
            'approval_status' => 'pending',
        ]);
        $secondOwnTournament = $this->createTournament($user, [
            'name' => 'My Accepted Cup',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);
        $otherTournament = $this->createTournament($otherUser, [
            'name' => 'Other User Cup',
            'approval_status' => 'accepted',
            'status' => 'open',
        ]);

        $response = $this
            ->withBearerTokenFor($user)
            ->getJson('/api/my-tournaments');

        $response->assertOk();

        $tournamentIds = $this->tournamentIdsFrom($response->json());

        $this->assertContains($firstOwnTournament->id, $tournamentIds);
        $this->assertContains($secondOwnTournament->id, $tournamentIds);
        $this->assertNotContains($otherTournament->id, $tournamentIds);
    }

    public function test_user_cannot_update_another_users_tournament(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $tournament = $this->createTournament($owner, [
            'name' => 'Original Cup',
        ]);

        $response = $this
            ->withBearerTokenFor($otherUser)
            ->putJson("/api/tournaments/{$tournament->id}", [
                'name' => 'Hijacked Cup',
            ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'name' => 'Original Cup',
            'created_by' => $owner->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_tournament(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $tournament = $this->createTournament($owner, [
            'name' => 'Protected Cup',
        ]);

        $response = $this
            ->withBearerTokenFor($otherUser)
            ->deleteJson("/api/tournaments/{$tournament->id}");

        $response
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden.');

        $this->assertDatabaseHas('tournaments', [
            'id' => $tournament->id,
            'name' => 'Protected Cup',
        ]);
    }

    public function test_tournament_creation_requires_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->withBearerTokenFor($user)
            ->postJson('/api/tournaments', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'start_date',
                'end_date',
            ]);
    }

    public function test_tournament_end_date_cannot_be_before_start_date(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->withBearerTokenFor($user)
            ->postJson('/api/tournaments', $this->validTournamentPayload([
                'name' => 'Invalid Date Cup',
                'start_date' => '2026-08-15',
                'end_date' => '2026-08-01',
            ]));

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'end_date',
            ]);

        $this->assertDatabaseMissing('tournaments', [
            'name' => 'Invalid Date Cup',
        ]);
    }

    private function withBearerTokenFor(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer '.$this->loginTokenFor($user));
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
    private function validTournamentPayload(array $overrides = []): array
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
     * @param array<int, array<string, mixed>> $tournaments
     *
     * @return array<int, int>
     */
    private function tournamentIdsFrom(array $tournaments): array
    {
        return array_column($tournaments, 'id');
    }
}
