<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AppliesListSorting;
use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Statistic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticController extends Controller
{
    use AppliesListSorting;

    private const STAT_TYPES = 'goal,assist,yellow_card,red_card,clean_sheet';

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['sometimes', 'exists:match_games,id'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'player_id' => ['sometimes', 'exists:players,id'],
            'stat_type' => ['sometimes', 'in:'.self::STAT_TYPES],
        ]);

        $query = Statistic::with(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']);

        foreach (['match_game_id', 'team_id', 'player_id', 'stat_type'] as $field) {
            if (isset($validated[$field])) {
                $query->where($field, $validated[$field]);
            }
        }

        $this->applyListSorting($query, $request, [
            'id' => 'id',
            'stat_type' => 'stat_type',
            'value' => 'value',
            'created_at' => 'created_at',
        ]);

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['required', 'exists:match_games,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'player_id' => ['nullable', 'required_unless:stat_type,clean_sheet', 'exists:players,id'],
            'stat_type' => ['required', 'in:'.self::STAT_TYPES],
            'value' => ['required', 'integer', 'min:1'],
        ]);

        $matchGame = MatchGame::with('tournament')->findOrFail($validated['match_game_id']);

        if (! $this->canManageMatch($matchGame)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $error = $this->validateStatisticContext($matchGame, $validated);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $statistic = Statistic::create($validated);

        return response()->json($statistic->load(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']), 201);
    }

    public function show(Statistic $statistic): JsonResponse
    {
        return response()->json($statistic->load(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']));
    }

    public function update(Request $request, Statistic $statistic): JsonResponse
    {
        $statistic->load('matchGame.tournament');

        if (! $this->canManageStatistic($statistic)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'stat_type' => ['sometimes', 'required', 'in:'.self::STAT_TYPES],
            'value' => ['sometimes', 'required', 'integer', 'min:1'],
        ]);

        $error = $this->validateStatisticContext($statistic->matchGame, [
            ...$statistic->only(['match_game_id', 'team_id', 'player_id', 'stat_type', 'value']),
            ...$validated,
        ]);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $statistic->update($validated);

        return response()->json($statistic->load(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']));
    }

    public function destroy(Statistic $statistic): JsonResponse
    {
        $statistic->load('matchGame.tournament');

        if (! $this->canManageStatistic($statistic)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $statistic->delete();

        return response()->json(['message' => 'Statistic deleted.']);
    }

    private function validateStatisticContext(MatchGame $matchGame, array $data): ?string
    {
        if (! in_array((int) $data['team_id'], [(int) $matchGame->home_team_id, (int) $matchGame->away_team_id], true)) {
            return 'The team must be one of the match teams.';
        }

        if (($data['stat_type'] ?? null) !== 'clean_sheet' && empty($data['player_id'])) {
            return 'The player field is required for this statistic type.';
        }

        if (! empty($data['player_id']) && ! empty($data['team_id'])) {
            $player = Player::find($data['player_id']);

            if ($player !== null && (int) $player->team_id !== (int) $data['team_id']) {
                return 'The player must belong to the selected team.';
            }
        }

        return null;
    }

    private function canManageStatistic(Statistic $statistic): bool
    {
        return $statistic->matchGame !== null
            && $this->canManageMatch($statistic->matchGame);
    }

    private function canManageMatch(MatchGame $matchGame): bool
    {
        return auth('api')->user()?->role === 'admin'
            || (int) $matchGame->tournament->created_by === (int) auth('api')->id();
    }
}
