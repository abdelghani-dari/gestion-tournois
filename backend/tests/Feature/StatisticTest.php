<?php

namespace Tests\Feature;

use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Statistic;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class StatisticTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_tournament_creator_can_create_goal_statistic(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer, [
                'stat_type' => 'goal',
                'value' => 1,
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('match_game_id', $match->id)
            ->assertJsonPath('team_id', $homeTeam->id)
            ->assertJsonPath('player_id', $homePlayer->id)
            ->assertJsonPath('stat_type', 'goal')
            ->assertJsonPath('value', 1)
            ->assertJsonStructure([
                'id',
                'match_game_id',
                'team_id',
                'player_id',
                'stat_type',
                'value',
                'matchGame',
                'team',
                'player',
            ]);
    }

    public function test_tournament_creator_can_create_assist_statistic(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer, [
                'stat_type' => 'assist',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('stat_type', 'assist')
            ->assertJsonPath('player_id', $homePlayer->id);
    }

    public function test_tournament_creator_can_create_yellow_card_statistic(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer, [
                'stat_type' => 'yellow_card',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('stat_type', 'yellow_card')
            ->assertJsonPath('value', 1);
    }

    public function test_tournament_creator_can_create_red_card_statistic(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer, [
                'stat_type' => 'red_card',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('stat_type', 'red_card')
            ->assertJsonPath('player_id', $homePlayer->id);
    }

    public function test_tournament_creator_can_create_clean_sheet_statistic(): void
    {
        [$creator, , $homeTeam, , , , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, null, [
                'stat_type' => 'clean_sheet',
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('stat_type', 'clean_sheet')
            ->assertJsonPath('team_id', $homeTeam->id)
            ->assertJsonPath('player_id', null);
    }

    public function test_invalid_stat_type_is_rejected(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer, [
                'stat_type' => 'offside',
            ]));

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'stat_type',
            ]);
    }

    public function test_statistic_value_must_be_positive_integer(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer, [
                'value' => 0,
            ]));

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'value',
            ]);
    }

    public function test_match_game_id_is_required(): void
    {
        [$creator, , $homeTeam, , $homePlayer] = $this->createMatchContext();
        $payload = $this->statisticPayload(null, $homeTeam, $homePlayer);
        unset($payload['match_game_id']);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'match_game_id',
            ]);
    }

    public function test_team_id_is_required(): void
    {
        [$creator, , , , $homePlayer, , $match] = $this->createMatchContext();
        $payload = $this->statisticPayload($match, null, $homePlayer);
        unset($payload['team_id']);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'team_id',
            ]);
    }

    public function test_player_id_is_required_for_player_stats_if_required_by_current_api(): void
    {
        [$creator, , $homeTeam, , , , $match] = $this->createMatchContext();
        $payload = $this->statisticPayload($match, $homeTeam, null, [
            'stat_type' => 'goal',
        ]);
        unset($payload['player_id']);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'player_id',
            ]);
    }

    public function test_player_must_belong_to_selected_team_if_implemented(): void
    {
        [$creator, , $homeTeam, , , $awayPlayer, $match] = $this->createMatchContext();

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $awayPlayer));

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'The player must belong to the selected team.');
    }

    public function test_non_creator_cannot_create_statistic_for_tournament_match(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();
        $nonCreator = $this->createUser();

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->postJson('/api/statistics', $this->statisticPayload($match, $homeTeam, $homePlayer));

        $this->assertNotSame($creator->id, $nonCreator->id);
        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseMissing('statistics', [
            'match_game_id' => $match->id,
            'team_id' => $homeTeam->id,
            'player_id' => $homePlayer->id,
            'stat_type' => 'goal',
        ]);
    }

    public function test_creator_can_update_statistic(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();
        $statistic = $this->createStatistic($match, $homeTeam, $homePlayer, [
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->putJson("/api/statistics/{$statistic->id}", [
                'stat_type' => 'assist',
                'value' => 2,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('id', $statistic->id)
            ->assertJsonPath('stat_type', 'assist')
            ->assertJsonPath('value', 2);

        $this->assertDatabaseHas('statistics', [
            'id' => $statistic->id,
            'stat_type' => 'assist',
            'value' => 2,
        ]);
    }

    public function test_non_creator_cannot_update_statistic(): void
    {
        [, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();
        $nonCreator = $this->createUser();
        $statistic = $this->createStatistic($match, $homeTeam, $homePlayer, [
            'stat_type' => 'goal',
            'value' => 1,
        ]);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->putJson("/api/statistics/{$statistic->id}", [
                'stat_type' => 'assist',
                'value' => 4,
            ]);

        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseHas('statistics', [
            'id' => $statistic->id,
            'stat_type' => 'goal',
            'value' => 1,
        ]);
    }

    public function test_creator_can_delete_statistic(): void
    {
        [$creator, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();
        $statistic = $this->createStatistic($match, $homeTeam, $homePlayer);

        $response = $this
            ->withHeaders($this->authHeaders($creator))
            ->deleteJson("/api/statistics/{$statistic->id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Statistic deleted.');

        $this->assertDatabaseMissing('statistics', [
            'id' => $statistic->id,
        ]);
    }

    public function test_non_creator_cannot_delete_statistic(): void
    {
        [, , $homeTeam, , $homePlayer, , $match] = $this->createMatchContext();
        $nonCreator = $this->createUser();
        $statistic = $this->createStatistic($match, $homeTeam, $homePlayer);

        $response = $this
            ->withHeaders($this->authHeaders($nonCreator))
            ->deleteJson("/api/statistics/{$statistic->id}");

        $this->assertContains($response->status(), [403, 404]);
        $this->assertDatabaseHas('statistics', [
            'id' => $statistic->id,
        ]);
    }

    public function test_user_can_list_statistics_for_match_or_tournament_depending_existing_api(): void
    {
        [$creator, $tournament, $homeTeam, $awayTeam, $homePlayer, $awayPlayer, $match] = $this->createMatchContext();
        $otherMatch = $this->createMatch($tournament, $creator, $awayTeam, $homeTeam);
        $goalStatistic = $this->createStatistic($match, $homeTeam, $homePlayer, [
            'stat_type' => 'goal',
        ]);
        $otherStatistic = $this->createStatistic($otherMatch, $awayTeam, $awayPlayer, [
            'stat_type' => 'assist',
        ]);

        $response = $this->getJson("/api/statistics?match_game_id={$match->id}");

        $response->assertOk();

        $statisticIds = $this->idsFrom($response->json());

        $this->assertContains($goalStatistic->id, $statisticIds);
        $this->assertNotContains($otherStatistic->id, $statisticIds);
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
     * @return array{0: User, 1: Tournament, 2: Team, 3: Team, 4: Player, 5: Player, 6: MatchGame}
     */
    private function createMatchContext(): array
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
        $homePlayer = $this->createPlayer($homeTeam, [
            'first_name' => 'Home',
            'last_name' => 'Player',
        ]);
        $awayPlayer = $this->createPlayer($awayTeam, [
            'first_name' => 'Away',
            'last_name' => 'Player',
        ]);

        $this->attachTeamToTournament($tournament, $homeTeam);
        $this->attachTeamToTournament($tournament, $awayTeam);

        $match = $this->createMatch($tournament, $creator, $homeTeam, $awayTeam);

        return [$creator, $tournament, $homeTeam, $awayTeam, $homePlayer, $awayPlayer, $match];
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
                'home_score' => 2,
                'away_score' => 1,
                'status' => 'played',
                'result_status' => 'confirmed',
            ],
            ...$overrides,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createStatistic(MatchGame $match, Team $team, ?Player $player, array $overrides = []): Statistic
    {
        return Statistic::create([
            ...[
                'match_game_id' => $match->id,
                'team_id' => $team->id,
                'player_id' => $player?->id,
                'stat_type' => 'goal',
                'value' => 1,
            ],
            ...$overrides,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function statisticPayload(?MatchGame $match, ?Team $team, ?Player $player, array $overrides = []): array
    {
        return [
            ...[
                'match_game_id' => $match?->id,
                'team_id' => $team?->id,
                'player_id' => $player?->id,
                'stat_type' => 'goal',
                'value' => 1,
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
