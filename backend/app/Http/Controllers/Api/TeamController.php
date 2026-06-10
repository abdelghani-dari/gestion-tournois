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
        $user = auth('api')->user();

        if (! in_array($user->role, ['admin', 'organizer', 'team_manager'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'manager_id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['manager_id'] = $validated['manager_id'] ?? $user->id;

        if ($user->role === 'team_manager') {
            $validated['manager_id'] = $user->id;
        }

        $team = Team::create($validated);

        return response()->json($team, 201);
    }

    public function show(Team $team)
    {
        return response()->json($team->load(['manager', 'players']));
    }

    public function update(Request $request, Team $team)
    {
        $user = auth('api')->user();

        if (! $this->canManageTeam($user, $team)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'manager_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (in_array($user->role, ['organizer', 'team_manager'], true)) {
            $validated['manager_id'] = $user->id;
        }

        $team->update($validated);

        return response()->json($team->load(['manager', 'players']));
    }

    public function destroy(Team $team)
    {
        if (! $this->canManageTeam(auth('api')->user(), $team)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $team->delete();

        return response()->json(null, 204);
    }

    private function canManageTeam($user, Team $team): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return in_array($user->role, ['organizer', 'team_manager'], true)
            && (int) $team->manager_id === (int) $user->id;
    }
}
