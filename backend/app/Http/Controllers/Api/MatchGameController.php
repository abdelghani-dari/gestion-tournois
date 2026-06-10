<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use Illuminate\Http\Request;

class MatchGameController extends Controller
{
    public function index()
    {
        return response()->json(MatchGame::with(['championship', 'tournament', 'creator', 'homeTeam', 'awayTeam'])->latest()->get());
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        if (! in_array($user->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'championship_id' => ['nullable', 'exists:championships,id'],
            'tournament_id' => ['nullable', 'exists:tournaments,id'],
            'created_by' => ['nullable', 'exists:users,id'],
            'home_team_id' => ['required', 'exists:teams,id'],
            'away_team_id' => ['required', 'exists:teams,id', 'different:home_team_id'],
            'match_date' => ['required', 'date'],
            'home_score' => ['nullable', 'integer', 'min:0'],
            'away_score' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:scheduled,played,cancelled'],
            'result_status' => ['nullable', 'in:pending,confirmed,disputed'],
        ]);

        if (empty($validated['championship_id']) === empty($validated['tournament_id'])) {
            return response()->json([
                'message' => 'A match must belong to exactly one competition.',
            ], 422);
        }

        $validated['created_by'] = $validated['created_by'] ?? $user->id;

        $matchGame = MatchGame::create($validated);

        return response()->json($matchGame, 201);
    }

    public function show(MatchGame $matchGame)
    {
        return response()->json($matchGame->load(['championship', 'tournament', 'creator', 'homeTeam', 'awayTeam', 'compositions', 'statistics']));
    }

    public function update(Request $request, MatchGame $matchGame)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'championship_id' => ['sometimes', 'nullable', 'exists:championships,id'],
            'tournament_id' => ['sometimes', 'nullable', 'exists:tournaments,id'],
            'created_by' => ['sometimes', 'nullable', 'exists:users,id'],
            'home_team_id' => ['sometimes', 'required', 'exists:teams,id'],
            'away_team_id' => ['sometimes', 'required', 'exists:teams,id', 'different:home_team_id'],
            'match_date' => ['sometimes', 'required', 'date'],
            'home_score' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'away_score' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'required', 'in:scheduled,played,cancelled'],
            'result_status' => ['sometimes', 'nullable', 'in:pending,confirmed,disputed'],
        ]);

        $championshipId = $validated['championship_id'] ?? $matchGame->championship_id;
        $tournamentId = $validated['tournament_id'] ?? $matchGame->tournament_id;

        if (array_key_exists('championship_id', $validated)) {
            $championshipId = $validated['championship_id'];
        }

        if (array_key_exists('tournament_id', $validated)) {
            $tournamentId = $validated['tournament_id'];
        }

        if (empty($championshipId) === empty($tournamentId)) {
            return response()->json([
                'message' => 'A match must belong to exactly one competition.',
            ], 422);
        }

        $matchGame->update($validated);

        return response()->json($matchGame->load(['championship', 'tournament', 'creator', 'homeTeam', 'awayTeam', 'compositions', 'statistics']));
    }

    public function destroy(MatchGame $matchGame)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $matchGame->delete();

        return response()->json(null, 204);
    }

    public function updateResult(Request $request, MatchGame $matchGame)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'home_score' => ['required', 'integer', 'min:0'],
            'away_score' => ['required', 'integer', 'min:0'],
        ]);

        $matchGame->update([
            'home_score' => $validated['home_score'],
            'away_score' => $validated['away_score'],
            'status' => 'played',
            'result_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Match result updated.',
            'match' => $matchGame->load(['championship', 'tournament', 'creator', 'homeTeam', 'awayTeam']),
        ]);
    }

    public function confirmResult(MatchGame $matchGame)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $matchGame->update(['result_status' => 'confirmed']);

        return response()->json([
            'message' => 'Match result confirmed.',
            'match' => $matchGame->load(['championship', 'tournament', 'creator', 'homeTeam', 'awayTeam']),
        ]);
    }

    public function disputeResult(MatchGame $matchGame)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $matchGame->update(['result_status' => 'disputed']);

        return response()->json([
            'message' => 'Match result disputed.',
            'match' => $matchGame->load(['championship', 'tournament', 'creator', 'homeTeam', 'awayTeam']),
        ]);
    }
}
