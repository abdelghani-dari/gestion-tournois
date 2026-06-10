<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    public function index()
    {
        return response()->json(Tournament::with(['season', 'creator'])->get());
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        if (! in_array($user->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'season_id' => ['required', 'exists:seasons,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'level' => ['required', 'in:international,national,local'],
            'source' => ['required', 'in:official,user_created'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'in:draft,active,finished'],
        ]);

        $validated['created_by'] = $user->id;

        if ($user->role === 'organizer') {
            if ($validated['level'] !== 'local') {
                return response()->json(['message' => 'Organizers can only create local tournaments.'], 403);
            }

            $validated['source'] = 'user_created';
        }

        $tournament = Tournament::create($validated);

        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament)
    {
        return response()->json($tournament->load(['season', 'creator', 'teams']));
    }

    public function update(Request $request, Tournament $tournament)
    {
        $user = auth('api')->user();

        if (! in_array($user->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'season_id' => ['sometimes', 'required', 'exists:seasons,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'level' => ['sometimes', 'required', 'in:international,national,local'],
            'source' => ['sometimes', 'required', 'in:official,user_created'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'in:draft,active,finished'],
        ]);

        if ($user->role === 'organizer') {
            $level = $validated['level'] ?? $tournament->level;

            if ($level !== 'local') {
                return response()->json(['message' => 'Organizers can only manage local tournaments.'], 403);
            }

            $validated['source'] = 'user_created';
        }

        $tournament->update($validated);

        return response()->json($tournament->load(['season', 'creator', 'teams']));
    }

    public function destroy(Tournament $tournament)
    {
        $user = auth('api')->user();

        if (! in_array($user->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role === 'organizer' && $tournament->level !== 'local') {
            return response()->json(['message' => 'Organizers can only delete local tournaments.'], 403);
        }

        $tournament->delete();

        return response()->json(null, 204);
    }
}
