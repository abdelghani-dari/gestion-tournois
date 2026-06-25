<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Composition;
use App\Models\MatchGame;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompositionController extends Controller
{
    private const ROLES = 'starter,substitute';

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['sometimes', 'exists:match_games,id'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'player_id' => ['sometimes', 'exists:players,id'],
            'role' => ['sometimes', 'in:'.self::ROLES],
        ]);

        $query = Composition::with(['matchGame', 'team', 'player'])->latest();

        foreach (['match_game_id', 'team_id', 'player_id', 'role'] as $field) {
            if (isset($validated[$field])) {
                $query->where($field, $validated[$field]);
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['required', 'exists:match_games,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'player_id' => ['required', 'exists:players,id'],
            'role' => ['required', 'in:'.self::ROLES],
        ]);

        $matchGame = MatchGame::with('tournament')->findOrFail($validated['match_game_id']);

        if (! $this->canManageMatch($matchGame)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player = Player::findOrFail($validated['player_id']);
        $error = $this->validateCompositionContext($matchGame, $player, (int) $validated['team_id']);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        if ($this->playerAlreadySelected($matchGame, $player)) {
            return response()->json(['message' => 'The player is already selected for this match.'], 422);
        }

        $composition = Composition::create($validated);

        return response()->json($composition->load(['matchGame', 'team', 'player']), 201);
    }

    public function show(Composition $composition): JsonResponse
    {
        return response()->json($composition->load(['matchGame', 'team', 'player']));
    }

    public function update(Request $request, Composition $composition): JsonResponse
    {
        $composition->load('matchGame.tournament');

        if (! $this->canManageMatch($composition->matchGame)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'role' => ['sometimes', 'required', 'in:'.self::ROLES],
        ]);

        $composition->update($validated);

        return response()->json($composition->load(['matchGame', 'team', 'player']));
    }

    public function destroy(Composition $composition): JsonResponse
    {
        $composition->load('matchGame.tournament');

        if (! $this->canManageMatch($composition->matchGame)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $composition->delete();

        return response()->json(['message' => 'Composition deleted.']);
    }

    private function validateCompositionContext(MatchGame $matchGame, Player $player, int $teamId): ?string
    {
        if ((int) $player->team_id !== $teamId) {
            return 'The player must belong to the selected team.';
        }

        if (! in_array($teamId, [(int) $matchGame->home_team_id, (int) $matchGame->away_team_id], true)) {
            return 'The team must be one of the match teams.';
        }

        return null;
    }

    private function playerAlreadySelected(MatchGame $matchGame, Player $player): bool
    {
        return Composition::where('match_game_id', $matchGame->id)
            ->where('player_id', $player->id)
            ->exists();
    }

    private function canManageMatch(MatchGame $matchGame): bool
    {
        return (int) $matchGame->tournament->created_by === (int) auth('api')->id();
    }
}