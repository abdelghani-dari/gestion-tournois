<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Season;
use Illuminate\Http\Request;

class SeasonController extends Controller
{
    public function index()
    {
        return response()->json(Season::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'in:upcoming,active,closed'],
        ]);

        $season = Season::create($validated);

        return response()->json($season, 201);
    }

    public function show(Season $season)
    {
        return response()->json($season);
    }

    public function update(Request $request, Season $season)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'in:upcoming,active,closed'],
        ]);

        $season->update($validated);

        return response()->json($season);
    }

    public function destroy(Season $season)
    {
        $season->delete();

        return response()->json(null, 204);
    }
}
