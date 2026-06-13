<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Tournament::where('approval_status', 'accepted')->latest()->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'created_by' => ['required', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $tournament = Tournament::create([
            ...$validated,
            'status' => 'draft',
            'approval_status' => 'pending',
            'admin_note' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);

        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament): JsonResponse
    {
        return response()->json($tournament->load(['creator', 'approvedBy']));
    }

    public function update(Request $request, Tournament $tournament): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $tournament->update($validated);

        return response()->json($tournament);
    }

    public function destroy(Tournament $tournament): JsonResponse
    {
        $tournament->delete();

        return response()->json(['message' => 'Tournament deleted.']);
    }
}
