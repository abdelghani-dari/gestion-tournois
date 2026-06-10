<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function index()
    {
        return response()->json(Player::with('team')->get());
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:0'],
            'photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        if (! $this->canManageTeam($user, Team::findOrFail($validated['team_id']))) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player = Player::create($validated);

        return response()->json($player, 201);
    }

    public function show(Player $player)
    {
        return response()->json($player->load('team'));
    }

    public function update(Request $request, Player $player)
    {
        $user = auth('api')->user();

        if (! $this->canManageTeam($user, $player->team)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'team_id' => ['sometimes', 'required', 'exists:teams,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'position' => ['sometimes', 'nullable', 'string', 'max:255'],
            'number' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'photo_path' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (isset($validated['team_id']) && ! $this->canManageTeam($user, Team::findOrFail($validated['team_id']))) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player->update($validated);

        return response()->json($player->load('team'));
    }

    public function destroy(Player $player)
    {
        if (! $this->canManageTeam(auth('api')->user(), $player->team)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player->delete();

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
