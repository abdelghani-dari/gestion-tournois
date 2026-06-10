<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use App\Models\Team;
use Illuminate\Http\Request;

class JoinRequestController extends Controller
{
    public function index()
    {
        return response()->json(JoinRequest::with(['championship', 'tournament', 'team', 'manager'])->latest()->get());
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        if ($user->role !== 'team_manager') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'championship_id' => ['nullable', 'exists:championships,id'],
            'tournament_id' => ['nullable', 'exists:tournaments,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'message' => ['nullable', 'string'],
        ]);

        $team = Team::findOrFail($validated['team_id']);

        if ((int) $team->manager_id !== (int) $user->id) {
            return response()->json(['message' => 'You can only create join requests for your own team.'], 403);
        }

        if (empty($validated['championship_id']) === empty($validated['tournament_id'])) {
            return response()->json([
                'message' => 'A join request must belong to exactly one competition.',
            ], 422);
        }

        $joinRequest = JoinRequest::create([
            ...$validated,
            'manager_id' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($joinRequest, 201);
    }

    public function show(JoinRequest $joinRequest)
    {
        return response()->json($joinRequest->load(['championship', 'tournament', 'team', 'manager']));
    }

    public function accept(JoinRequest $joinRequest)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $joinRequest->update(['status' => 'accepted']);

        if ($joinRequest->championship_id) {
            $joinRequest->championship->teams()->syncWithoutDetaching([$joinRequest->team_id]);
        }

        if ($joinRequest->tournament_id) {
            $joinRequest->tournament->teams()->syncWithoutDetaching([$joinRequest->team_id]);
        }

        return response()->json([
            'message' => 'Join request accepted.',
            'join_request' => $joinRequest->load(['championship', 'tournament', 'team', 'manager']),
        ]);
    }

    public function refuse(JoinRequest $joinRequest)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $joinRequest->update(['status' => 'refused']);

        return response()->json([
            'message' => 'Join request refused.',
            'join_request' => $joinRequest->load(['championship', 'tournament', 'team', 'manager']),
        ]);
    }
}
