<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Composition;
use App\Models\MatchGame;
use App\Models\Player;
use Illuminate\Http\Request;

class CompositionController extends Controller
{
    public function index(Request $request)
    {
        $query = Composition::with(['matchGame', 'team', 'player']);

        if ($request->filled('match_game_id')) {
            $query->where('match_game_id', $request->query('match_game_id'));
        }

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->query('team_id'));
        }

        if ($request->filled('player_id')) {
            $query->where('player_id', $request->query('player_id'));
        }

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'match_game_id' => ['required', 'exists:match_games,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'player_id' => ['required', 'exists:players,id'],
            'role' => ['required', 'in:starter,substitute'],
        ]);

        $error = $this->validateCompositionData($validated);

        if ($error) {
            return response()->json(['message' => $error], 422);
        }

        $composition = Composition::create($validated);

        return response()->json($composition->load(['matchGame', 'team', 'player']), 201);
    }

    public function show(Composition $composition)
    {
        return response()->json($composition->load(['matchGame', 'team', 'player']));
    }

    public function update(Request $request, Composition $composition)
    {
        $validated = $request->validate([
            'match_game_id' => ['sometimes', 'exists:match_games,id'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'player_id' => ['sometimes', 'exists:players,id'],
            'role' => ['sometimes', 'in:starter,substitute'],
        ]);

        $data = array_merge($composition->only(['match_game_id', 'team_id', 'player_id', 'role']), $validated);
        $error = $this->validateCompositionData($data, $composition);

        if ($error) {
            return response()->json(['message' => $error], 422);
        }

        $composition->update($validated);

        return response()->json($composition->load(['matchGame', 'team', 'player']));
    }

    public function destroy(Composition $composition)
    {
        $composition->delete();

        return response()->json(['message' => 'Composition deleted.']);
    }

    private function validateCompositionData(array $data, ?Composition $composition = null): ?string
    {
        $matchGame = MatchGame::find($data['match_game_id']);
        $player = Player::find($data['player_id']);

        if ($player->team_id !== (int) $data['team_id']) {
            return 'The selected player must belong to the selected team.';
        }

        if (! in_array((int) $data['team_id'], [(int) $matchGame->home_team_id, (int) $matchGame->away_team_id], true)) {
            return 'The selected team must be either the home team or away team of the selected match.';
        }

        $duplicateQuery = Composition::where('match_game_id', $data['match_game_id'])
            ->where('player_id', $data['player_id']);

        if ($composition) {
            $duplicateQuery->where('id', '!=', $composition->id);
        }

        if ($duplicateQuery->exists()) {
            return 'The same player cannot be added twice to the same match.';
        }

        if ($data['role'] === 'starter') {
            $starterQuery = Composition::where('match_game_id', $data['match_game_id'])
                ->where('team_id', $data['team_id'])
                ->where('role', 'starter');

            if ($composition) {
                $starterQuery->where('id', '!=', $composition->id);
            }

            if ($starterQuery->count() >= 11) {
                return 'A team cannot have more than 11 starters in the same match.';
            }
        }

        return null;
    }
}
