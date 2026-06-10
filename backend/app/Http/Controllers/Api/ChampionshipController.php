<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use Illuminate\Http\Request;

class ChampionshipController extends Controller
{
    public function index()
    {
        return response()->json(Championship::with(['season', 'creator'])->get());
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
            'status' => ['required', 'in:draft,active,finished'],
        ]);

        $validated['created_by'] = $user->id;

        if ($user->role === 'organizer') {
            if ($validated['level'] !== 'local') {
                return response()->json(['message' => 'Organizers can only create local championships.'], 403);
            }

            $validated['source'] = 'user_created';
        }

        $championship = Championship::create($validated);

        return response()->json($championship, 201);
    }

    public function show(Championship $championship)
    {
        return response()->json($championship->load(['season', 'creator', 'teams']));
    }

    public function update(Request $request, Championship $championship)
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
            'status' => ['sometimes', 'required', 'in:draft,active,finished'],
        ]);

        if ($user->role === 'organizer') {
            $level = $validated['level'] ?? $championship->level;

            if ($level !== 'local') {
                return response()->json(['message' => 'Organizers can only manage local championships.'], 403);
            }

            $validated['source'] = 'user_created';
        }

        $championship->update($validated);

        return response()->json($championship->load(['season', 'creator', 'teams']));
    }

    public function destroy(Championship $championship)
    {
        $user = auth('api')->user();

        if (! in_array($user->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role === 'organizer' && $championship->level !== 'local') {
            return response()->json(['message' => 'Organizers can only delete local championships.'], 403);
        }

        $championship->delete();

        return response()->json(null, 204);
    }
}
