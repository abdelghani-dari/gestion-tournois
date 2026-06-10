<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use Illuminate\Http\Request;

class ChampionshipController extends Controller
{
    public function index()
    {
        return response()->json(Championship::with('season')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'season_id' => ['required', 'exists:seasons,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,active,finished'],
        ]);

        $championship = Championship::create($validated);

        return response()->json($championship, 201);
    }

    public function show(Championship $championship)
    {
        return response()->json($championship->load(['season', 'teams']));
    }

    public function update(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'season_id' => ['sometimes', 'required', 'exists:seasons,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:draft,active,finished'],
        ]);

        $championship->update($validated);

        return response()->json($championship->load(['season', 'teams']));
    }

    public function destroy(Championship $championship)
    {
        $championship->delete();

        return response()->json(null, 204);
    }
}
