<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.name', 'Demo User')
            ->assertJsonPath('user.email', 'demo@example.com')
            ->assertJsonPath('user.role', 'user')
            ->assertJsonPath('user.account_status', 'pending')
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'account_status',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'role' => 'user',
            'account_status' => 'pending',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'active@example.com',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.account_status', 'active')
            ->assertJsonPath('user.tournament_count', 0)
            ->assertJsonPath('token_type', 'bearer')
            ->assertJsonStructure([
                'user',
                'token',
                'token_type',
                'expires_in',
            ]);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'active@example.com',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Invalid credentials.')
            ->assertJsonMissingPath('token');
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/login', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'email',
                'password',
            ]);
    }

    public function test_authenticated_user_can_get_profile_or_me_route(): void
    {
        $user = User::factory()->create();
        $token = $this->loginTokenFor($user);

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', $user->email)
            ->assertJsonPath('account_status', 'active')
            ->assertJsonPath('tournament_count', 0);
    }

    public function test_guest_cannot_access_protected_profile_or_me_route(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized();
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $this->loginTokenFor($user);

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout');

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Successfully logged out.');

        $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/me')
            ->assertUnauthorized();
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
}
