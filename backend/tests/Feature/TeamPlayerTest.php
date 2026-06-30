<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamPlayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_team(): void
    {
        $user = $this->createUser();

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->postJson('/api/teams', $this->teamPayload([
                'name' => 'Atlas Lions',
                'short_name' => 'ATL',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('name', 'Atlas Lions')
            ->assertJsonPath('short_name', 'ATL')
            ->assertJsonPath('city', 'Casablanca')
            ->assertJsonPath('manager_id', $user->id)
            ->assertJsonStructure([
                'id',
                'manager_id',
                'name',
                'short_name',
                'city',
                'created_at',
                'updated_at',
            ]);
    }

    public function test_created_team_belongs_to_authenticated_user(): void
    {
        $user = $this->createUser();

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->postJson('/api/teams', $this->teamPayload([
                'name' => 'Raja Youth',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('manager_id', $user->id);

        $this->assertDatabaseHas('teams', [
            'id' => $response->json('id'),
            'manager_id' => $user->id,
            'name' => 'Raja Youth',
        ]);
    }

    public function test_user_can_list_his_own_teams(): void
    {
        $user = $this->createUser();
        $otherUser = $this->createUser();
        $firstTeam = $this->createTeam($user, [
            'name' => 'First Own Team',
        ]);
        $secondTeam = $this->createTeam($user, [
            'name' => 'Second Own Team',
        ]);
        $otherTeam = $this->createTeam($otherUser, [
            'name' => 'Other User Team',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->getJson('/api/my-teams');

        $response->assertOk();

        $teamIds = $this->idsFrom($response->json());

        $this->assertContains($firstTeam->id, $teamIds);
        $this->assertContains($secondTeam->id, $teamIds);
        $this->assertNotContains($otherTeam->id, $teamIds);
    }

    public function test_user_can_update_his_own_team(): void
    {
        $user = $this->createUser();
        $team = $this->createTeam($user, [
            'name' => 'Original Team',
            'short_name' => 'ORG',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->putJson("/api/teams/{$team->id}", [
                'name' => 'Updated Team',
                'short_name' => 'UPD',
                'city' => 'Rabat',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('id', $team->id)
            ->assertJsonPath('name', 'Updated Team')
            ->assertJsonPath('short_name', 'UPD')
            ->assertJsonPath('city', 'Rabat');

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'manager_id' => $user->id,
            'name' => 'Updated Team',
            'short_name' => 'UPD',
            'city' => 'Rabat',
        ]);
    }

    public function test_user_cannot_update_another_users_team(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $team = $this->createTeam($owner, [
            'name' => 'Protected Team',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($otherUser))
            ->putJson("/api/teams/{$team->id}", [
                'name' => 'Hijacked Team',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'manager_id' => $owner->id,
            'name' => 'Protected Team',
        ]);
    }

    public function test_user_cannot_delete_another_users_team(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $team = $this->createTeam($owner, [
            'name' => 'Protected Team',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($otherUser))
            ->deleteJson("/api/teams/{$team->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'manager_id' => $owner->id,
            'name' => 'Protected Team',
        ]);
    }

    public function test_user_can_create_player_in_his_own_team(): void
    {
        $user = $this->createUser();
        $team = $this->createTeam($user);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->postJson('/api/players', $this->playerPayload($team, [
                'first_name' => 'Youssef',
                'last_name' => 'Amrani',
                'number' => 9,
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('team_id', $team->id)
            ->assertJsonPath('first_name', 'Youssef')
            ->assertJsonPath('last_name', 'Amrani')
            ->assertJsonPath('number', 9)
            ->assertJsonStructure([
                'id',
                'team_id',
                'first_name',
                'last_name',
                'position',
                'number',
                'created_at',
                'updated_at',
            ]);

        $this->assertDatabaseHas('players', [
            'team_id' => $team->id,
            'first_name' => 'Youssef',
            'last_name' => 'Amrani',
            'number' => 9,
        ]);
    }

    public function test_user_can_update_player_in_his_own_team(): void
    {
        $user = $this->createUser();
        $team = $this->createTeam($user);
        $player = $this->createPlayer($team, [
            'first_name' => 'Old',
            'last_name' => 'Player',
            'number' => 7,
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->putJson("/api/players/{$player->id}", [
                'first_name' => 'Updated',
                'last_name' => 'Player',
                'number' => 10,
                'position' => 'Forward',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('id', $player->id)
            ->assertJsonPath('team_id', $team->id)
            ->assertJsonPath('first_name', 'Updated')
            ->assertJsonPath('last_name', 'Player')
            ->assertJsonPath('number', 10)
            ->assertJsonPath('position', 'Forward');

        $this->assertDatabaseHas('players', [
            'id' => $player->id,
            'team_id' => $team->id,
            'first_name' => 'Updated',
            'last_name' => 'Player',
            'number' => 10,
            'position' => 'Forward',
        ]);
    }

    public function test_user_can_delete_player_in_his_own_team(): void
    {
        $user = $this->createUser();
        $team = $this->createTeam($user);
        $player = $this->createPlayer($team, [
            'first_name' => 'Delete',
            'last_name' => 'Me',
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->deleteJson("/api/players/{$player->id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Player deleted.');

        $this->assertDatabaseMissing('players', [
            'id' => $player->id,
        ]);
    }

    public function test_user_cannot_create_player_in_another_users_team(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $team = $this->createTeam($owner);

        $response = $this
            ->withHeaders($this->authHeaders($otherUser))
            ->postJson('/api/players', $this->playerPayload($team, [
                'first_name' => 'Blocked',
                'last_name' => 'Player',
            ]));

        $response->assertStatus(403);

        $this->assertDatabaseMissing('players', [
            'team_id' => $team->id,
            'first_name' => 'Blocked',
            'last_name' => 'Player',
        ]);
    }

    public function test_player_creation_requires_required_fields(): void
    {
        $user = $this->createUser();

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->postJson('/api/players', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'team_id',
                'first_name',
                'last_name',
            ]);
    }

    public function test_player_number_must_be_integer(): void
    {
        $user = $this->createUser();
        $team = $this->createTeam($user);

        $response = $this
            ->withHeaders($this->authHeaders($user))
            ->postJson('/api/players', $this->playerPayload($team, [
                'first_name' => 'Invalid',
                'last_name' => 'Number',
                'number' => 'not-a-number',
            ]));

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'number',
            ]);

        $this->assertDatabaseMissing('players', [
            'team_id' => $team->id,
            'first_name' => 'Invalid',
            'last_name' => 'Number',
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
     *
     * @return array<string, mixed>
     */
    private function teamPayload(array $overrides = []): array
    {
        return [
            ...[
                'name' => 'Demo Team',
                'short_name' => 'DMT',
                'city' => 'Casablanca',
            ],
            ...$overrides,
        ];
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
     *
     * @return array<string, mixed>
     */
    private function playerPayload(Team $team, array $overrides = []): array
    {
        return [
            ...[
                'team_id' => $team->id,
                'first_name' => 'Demo',
                'last_name' => 'Player',
                'birth_date' => '2000-01-15',
                'position' => 'Midfielder',
                'number' => 8,
            ],
            ...$overrides,
        ];
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createPlayer(Team $team, array $overrides = []): Player
    {
        return Player::create([
            ...[
                'team_id' => $team->id,
                'first_name' => 'Demo',
                'last_name' => 'Player',
                'birth_date' => '2000-01-15',
                'position' => 'Midfielder',
                'number' => 8,
                'photo_path' => null,
            ],
            ...$overrides,
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
