<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use Illuminate\Http\Request;

class JoinRequestController extends Controller
{
    public function index()
    {
        return response()->json(JoinRequest::with(['championship', 'tournament', 'team', 'manager'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'championship_id' => ['nullable', 'exists:championships,id'],
            'tournament_id' => ['nullable', 'exists:tournaments,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'manager_id' => ['required', 'exists:users,id'],
            'message' => ['nullable', 'string'],
        ]);

        if (empty($validated['championship_id']) === empty($validated['tournament_id'])) {
            return response()->json([
                'message' => 'A join request must belong to exactly one competition.',
            ], 422);
        }

        $joinRequest = JoinRequest::create([
            ...$validated,
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
        $joinRequest->update(['status' => 'refused']);

        return response()->json([
            'message' => 'Join request refused.',
            'join_request' => $joinRequest->load(['championship', 'tournament', 'team', 'manager']),
        ]);
    }
}
