<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Statistic;
use Illuminate\Http\Request;

class StatisticController extends Controller
{
    public function index(Request $request)
    {
        $query = Statistic::with(['matchGame', 'team', 'player']);

        if ($request->filled('match_game_id')) {
            $query->where('match_game_id', $request->query('match_game_id'));
        }

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->query('team_id'));
        }

        if ($request->filled('player_id')) {
            $query->where('player_id', $request->query('player_id'));
        }

        if ($request->filled('stat_type')) {
            $query->where('stat_type', $request->query('stat_type'));
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'match_game_id' => ['nullable', 'exists:match_games,id'],
            'team_id' => ['nullable', 'exists:teams,id'],
            'player_id' => ['nullable', 'exists:players,id'],
            'stat_type' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['team_id']) && empty($validated['player_id'])) {
            return response()->json([
                'message' => 'At least one of team_id or player_id is required.',
            ], 422);
        }

        $validated['value'] = $validated['value'] ?? 1;

        $statistic = Statistic::create($validated);

        return response()->json($statistic->load(['matchGame', 'team', 'player']), 201);
    }

    public function show(Statistic $statistic)
    {
        return response()->json($statistic->load(['matchGame', 'team', 'player']));
    }

    public function destroy(Statistic $statistic)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $statistic->delete();

        return response()->json(['message' => 'Statistic deleted.']);
    }
}
