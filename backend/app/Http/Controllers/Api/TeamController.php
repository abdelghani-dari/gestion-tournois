<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        return response()->json(Team::with('manager')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'manager_id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
        ]);

        $team = Team::create($validated);

        return response()->json($team, 201);
    }

    public function show(Team $team)
    {
        return response()->json($team->load(['manager', 'players']));
    }

    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'manager_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $team->update($validated);

        return response()->json($team->load(['manager', 'players']));
    }

    public function destroy(Team $team)
    {
        $team->delete();

        return response()->json(null, 204);
    }
}
