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
            'created_by' => auth('api')->id(),
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
        if ((int) $tournament->created_by !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

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
        if ((int) $tournament->created_by !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $tournament->delete();

        return response()->json(['message' => 'Tournament deleted.']);
    }

    public function myTournaments(): JsonResponse
    {
        return response()->json(
            Tournament::where('created_by', auth('api')->id())->latest()->get()
        );
    }
}
