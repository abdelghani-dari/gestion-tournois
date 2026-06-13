<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Statistic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticController extends Controller
{
    private const STAT_TYPES = 'goal,assist,yellow_card,red_card,clean_sheet';

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['sometimes', 'exists:match_games,id'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'player_id' => ['sometimes', 'exists:players,id'],
            'stat_type' => ['sometimes', 'in:'.self::STAT_TYPES],
        ]);

        $query = Statistic::with(['matchGame', 'team', 'player'])->latest();

        foreach (['match_game_id', 'team_id', 'player_id', 'stat_type'] as $field) {
            if (isset($validated[$field])) {
                $query->where($field, $validated[$field]);
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['nullable', 'exists:match_games,id'],
            'team_id' => ['nullable', 'exists:teams,id'],
            'player_id' => ['nullable', 'exists:players,id'],
            'stat_type' => ['required', 'in:'.self::STAT_TYPES],
            'value' => ['required', 'integer', 'min:1'],
        ]);

        $error = $this->validateStatisticContext($validated);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $statistic = Statistic::create($validated);

        return response()->json($statistic->load(['matchGame', 'team', 'player']), 201);
    }

    public function show(Statistic $statistic): JsonResponse
    {
        return response()->json($statistic->load(['matchGame', 'team', 'player']));
    }

    public function update(Request $request, Statistic $statistic): JsonResponse
    {
        $validated = $request->validate([
            'stat_type' => ['sometimes', 'required', 'in:'.self::STAT_TYPES],
            'value' => ['sometimes', 'required', 'integer', 'min:1'],
        ]);

        $statistic->update($validated);

        return response()->json($statistic->load(['matchGame', 'team', 'player']));
    }

    public function destroy(Statistic $statistic): JsonResponse
    {
        $statistic->delete();

        return response()->json(['message' => 'Statistic deleted.']);
    }

    private function validateStatisticContext(array $data): ?string
    {
        if (empty($data['match_game_id']) && empty($data['team_id']) && empty($data['player_id'])) {
            return 'At least one of match_game_id, team_id, or player_id must be provided.';
        }

        if (! empty($data['player_id']) && ! empty($data['team_id'])) {
            $player = Player::find($data['player_id']);

            if ($player !== null && (int) $player->team_id !== (int) $data['team_id']) {
                return 'The player must belong to the selected team.';
            }
        }

        if (! empty($data['match_game_id']) && ! empty($data['team_id'])) {
            $matchGame = MatchGame::find($data['match_game_id']);

            if ($matchGame !== null
                && ! in_array((int) $data['team_id'], [(int) $matchGame->home_team_id, (int) $matchGame->away_team_id], true)) {
                return 'The team must be one of the match teams.';
            }
        }

        return null;
    }
}
