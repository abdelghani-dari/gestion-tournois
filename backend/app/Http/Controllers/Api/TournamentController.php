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
        $validated = $request->validate([
            'season_id' => ['required', 'exists:seasons,id'],
            'created_by' => ['nullable', 'exists:users,id'],
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

        $tournament = Tournament::create($validated);

        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament)
    {
        return response()->json($tournament->load(['season', 'creator', 'teams']));
    }

    public function update(Request $request, Tournament $tournament)
    {
        $validated = $request->validate([
            'season_id' => ['sometimes', 'required', 'exists:seasons,id'],
            'created_by' => ['sometimes', 'nullable', 'exists:users,id'],
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

        $tournament->update($validated);

        return response()->json($tournament->load(['season', 'creator', 'teams']));
    }

    public function destroy(Tournament $tournament)
    {
        $tournament->delete();

        return response()->json(null, 204);
    }
}
