<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class SmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_public_tournaments_endpoint_responds_successfully_with_json(): void
    {
        $response = $this->getJson('/api/tournaments');

        $response->assertOk();
        $this->assertJsonResponse($response);
    }

    public function test_login_endpoint_responds_correctly_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'smoke-login@example.com',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('token_type', 'bearer')
            ->assertJsonStructure([
                'user',
                'token',
                'token_type',
                'expires_in',
            ]);

        $this->assertJsonResponse($response);
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_protected_me_route_rejects_guests_with_json(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized();
        $this->assertJsonResponse($response);
    }

    public function test_authenticated_me_route_works_with_jwt_bearer_token(): void
    {
        $user = User::factory()->create([
            'email' => 'smoke-me@example.com',
        ]);
        $token = $this->loginTokenFor($user);

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', $user->email);

        $this->assertJsonResponse($response);
    }

    public function test_public_ranking_and_statistics_routes_respond_safely_with_json(): void
    {
        $creator = User::factory()->create();
        $tournament = $this->createAcceptedTournament($creator);

        $rankingResponse = $this->getJson("/api/rankings?tournament_id={$tournament->id}");
        $statisticsResponse = $this->getJson('/api/statistics');

        $rankingResponse->assertOk();
        $statisticsResponse->assertOk();

        $this->assertJsonResponse($rankingResponse);
        $this->assertJsonResponse($statisticsResponse);
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

    private function createAcceptedTournament(User $creator): Tournament
    {
        return Tournament::create([
            'created_by' => $creator->id,
            'name' => 'Smoke Test Tournament',
            'description' => 'Minimal tournament for smoke checks.',
            'city' => 'Casablanca',
            'location' => 'Smoke Stadium',
            'format' => 'league',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-15',
            'status' => 'open',
            'approval_status' => 'accepted',
            'admin_note' => null,
            'approved_by' => $creator->id,
            'approved_at' => now(),
        ]);
    }

    private function assertJsonResponse(TestResponse $response): void
    {
        $this->assertStringStartsWith(
            'application/json',
            (string) $response->headers->get('Content-Type')
        );
    }
}
