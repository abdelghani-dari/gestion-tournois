<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class JoinRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => ['sometimes', 'exists:tournaments,id'],
            'manager_id' => ['sometimes', 'exists:users,id'],
            'status' => ['sometimes', 'string', 'max:255'],
        ]);

        $user = auth('api')->user();
        $query = JoinRequest::with(['tournament', 'team', 'manager'])->latest();

        // Admin sees all; non-admin users see requests for their tournaments plus their own outgoing requests.
        if ($user && $user->role !== 'admin') {
            $myTournamentIds = Tournament::where('created_by', $user->id)->pluck('id');

            if ($myTournamentIds->isEmpty()) {
                $query->where('manager_id', $user->id);
            } else {
                $query->where(function ($query) use ($myTournamentIds, $user): void {
                    $query
                        ->whereIn('tournament_id', $myTournamentIds)
                        ->orWhere('manager_id', $user->id);
                });
            }
        }

        if (isset($validated['tournament_id'])) {
            $query->where('tournament_id', $validated['tournament_id']);
        }

        if (isset($validated['manager_id'])) {
            $query->where('manager_id', $validated['manager_id']);
        }

        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'message' => ['nullable', 'string'],
        ]);

        $tournament = Tournament::findOrFail($validated['tournament_id']);
        $team = Team::findOrFail($validated['team_id']);

        if ($tournament->approval_status !== 'accepted') {
            return response()->json(['message' => 'Tournament must be accepted before teams can request participation.'], 422);
        }

        if (! in_array($tournament->status, ['open', 'active'], true)) {
            return response()->json(['message' => 'Tournament must be open or active before teams can request participation.'], 422);
        }

        if ((int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'The manager does not own this team.'], 422);
        }

        $alreadyRequested = JoinRequest::where('tournament_id', $validated['tournament_id'])
            ->where('team_id', $validated['team_id'])
            ->exists();

        if ($alreadyRequested) {
            return response()->json(['message' => 'This team already has a join request for this tournament.'], 422);
        }

        if ($tournament->teams()->where('teams.id', $validated['team_id'])->exists()) {
            return response()->json(['message' => 'This team is already in the tournament.'], 422);
        }

        $joinRequest = JoinRequest::create([
            ...$validated,
            'manager_id' => auth('api')->id(),
            'status' => 'pending',
        ]);

        return response()->json($joinRequest->load(['tournament', 'team', 'manager']), 201);
    }

    public function show(JoinRequest $joinRequest): JsonResponse
    {
        return response()->json($joinRequest->load(['tournament', 'team', 'manager']));
    }

    public function accept(JoinRequest $joinRequest): JsonResponse
    {
        if (! $this->isAdmin() && (int) $joinRequest->tournament->created_by !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending join requests can be accepted.'], 422);
        }

        $joinRequest->update(['status' => 'accepted']);
        $joinRequest->tournament->teams()->syncWithoutDetaching([$joinRequest->team_id]);
        Cache::forget('public:tournaments');
        Cache::forget("tournament:{$joinRequest->tournament_id}:details");

        return response()->json($joinRequest->load(['tournament', 'team', 'manager']));
    }

    public function refuse(JoinRequest $joinRequest): JsonResponse
    {
        if (! $this->isAdmin() && (int) $joinRequest->tournament->created_by !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending join requests can be refused.'], 422);
        }

        $joinRequest->update(['status' => 'refused']);
        Cache::forget("tournament:{$joinRequest->tournament_id}:details");

        return response()->json($joinRequest->load(['tournament', 'team', 'manager']));
    }

    private function isAdmin(): bool
    {
        return auth('api')->user()?->role === 'admin';
    }
}
